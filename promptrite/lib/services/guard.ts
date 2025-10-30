import { TRPCError } from "@trpc/server";
import { generateObject } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { challenges as Challenges, db } from "@/lib/db";
import { normalizeGoals } from "@/lib/utils/challenges";
import type { ChallengeContext } from "@/types/challenges";

const guardSchema = z.object({
  related: z.boolean(),
  confidence: z.number().min(0).max(1),
  reasons: z.array(z.string()),
  matchedGoals: z.array(z.string()).optional(),
});

type GuardResult = z.infer<typeof guardSchema>;

export interface RelatednessCheckResult {
  approved: boolean;
  confidence: number;
  reasons: string[];
}

function getMinConfidence(): number {
  const envValue = process.env.GUARD_MIN_CONFIDENCE;
  if (envValue) {
    const parsed = Number.parseFloat(envValue);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
      return parsed;
    }
  }
  return 0.6;
}

export async function ensureRelatedToChallenge({
  message,
  challenge,
  minConfidence,
}: {
  message: string;
  challenge: ChallengeContext;
  minConfidence?: number;
}): Promise<RelatednessCheckResult> {
  const threshold = minConfidence ?? getMinConfidence();

  const goalsDescription =
    challenge.goals.length > 0
      ? challenge.goals.map((g) => `- ${g.title}: ${g.criteria}`).join("\n")
      : "No specific goals defined.";

  const guardPrompt = `You are a message relatedness evaluator. Determine if the user message is meaningfully related to the given challenge.

Challenge: ${challenge.title}
Description: ${challenge.description}

Goals:
${goalsDescription}

User Message: "${message}"

Evaluate whether the user message is related to this challenge. Return a confidence score (0.0 = completely unrelated, 1.0 = perfectly aligned) and reasons for your assessment.`;

  try {
    const response = await generateObject({
      model: "openai/gpt-5-nano",
      schema: guardSchema,
      prompt: guardPrompt,
      temperature: 0.3,
    });

    const result = response.object as GuardResult;
    const approved = result.related && result.confidence >= threshold;

    return {
      approved,
      confidence: result.confidence,
      reasons: result.reasons,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Guard classification error:", errorMessage);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Message validation temporarily unavailable.",
    });
  }
}

export async function ensureRelatedToChallengeById({
  challengeId,
  message,
  minConfidence,
}: {
  challengeId: number;
  message: string;
  minConfidence?: number;
}): Promise<RelatednessCheckResult & { challenge: ChallengeContext }> {
  // Fetch the challenge from the database
  const challengeRows = await db
    .select({
      id: Challenges.id,
      title: Challenges.title,
      description: Challenges.description,
      goals: Challenges.goals,
      difficulty: Challenges.difficulty,
      category: Challenges.category,
    })
    .from(Challenges)
    .where(eq(Challenges.id, challengeId))
    .limit(1);

  if (challengeRows.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Challenge not found.",
    });
  }

  const challengeRow = challengeRows[0] as unknown as {
    id: number;
    title: string;
    description: string;
    goals: unknown;
    difficulty?: string | null;
    category?: string | null;
  };

  const challengeContext: ChallengeContext = {
    id: challengeRow.id,
    title: challengeRow.title,
    description: challengeRow.description,
    goals: normalizeGoals(challengeRow.goals),
    difficulty: challengeRow.difficulty ?? undefined,
    category: challengeRow.category ?? undefined,
  };

  try {
    const result = await ensureRelatedToChallenge({
      message,
      challenge: challengeContext,
      minConfidence,
    });

    if (!result.approved) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Your message doesn't appear related to this challenge.",
      });
    }

    return {
      ...result,
      challenge: challengeContext,
    };
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Guard check failed:", errorMessage);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Message validation temporarily unavailable.",
    });
  }
}
