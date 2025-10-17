import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db, Progress, challenges as Challenges } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export const progressRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    const progress = await db
      .select()
      .from(Progress)
      .where(eq(Progress.user_id, user.id))
      .orderBy(desc(Progress.created_at));
    return progress;
  }),

  create: protectedProcedure
    .input(
      z.object({
        challenge_id: z.union([z.number().int(), z.string()]),
        score: z.number().int(),
        metadata: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;
      const rawId = input.challenge_id;
      const challengeId = typeof rawId === "string" ? Number.parseInt(rawId, 10) : rawId;
      if (!Number.isFinite(challengeId)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid challenge_id" });
      }
      if (typeof input.score !== "number") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid score" });
      }

      let ensureChallengeId = challengeId as number;
      const existing = await db
        .select({ id: Challenges.id })
        .from(Challenges)
        .where(eq(Challenges.id, ensureChallengeId))
        .limit(1);
      if (existing.length === 0) {
        const inserted = await db
          .insert(Challenges)
          .values({
            title: `Chat Challenge #${challengeId}`,
            description: "Auto-created challenge for submission testing",
            goals: [{ criteria: "completion" }],
            difficulty: (input.metadata?.difficulty as string) || "easy",
            category: "general",
            is_active: 1,
          })
          .returning({ id: Challenges.id });
        ensureChallengeId = inserted[0].id;
      }

      const [row] = await db
        .insert(Progress)
        .values({
          user_id: user.id,
          challenge_id: ensureChallengeId,
          prompt: "",
          score: input.score,
          metadata: input.metadata ?? null,
        })
        .returning();

      return row;
    }),
});


