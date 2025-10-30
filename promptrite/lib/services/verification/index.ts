import {
  calculateSimilarity,
  summarizeChallengeContext,
} from "@/lib/services/embeddings";
import { scoreConversation } from "@/lib/services/gateway";
import type { ChallengeContext } from "@/types/challenges";
import {
  type IVerifier,
  routeVerifierByCategory,
  type VerifierContext,
  type VerifierType,
} from "./registry";
import { codeVerifier } from "./verifiers/code";
import { multimodalVerifier } from "./verifiers/multimodal";
import { textVerifier } from "./verifiers/text";

/**
 * Verifier registry - map verifier types to verifier instances.
 */
const verifierRegistry: Record<VerifierType, IVerifier> = {
  code: codeVerifier,
  text: textVerifier,
  multimodal: multimodalVerifier,
};

/**
 * Verification result combining all scoring dimensions.
 */
export interface VerificationResult {
  llm: {
    score: number; // 0-100
    model: string;
    compositeScore?: number;
    perGoal?: Array<{
      goalId: string;
      title: string;
      score: number;
      met?: boolean;
    }>;
  };
  embedding: {
    score: number; // 0-100 (0-1 similarity scaled)
    model: string;
    usage: { tokens: number };
    cached: boolean;
  };
  verifier: {
    type: VerifierType;
    score: number; // 0-100
    details: {
      checks: Array<{
        name: string;
        passed: boolean;
        message?: string;
      }>;
      metadata?: Record<string, unknown>;
    };
  };
  composite: {
    score: number; // 0-100, final weighted score
    passed: boolean;
    weights: {
      llm: number;
      embedding: number;
      verifier: number;
    };
    criticalGoalsMet?: boolean;
  };
}

/**
 * Run the full verification orchestration: LLM judge + embedding similarity + verifier.
 * Combines results into a composite score.
 */
export async function runVerification(options: {
  challenge: ChallengeContext;
  output: string;
  submissionType?: string;
}): Promise<VerificationResult> {
  const { challenge, output, submissionType } = options;

  // Route to verifier based on challenge category
  const verifierType = routeVerifierByCategory(challenge.category || "text");
  const verifier = verifierRegistry[verifierType];

  if (!verifier) {
    throw new Error(`No verifier found for type: ${verifierType}`);
  }

  // Build verifier context
  const verifierContext: VerifierContext = {
    challengeTitle: challenge.title,
    challengeDescription: challenge.description,
    challengeGoals: challenge.goals?.map((g: any) => ({
      title: g.title,
      criteria: g.criteria,
    })),
    output,
    submissionType,
  };

  // Run verifier, LLM judge, and embedding similarity in parallel
  const [verifierResult, llmResult, embeddingResult] = await Promise.all([
    verifier.verify(verifierContext),
    judgeLLM(challenge, output),
    computeEmbeddingSimilarity(challenge, output),
  ]);

  // Compute composite score with weighting
  // embeddingResult has 'similarity', which gets converted to 'score' in the return object
  const composite = computeCompositeScore(
    llmResult.compositeScore || 0,
    Math.round(embeddingResult.similarity * 100),
    verifierResult.score,
    llmResult.perGoal
  );

  return {
    llm: {
      score: llmResult.compositeScore || 0,
      model: llmResult.model,
      compositeScore: llmResult.compositeScore,
      perGoal: llmResult.perGoal,
    },
    embedding: {
      score: Math.round(embeddingResult.similarity * 100),
      model: "text-embedding-004",
      usage: embeddingResult.usage,
      cached: embeddingResult.cached,
    },
    verifier: {
      type: verifierType,
      score: verifierResult.score,
      details: verifierResult.details,
    },
    composite,
  };
}

/**
 * Judge output using the gateway LLM (existing scoreConversation).
 */
async function judgeLLM(challenge: ChallengeContext, output: string) {
  const prompt = `You are evaluating a user's submission against a challenge.

Challenge: ${challenge.title}
Description: ${challenge.description}
${
  challenge.goals && challenge.goals.length > 0
    ? `Goals:\n${challenge.goals
        .map(
          (g: any, i: number) =>
            `${i + 1}. ${g.title} (weight=${g.weight ?? 1}, critical=${g.critical ?? false}): ${g.criteria}`
        )
        .join("\n")}`
    : ""
}

User Output:
${output}

Evaluate the output against the challenge and goals. Provide per-goal scores (0-100) and a composite score (0-100).`;

  try {
    const result = await scoreConversation({
      conversation: [
        { role: "user", content: prompt },
        { role: "assistant", content: "Evaluating..." },
      ],
      challengeId: String(challenge.id),
      challenge,
    });

    return {
      model: "openai/gpt-5-mini", // from gateway default
      compositeScore: result.compositeScore ?? 0,
      perGoal: result.perGoal,
    };
  } catch (error) {
    console.error("LLM judgment error:", error);
    return {
      model: "error",
      compositeScore: 0,
      perGoal: undefined,
    };
  }
}

/**
 * Compute embedding similarity between challenge prompt and output.
 */
async function computeEmbeddingSimilarity(
  challenge: ChallengeContext,
  output: string
) {
  try {
    const promptContext = summarizeChallengeContext({
      title: challenge.title,
      description: challenge.description,
      goals: challenge.goals?.map((g: any) => ({
        title: g.title,
        criteria: g.criteria,
      })),
    });

    const result = await calculateSimilarity(promptContext, output);
    return {
      similarity: result.similarity,
      usage: result.usage,
      cached: false,
    };
  } catch (error) {
    console.error("Embedding similarity error:", error);
    return {
      similarity: 0,
      usage: { tokens: 0 },
      cached: false,
    };
  }
}

/**
 * Compute weighted composite score from three dimensions.
 * Default weights: 60% LLM, 20% embedding, 20% verifier.
 * Renormalizes if any dimension is unavailable.
 */
function computeCompositeScore(
  llmScore: number,
  embeddingScore: number,
  verifierScore: number,
  perGoal?: Array<{
    goalId?: string;
    score?: number;
    critical?: boolean;
    met?: boolean;
  }>
): {
  score: number;
  passed: boolean;
  weights: { llm: number; embedding: number; verifier: number };
  criticalGoalsMet?: boolean;
} {
  let weights = { llm: 0.6, embedding: 0.2, verifier: 0.2 };

  // Renormalize if any score is invalid/missing
  let validCount = 0;
  if (llmScore > 0) validCount++;
  if (embeddingScore > 0) validCount++;
  if (verifierScore > 0) validCount++;

  if (validCount < 3) {
    const baseWeight = validCount > 0 ? 1 / validCount : 0;
    weights = {
      llm: llmScore > 0 ? baseWeight : 0,
      embedding: embeddingScore > 0 ? baseWeight : 0,
      verifier: verifierScore > 0 ? baseWeight : 0,
    };
  }

  // Compute weighted average
  const composite = Math.round(
    weights.llm * llmScore +
      weights.embedding * embeddingScore +
      weights.verifier * verifierScore
  );

  // Check if critical goals are met
  let criticalGoalsMet = true;
  if (perGoal && perGoal.length > 0) {
    const criticalGoals = perGoal.filter((g) => g.critical);
    if (criticalGoals.length > 0) {
      criticalGoalsMet = criticalGoals.every((g) => g.met !== false);
    }
  }

  // Pass if composite >= 70 and critical goals are met
  const passed = composite >= 70 && criticalGoalsMet;

  return {
    score: composite,
    passed,
    weights,
    criticalGoalsMet,
  };
}

/**
 * Export verifier registry for testing/debugging.
 */
export { verifierRegistry };
