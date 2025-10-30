import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { challenges, db, examples, Progress } from "@/lib/db";
import { mapCategoryToTechnicalMode } from "@/lib/utils/challenges";
import { protectedProcedure, router } from "../trpc";

export const challengesRouter = router({
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const challengeRow = await db
        .select({
          id: challenges.id,
          title: challenges.title,
          description: challenges.description,
          difficulty: challenges.difficulty,
          category: challenges.category,
        })
        .from(challenges)
        .where(eq(challenges.id, input.id))
        .limit(1);

      if (challengeRow.length === 0) {
        return null;
      }

      const challenge = challengeRow[0];

      // Get the latest example for this challenge
      const exampleRow = await db
        .select({
          content: examples.content,
        })
        .from(examples)
        .where(eq(examples.challenge_id, input.id))
        .orderBy(desc(examples.created_at))
        .limit(1);

      const technicalMode = mapCategoryToTechnicalMode(challenge.category);

      return {
        ...challenge,
        technicalMode,
        example: exampleRow.length > 0 ? exampleRow[0].content : null,
      };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    const userProgress = await db
      .select()
      .from(Progress)
      .where(eq(Progress.user_id, user.id));

    // Fetch all active challenges from the database
    const allChallenges = await db
      .select({
        id: challenges.id,
        title: challenges.title,
        description: challenges.description,
        difficulty: challenges.difficulty,
        category: challenges.category,
      })
      .from(challenges)
      .where(eq(challenges.is_active, 1));

    // Enrich each challenge with technicalMode and latest example
    const enrichedChallenges = await Promise.all(
      allChallenges.map(async (challenge) => {
        const exampleRow = await db
          .select({
            content: examples.content,
          })
          .from(examples)
          .where(eq(examples.challenge_id, challenge.id))
          .orderBy(desc(examples.created_at))
          .limit(1);

        const technicalMode = mapCategoryToTechnicalMode(challenge.category);

        return {
          ...challenge,
          technicalMode,
          example: exampleRow.length > 0 ? exampleRow[0].content : null,
        };
      })
    );

    const totalChallenges = enrichedChallenges.length;
    const completedChallenges = userProgress.length;
    const completionRate =
      totalChallenges > 0
        ? Math.round((completedChallenges / totalChallenges) * 100)
        : 0;
    const averageScore =
      userProgress.length > 0
        ? Math.round(
            userProgress.reduce((sum, p) => sum + p.score, 0) /
              userProgress.length
          )
        : 1200;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentProgress = userProgress.filter(
      (p) => (p.created_at as Date) >= sevenDaysAgo
    );
    const currentStreak = recentProgress.length;

    // Derive total users approximately from ELO distribution of progress owners
    const totalUsers = Math.max(
      1,
      new Set(userProgress.map((p) => p.user_id as string)).size || 1
    );
    // Rank 1 is highest score; clamp within [1, totalUsers]
    const normalized = Math.min(2000, Math.max(0, averageScore));
    const userRank = Math.max(
      1,
      totalUsers - Math.floor((normalized / 2000) * (totalUsers - 1))
    );

    return {
      challenges: enrichedChallenges,
      stats: {
        totalChallenges,
        completedChallenges,
        completionRate,
        averageScore,
        currentStreak,
        userRank,
        totalUsers,
      },
    };
  }),
});
