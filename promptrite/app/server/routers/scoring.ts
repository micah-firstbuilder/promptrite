import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  challenges as Challenges,
  db,
  Progress,
  verifications,
} from "@/lib/db";
import type { ConversationMessage } from "@/lib/services/gateway";
import { scoreConversation } from "@/lib/services/gateway";
import { runVerification } from "@/lib/services/verification";
import { normalizeGoals } from "@/lib/utils/challenges";
import type { ChallengeContext } from "@/types/challenges";
import { protectedProcedure, publicProcedure, router } from "../trpc";

// Define input schema for conversation scoring, which includes
// - challengeId: the ID of the challenge being attempted
// - conversation: the full conversation as an array of messages (with role and content)
// - attemptId: optional, allows tracking of multiple attempts
const scoreConversationInputSchema = z.object({
  challengeId: z.string().min(1, "Challenge ID cannot be empty"),
  conversation: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1, "Message content cannot be empty"),
      })
    )
    .min(1, "Conversation cannot be empty"),
  attemptId: z.string().optional(),
});

export type ScoreConversationInput = z.infer<
  typeof scoreConversationInputSchema
>;

const submitOutputInputSchema = z.object({
  challengeId: z.string().min(1, "Challenge ID cannot be empty"),
  output: z.string().min(1, "Output cannot be empty"),
  type: z.string().optional().default("text"), // e.g., 'code', 'text', 'image', 'video'
});

export type SubmitOutputInput = z.infer<typeof submitOutputInputSchema>;

// Define the scoring router with a protected `scoreConversation` endpoint
export const scoringRouter = router({
  scoreConversation: protectedProcedure
    .input(scoreConversationInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Assume user is authenticated and available on the context
      const user = ctx.user!;

      // Timing for measuring latency of the scoring operation
      const startTime = Date.now();

      // Defensive: make sure the conversation is not empty
      if (!input.conversation || input.conversation.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Conversation cannot be empty.",
        });
      }

      // Parse challengeId from string to integer and validate it's a valid number
      const challengeId = Number.parseInt(input.challengeId, 10);
      if (!Number.isFinite(challengeId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid challenge ID.",
        });
      }

      // Fetch the referenced challenge from the database
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
        // Call the remote Fireworks scoring service for the provided conversation
        const scoringResult = await scoreConversation({
          conversation: input.conversation as ConversationMessage[],
          challengeId: input.challengeId,
          attemptId: input.attemptId,
          challenge: challengeContext,
        });

        // Record the time taken for the scoring service call
        const latency = Date.now() - startTime;

        // Round the composite score to closest integer value for database storage
        const compositeScore = Math.round(scoringResult.compositeScore);

        // Persist progress and scoring details to Progress table
        // including user id, challenge id, full prompt, score, and raw scoring result as metadata
        const [progressRecord] = await db
          .insert(Progress)
          .values({
            user_id: user.id,
            challenge_id: challengeId,
            prompt: JSON.stringify(input.conversation),
            score: compositeScore,
            metadata: scoringResult,
          })
          .returning();

        // Structured logging for monitoring analytics and debugging
        console.log("scoring_success", {
          userId: user.id,
          challengeId,
          attemptId: input.attemptId,
          compositeScore,
          latency,
          progressRecordId: progressRecord?.id,
        });

        // Return the full scoring result back to the client
        return scoringResult;
      } catch (error) {
        // Record failed attempt's latency
        const latency = Date.now() - startTime;
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Log error with structured context for observability
        console.error("scoring_error", {
          userId: user.id,
          challengeId,
          attemptId: input.attemptId,
          error: errorMessage,
          latency,
        });

        // Check if the error object carries a partial result ("cause")
        if (error instanceof Error && error.cause) {
          // If so, try to persist this partial result for recovery or analytics
          const partialResult = (error as any).cause;
          if (partialResult) {
            try {
              await db
                .insert(Progress)
                .values({
                  user_id: user.id,
                  challenge_id: challengeId,
                  prompt: JSON.stringify(input.conversation),
                  score: 0, // partial results get 0 score
                  metadata: { ...partialResult, partial: true },
                })
                .returning();
            } catch (persistError) {
              // Log any issue persisting the partial result
              console.error("Failed to persist partial result:", persistError);
            }
          }
        }

        // Always throw a 500 error to the client (with error cause for potential debugging)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Scoring temporarily unavailable, please try again.",
          cause: error,
        });
      }
    }),
  // Public test endpoint that only calls the scoring service and returns the result
  // without persisting progress. Useful for local/dev testing when auth isn't set up.
  scoreConversationTest: publicProcedure
    .input(scoreConversationInputSchema)
    .mutation(async ({ input }) => {
      // Defensive: make sure the conversation is not empty
      if (!input.conversation || input.conversation.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Conversation cannot be empty.",
        });
      }

      // Parse challengeId from string to integer and validate it's a valid number
      const challengeId = Number.parseInt(input.challengeId, 10);
      if (!Number.isFinite(challengeId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid challenge ID.",
        });
      }

      // Fetch challenge for guard and context
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
        const scoringResult = await scoreConversation({
          conversation: input.conversation as ConversationMessage[],
          challengeId: input.challengeId,
          attemptId: input.attemptId,
          challenge: challengeContext,
        });

        return scoringResult;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Scoring failed.",
          cause: error,
        });
      }
    }),

  /**
   * Submit output for a challenge.
   * Creates a submission record, runs verification (LLM + embedding + verifier),
   * persists verification results, and returns composite score.
   */
  submitOutput: protectedProcedure
    .input(submitOutputInputSchema)
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;
      const startTime = Date.now();

      // Validate input
      if (!input.output || input.output.trim().length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Output cannot be empty.",
        });
      }

      // Enforce reasonable size limits
      const maxOutputSize = 50_000; // 50KB
      if (input.output.length > maxOutputSize) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Output exceeds maximum size of ${maxOutputSize} characters.`,
        });
      }

      // Parse challengeId
      const challengeId = Number.parseInt(input.challengeId, 10);
      if (!Number.isFinite(challengeId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid challenge ID.",
        });
      }

      // Fetch challenge
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
        // Step 1: Create submission record
        const [submissionRecord] = await db
          .insert(Progress)
          .values({
            user_id: user.id,
            challenge_id: challengeId,
            prompt: input.output,
            type: input.type,
            score: 0, // Will be updated after verification
            metadata: {},
          })
          .returning();

        if (!(submissionRecord && submissionRecord.id)) {
          throw new Error("Failed to create submission record");
        }

        const submissionId = submissionRecord.id;

        // Step 2: Run verification orchestration (LLM + embedding + verifier in parallel)
        const verificationResult = await runVerification({
          challenge: challengeContext,
          output: input.output,
          submissionType: input.type,
        });

        // Step 3: Persist verification results
        const [verificationRecord] = await db
          .insert(verifications)
          .values({
            submission_id: submissionId,
            verifier_type: verificationResult.verifier.type,
            llm_model_used: verificationResult.llm.model,
            embedding_model_used: verificationResult.embedding.model,
            llm_score: verificationResult.llm.score,
            verifier_score: verificationResult.verifier.score || 0,
            embed_similarity: verificationResult.embedding.score,
            composite_score: verificationResult.composite.score,
            passed: verificationResult.composite.passed,
            details: {
              llm: verificationResult.llm,
              embedding: {
                score: verificationResult.embedding.score,
                usage: verificationResult.embedding.usage,
                cached: verificationResult.embedding.cached,
              },
              verifier: verificationResult.verifier,
              composite: verificationResult.composite,
            },
          })
          .returning();

        // Step 4: Update submission score
        await db
          .update(Progress)
          .set({ score: verificationResult.composite.score })
          .where(eq(Progress.id, submissionId));

        const latency = Date.now() - startTime;

        // Structured logging
        console.log("submission_success", {
          userId: user.id,
          challengeId,
          submissionId,
          compositeScore: verificationResult.composite.score,
          passed: verificationResult.composite.passed,
          verifierType: verificationResult.verifier.type,
          latency,
        });

        return {
          submissionId,
          compositeScore: verificationResult.composite.score,
          passed: verificationResult.composite.passed,
          verification: verificationResult,
        };
      } catch (error) {
        const latency = Date.now() - startTime;
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        console.error("submission_error", {
          userId: user.id,
          challengeId,
          error: errorMessage,
          latency,
        });

        // Check if error is already a TRPCError
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Submission processing failed. Please try again.",
          cause: error,
        });
      }
    }),
});
