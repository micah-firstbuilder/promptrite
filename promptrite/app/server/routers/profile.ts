import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { db, Progress, challenges, Users } from "@/lib/db";
import { computeBadges } from "@/lib/badges";
import { desc, eq, ilike, or } from "drizzle-orm";

function toYMD(date: Date) {
  return date.toISOString().slice(0, 10);
}

export const profileRouter = router({
  byKey: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const key = input.key.trim();
      const userRows = await db
        .select({ id: Users.id, username: Users.username, first_name: Users.first_name, last_name: Users.last_name, elo_rating: Users.elo_rating })
        .from(Users)
        .where(or(eq(Users.id, key), ilike(Users.username, key)))
        .limit(1);
      if (userRows.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const user = userRows[0];

      const submissions = await db
        .select()
        .from(Progress)
        .where(eq(Progress.user_id, user.id))
        .orderBy(desc(Progress.created_at));

      const passed = submissions.filter((s) => s.score >= 100);
      const solvedChallengeIds = new Set<number>();
      const solvedDifficulties = new Set<string>();
      if (passed.length > 0) {
        const metas = await db
          .select({ id: challenges.id, difficulty: challenges.difficulty })
          .from(challenges);
        const byId = new Map<number, { difficulty: string }>();
        for (const m of metas) byId.set(m.id, { difficulty: m.difficulty });
        for (const p of passed) {
          solvedChallengeIds.add(p.challenge_id as number);
          const d = byId.get(p.challenge_id as number)?.difficulty;
          if (d) solvedDifficulties.add(d);
        }
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 364);
      const byDay = new Map<string, number>();
      for (const s of submissions) {
        const d = new Date(s.created_at);
        if (d >= start && d <= end) {
          const k = toYMD(d);
          byDay.set(k, (byDay.get(k) ?? 0) + 1);
        }
      }
      const activity: Array<{ date: string; count: number }> = [];
      for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 86400000)) {
        const k = toYMD(d);
        activity.push({ date: k, count: byDay.get(k) ?? 0 });
      }

      const recent = passed.slice(0, 10);
      let recentChallenges: Array<{
        id: number;
        title: string;
        difficulty: string;
        category: string;
        created_at: string;
        score: number;
      }> = [];
      if (recent.length > 0) {
        const metas = await db
          .select({ id: challenges.id, title: challenges.title, difficulty: challenges.difficulty, category: challenges.category })
          .from(challenges);
        const metaById = new Map<number, typeof metas[number]>();
        for (const m of metas) metaById.set(m.id, m);
        recentChallenges = recent.map((r) => {
          const m = metaById.get(r.challenge_id as number)!;
          return {
            id: m.id,
            title: m.title,
            difficulty: m.difficulty,
            category: m.category,
            created_at: (r.created_at as Date).toISOString(),
            score: r.score,
          };
        });
      }

      const badges = computeBadges({
        totalSolved: solvedChallengeIds.size,
        solvedDifficulties,
      });

      return {
        user,
        stats: {
          totalSubmissions: submissions.length,
          totalSolvedChallenges: solvedChallengeIds.size,
        },
        badges,
        recentChallenges,
        activity,
      };
    }),
});


