import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Progress, challenges, users } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { computeBadges } from "@/lib/badges";

function toYMD(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    const submissions = await db
      .select()
      .from(Progress)
      .where(eq(Progress.user_id, user.id))
      .orderBy(desc(Progress.created_at));

    const passed = submissions.filter((s) => s.score >= 100);

    // Unique challenges solved and difficulties encountered
    const solvedChallengeIds = new Set<number>();
    const solvedDifficulties = new Set<string>();

    if (passed.length > 0) {
      const rows = await db
        .select({ id: challenges.id, difficulty: challenges.difficulty })
        .from(challenges)
        .where(
          and(
            gte(challenges.id, 0),
          ),
        );
      // Map by id for quick lookup
      const byId = new Map<number, { difficulty: string }>();
      for (const r of rows) byId.set(r.id, { difficulty: r.difficulty });
      for (const p of passed) {
        solvedChallengeIds.add(p.challenge_id as number);
        const d = byId.get(p.challenge_id as number)?.difficulty;
        if (d) solvedDifficulties.add(d);
      }
    }

    // Heatmap: counts per day for last 365 days
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 364);
    const byDay = new Map<string, number>();
    for (const s of submissions) {
      const d = new Date(s.created_at);
      if (d >= start && d <= end) {
        const key = toYMD(d);
        byDay.set(key, (byDay.get(key) ?? 0) + 1);
      }
    }
    const activity: Array<{ date: string; count: number }> = [];
    for (
      let d = new Date(start);
      d <= end;
      d = new Date(d.getTime() + 24 * 60 * 60 * 1000)
    ) {
      const key = toYMD(d);
      activity.push({ date: key, count: byDay.get(key) ?? 0 });
    }

    // Streaks (consecutive active days ending today)
    let currentStreak = 0;
    let maxStreak = 0;
    let streak = 0;
    for (let i = activity.length - 1; i >= 0; i--) {
      if (activity[i].count > 0) {
        streak++;
        if (streak > maxStreak) maxStreak = streak;
      } else {
        if (i === activity.length - 1) {
          currentStreak = 0;
        }
        maxStreak = Math.max(maxStreak, streak);
        streak = 0;
      }
    }
    // If trailing days are active, that's the current streak
    if (activity[activity.length - 1]?.count > 0) {
      currentStreak = 1;
      for (let i = activity.length - 2; i >= 0; i--) {
        if (activity[i].count > 0) currentStreak++;
        else break;
      }
    }

    // Recent passed challenges (join for meta)
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
      const ids = Array.from(new Set(recent.map((r) => r.challenge_id as number)));
      const metas = ids.length > 0
        ? await db
            .select({
              id: challenges.id,
              title: challenges.title,
              difficulty: challenges.difficulty,
              category: challenges.category,
            })
            .from(challenges)
            .where(inArray(challenges.id, ids))
        : [];
      const metaById = new Map<number, typeof metas[number]>();
      for (const m of metas) metaById.set(m.id, m);
      recentChallenges = recent
        .map((r) => {
          const meta = metaById.get(r.challenge_id as number);
          if (!meta) return null; // Guard against missing challenge metadata
          const createdAtValue = (r as any).created_at;
          const createdAtIso = createdAtValue instanceof Date
            ? createdAtValue.toISOString()
            : new Date(createdAtValue).toISOString();
          return {
            id: meta.id,
            title: meta.title,
            difficulty: meta.difficulty,
            category: meta.category,
            created_at: createdAtIso,
            score: r.score,
          };
        })
        .filter((x): x is NonNullable<typeof x> => Boolean(x));
    }

    const totalSolvedChallenges = solvedChallengeIds.size;
    const totalSubmissions = submissions.length;

    const badges = computeBadges({
      totalSolved: totalSolvedChallenges,
      solvedDifficulties,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        elo_rating: user.elo_rating,
      },
      stats: {
        totalSubmissions,
        totalSolvedChallenges,
        currentStreak,
        maxStreak,
      },
      badges,
      recentChallenges,
      activity,
    });
  } catch (error) {
    if (error instanceof Response) {
      return NextResponse.json(
        { error: error.statusText || "Unauthorized" },
        { status: error.status || 401 },
      );
    }
    const isDev = process.env.NODE_ENV !== "production";
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = isDev && error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      { error: "Internal Server Error", message, stack },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";



