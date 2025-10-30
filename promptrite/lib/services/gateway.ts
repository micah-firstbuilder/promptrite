import { generateObject } from "ai";
import { z } from "zod";
import type { ChallengeContext } from "@/types/challenges";

// Define the scoring result schema for AI SDK structured output
const scoringSchema = z.object({
  compositeScore: z.number().int().min(0).max(100),
  // Optional per-goal structured evaluation returned by the model
  perGoal: z
    .array(
      z.object({
        goalId: z.string(),
        title: z.string(),
        score: z.number().int().min(0).max(100),
        met: z.boolean().optional(),
        explanation: z.string().optional(),
      })
    )
    .optional(),
  dimensions: z.object({
    messageCount: z.number().int().min(0).max(100).optional(),
    clarity: z.number().int().min(0).max(100).optional(),
    characterLength: z.number().int().min(0).max(100).optional(),
    outputQuality: z.number().int().min(0).max(100).optional(),
  }),
  explanations: z
    .object({
      messageCount: z.string().optional(),
      clarity: z.string().optional(),
      characterLength: z.string().optional(),
      outputQuality: z.string().optional(),
    })
    .optional(),
});

export type ScoringResult = z.infer<typeof scoringSchema>;

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ScoreConversationParams {
  conversation: ConversationMessage[];
  challengeId: string;
  attemptId?: string;
  modelOverride?: string;
  challenge?: ChallengeContext;
}

interface ConversationMetrics {
  messageCount: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  averageMessageLength: number;
}

export interface ScoringResponse extends ScoringResult {
  conversationMetrics: ConversationMetrics;
  goalAlignment?: number;
}

export async function scoreConversation(
  params: ScoreConversationParams
): Promise<ScoringResponse> {
  const { conversation, modelOverride, challenge } = params;

  // Calculate metrics
  const messageCount = conversation.length;
  const totalCharLength = conversation.reduce(
    (sum, msg) => sum + msg.content.length,
    0
  );
  const averageMessageLength = Math.round(totalCharLength / messageCount);

  // Format conversation for the LLM
  const conversationText = conversation
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join("\n\n");

  // Create the scoring prompt (task-aware when challenge goals are provided)
  const taskHeader = challenge
    ? `Task: ${challenge.title} — ${challenge.description}`
    : undefined;
  const goalsSection =
    challenge && challenge.goals.length > 0
      ? `Goals:\n${challenge.goals
          .map(
            (g, idx) =>
              `${idx + 1}) ${g.title} (id=${g.id}, weight=${g.weight ?? 1}, critical=${g.critical ?? false}) — Criteria: ${g.criteria}`
          )
          .join("\n")}`
      : undefined;

  const baseInstructions = `You are an AI evaluator. Evaluate the conversation against the task and its goals when provided.

When goals are provided, produce per-goal scores (0-100) with a one-sentence explanation for each. Also rate clarity and outputQuality (0-100). Additionally include a compositeScore field; it should reflect primarily goal alignment.

Return ONLY JSON matching the schema.`;

  const contextSection = [taskHeader, goalsSection]
    .filter(Boolean)
    .join("\n\n");

  const genericDimensionsSection = `Quality dimensions to consider:
1. Message Count (observed: ${messageCount})
2. Clarity
3. Character Length (observed: ${totalCharLength} total, avg ${averageMessageLength})
4. Output Quality`;

  const scoringPrompt = `${baseInstructions}

${contextSection ? `${contextSection}\n\n` : ""}${genericDimensionsSection}

Conversation to evaluate:
${conversationText}`;

  try {
    // Resolve target model. AI Gateway should be configured via environment to route this provider.
    const modelName =
      modelOverride || process.env.FIREWORKS_MODEL || "llama-v3-70b-instruct";
    const model = "openai/gpt-5-mini";

    const response = await generateObject({
      model,
      schema: scoringSchema,
      prompt: scoringPrompt,
      temperature: 0.3,
    });

    // Extract token usage
    const inputTokens = response.usage.inputTokens ?? 0;
    const outputTokens = response.usage.outputTokens ?? 0;
    const totalTokens =
      response.usage.totalTokens ?? inputTokens + outputTokens;

    const parsedResult = response.object as ScoringResult & {
      perGoal?: Array<{
        goalId: string;
        title: string;
        score: number;
        met?: boolean;
        explanation?: string;
      }>;
    };

    // Compute goal-based alignment and composite if goals are present
    let goalAlignment: number | undefined;
    let compositeScoreComputed: number | undefined;

    if (
      challenge &&
      Array.isArray(challenge.goals) &&
      challenge.goals.length > 0 &&
      Array.isArray(parsedResult.perGoal) &&
      parsedResult.perGoal.length > 0
    ) {
      // Build a lookup for goal weights and critical flags
      const weightsById = new Map<string, number>();
      const criticalById = new Map<string, boolean>();
      for (const g of challenge.goals) {
        weightsById.set(
          g.id,
          typeof g.weight === "number" && Number.isFinite(g.weight)
            ? g.weight
            : 1
        );
        criticalById.set(g.id, Boolean(g.critical));
      }

      let weightedSum = 0;
      let weightsTotal = 0;
      let criticalFail = false;
      for (const pg of parsedResult.perGoal) {
        const w = weightsById.get(pg.goalId) ?? 1;
        weightedSum += pg.score * w;
        weightsTotal += w;
        if (criticalById.get(pg.goalId) && pg.score < 60) {
          criticalFail = true;
        }
      }
      if (weightsTotal > 0) {
        goalAlignment = Math.round(weightedSum / weightsTotal);
      }

      // Quality average from dimensions (if provided)
      const clarity = parsedResult.dimensions?.clarity;
      const outputQuality = parsedResult.dimensions?.outputQuality;
      const qualityScores: number[] = [];
      if (typeof clarity === "number") qualityScores.push(clarity);
      if (typeof outputQuality === "number") qualityScores.push(outputQuality);
      const qualityAvg =
        qualityScores.length > 0
          ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
          : undefined;

      const baseComposite =
        goalAlignment !== undefined
          ? qualityAvg !== undefined
            ? 0.8 * goalAlignment + 0.2 * qualityAvg
            : goalAlignment
          : parsedResult.compositeScore;

      let finalComposite = Math.round(baseComposite);
      if (criticalFail && finalComposite > 60) {
        finalComposite = 60;
      }
      compositeScoreComputed = finalComposite;
    }

    return {
      ...parsedResult,
      compositeScore: compositeScoreComputed ?? parsedResult.compositeScore,
      goalAlignment,
      conversationMetrics: {
        messageCount,
        totalTokens,
        inputTokens,
        outputTokens,
        averageMessageLength,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Scoring error:", errorMessage);

    // Return partial result on error
    return {
      compositeScore: 0,
      dimensions: {},
      explanations: {
        clarity: `Scoring error: ${errorMessage}`,
      },
      conversationMetrics: {
        messageCount,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        averageMessageLength,
      },
    };
  }
}
