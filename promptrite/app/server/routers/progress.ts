import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { challenges as Challenges, db, Progress } from "@/lib/db";
import { protectedProcedure, router } from "../trpc";

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

  listByChallenge: protectedProcedure
    .input(z.object({ challengeId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.user!;
      const progress = await db
        .select()
        .from(Progress)
        .where(eq(Progress.challenge_id, input.challengeId))
        .orderBy(desc(Progress.created_at));
      return progress;
    }),

  create: protectedProcedure
    .input(
      z.object({
        challenge_id: z.union([z.number().int(), z.string().regex(/^\d+$/)]),
        score: z.number().int(),
        metadata: z
          .object({ difficulty: z.enum(["easy", "medium", "hard"]).optional() })
          .passthrough()
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;
      const rawId = input.challenge_id;
      const challengeId = typeof rawId === "string" ? Number(rawId) : rawId;
      if (!Number.isFinite(challengeId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid challenge_id",
        });
      }
      if (typeof input.score !== "number") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid score" });
      }

      // Require challenge to exist; do not auto-create here
      const existing = await db
        .select({ id: Challenges.id })
        .from(Challenges)
        .where(eq(Challenges.id, challengeId as number))
        .limit(1);
      if (existing.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Challenge not found",
        });
      }

      const [row] = await db
        .insert(Progress)
        .values({
          user_id: user.id,
          challenge_id: challengeId as number,
          prompt: "",
          score: input.score,
          metadata: input.metadata ?? null,
        })
        .returning();

      return row;
    }),
});
