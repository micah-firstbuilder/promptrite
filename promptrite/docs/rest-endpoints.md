# Archived REST Endpoints

These are the previous REST handlers kept for reference after migrating to tRPC.

## app/api/user/route.ts

```ts
import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getCurrentUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { Users } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({
      id: user.id,
      email: user.email,
      first_name: (user as any).first_name ?? null,
      last_name: (user as any).last_name ?? null,
      username: (user as any).username ?? null,
      elo_rating: (user as any).elo_rating ?? 1200,
      created_at: user.created_at,
    });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    let authUser;
    try {
      authUser = await getCurrentUserFromRequest(request);
    } catch {
      // Fallback to session-based auth if request context is missing
      authUser = await getCurrentUser();
    }
    const body = await request.json();
    const update: Record<string, string> = {};
    if (typeof body.first_name === "string") update.first_name = body.first_name.trim();
    if (typeof body.last_name === "string") update.last_name = body.last_name.trim();
    if (typeof body.username === "string") update.username = body.username.trim().toLowerCase();

    if (update.username) {
      const existing = await db
        .select({ id: Users.id })
        .from(Users)
        .where(eq(Users.username, update.username))
        .limit(1);
      if (existing.length > 0 && existing[0].id !== authUser.id) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    // Always ensure email is present; backfill from current row if missing
    const existing = await db
      .select()
      .from(Users)
      .where(eq(Users.id, authUser.id))
      .limit(1);
    if (!existing[0]?.email) {
      // If the row somehow lacks email, try to preserve from authUser (may be undefined)
      if (authUser.email) {
        update.email = authUser.email;
      }
    }
    await db.update(Users).set(update).where(eq(Users.id, authUser.id));

    const refreshed = await db
      .select()
      .from(Users)
      .where(eq(Users.id, authUser.id))
      .limit(1);

    const u = refreshed[0];
    return NextResponse.json({
      id: u.id,
      email: u.email,
      first_name: u.first_name ?? null,
      last_name: u.last_name ?? null,
      username: u.username ?? null,
      elo_rating: u.elo_rating,
      created_at: u.created_at,
    });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export const runtime = "nodejs";
```

## app/api/progress/route.ts

```ts
import { desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { Progress, challenges as Challenges } from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    const progress = await db
      .select()
      .from(Progress)
      .where(eq(Progress.user_id, user.id))
      .orderBy(desc(Progress.created_at));

    return NextResponse.json(progress);
  } catch (error) {
    if (error instanceof Response) {
      return NextResponse.json({ error: error.statusText || "Unauthorized" }, { status: error.status || 401 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const body = await request.json();

    const rawId = body.challenge_id;
    const challenge_id = typeof rawId === "string" ? Number.parseInt(rawId, 10) : rawId;
    const score = body.score;
    const metadata = body.metadata;

    if (!Number.isFinite(challenge_id) || typeof score !== "number") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Ensure referenced challenge exists to satisfy FK; auto-create if missing
    let ensureChallengeId = challenge_id as number;
    const existing = await db
      .select({ id: Challenges.id })
      .from(Challenges)
      .where(eq(Challenges.id, ensureChallengeId))
      .limit(1);
    if (existing.length === 0) {
      const inserted = await db
        .insert(Challenges)
        .values({
          title: `Chat Challenge #${challenge_id}`,
          description: "Auto-created challenge for submission testing",
          goals: [{ criteria: "completion" }],
          difficulty: (metadata?.difficulty as string) || "easy",
          category: "general",
          is_active: 1,
        })
        .returning({ id: Challenges.id });
      ensureChallengeId = inserted[0].id;
    }

    const newProgress = await db
      .insert(Progress)
      .values({
        user_id: user.id,
        challenge_id: ensureChallengeId,
        prompt: "",
        score,
        metadata: metadata || null,
      })
      .returning();

    return NextResponse.json(newProgress[0]);
  } catch (error) {
    if (error instanceof Response) {
      return NextResponse.json({ error: error.statusText || "Unauthorized" }, { status: error.status || 401 });
    }
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

## app/api/profile/[username]/route.ts

```ts
import { desc, eq, ilike, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Progress, challenges, Users } from "@/lib/db";
import { computeBadges } from "@/lib/badges";

function toYMD(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/");
    const raw = segments[segments.length - 1] ?? "";
    const key = decodeURIComponent(raw).trim();
    // Match by id OR username (case-insensitive)
    const userRows = await db
      .select({ id: Users.id, email: Users.email, username: Users.username, first_name: Users.first_name, last_name: Users.last_name, elo_rating: Users.elo_rating })
      .from(Users)
      .where(or(eq(Users.id, key), ilike(Users.username, key)))
      .limit(1);
    if (userRows.length === 0) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
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
        const key = toYMD(d);
        byDay.set(key, (byDay.get(key) ?? 0) + 1);
      }
    }
    const activity: Array<{ date: string; count: number }> = [];
    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 86400000)) {
      const key = toYMD(d);
      activity.push({ date: key, count: byDay.get(key) ?? 0 });
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

    return NextResponse.json({
      user,
      stats: {
        totalSubmissions: submissions.length,
        totalSolvedChallenges: solvedChallengeIds.size,
      },
      badges,
      recentChallenges,
      activity,
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

## app/api/challenges/route.ts

```ts
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Progress } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// Mock challenge data - in a real app this would come from a database
const challenges = [
  {
    id: "1",
    title: "Landing Page Revamp",
    subtitle: "Wireframe and refine a hero section for a product",
    category: "design",
    type: "one-shot",
    difficulty: "Easy",
    time: "20–30 min",
    completion: 78,
    points: 100,
  },
  {
    id: "2",
    title: "Refactor Utilities",
    subtitle: "Improve a small helper library",
    category: "code",
    type: "multi-turn",
    difficulty: "Medium",
    time: "45–60 min",
    completion: 64,
    points: 150,
  },
  {
    id: "3",
    title: "Prompted Poster",
    subtitle: "Generate a minimal poster from a short brief",
    category: "image",
    type: "one-shot",
    difficulty: "Easy",
    time: "10–15 min",
    completion: 82,
    points: 80,
  },
  {
    id: "4",
    title: "Onboarding Flow",
    subtitle: "Design a 3‑step signup with progress",
    category: "design",
    type: "multi-turn",
    difficulty: "Medium",
    time: "40–60 min",
    completion: 58,
    points: 200,
  },
  {
    id: "5",
    title: "Build a REST Endpoint",
    subtitle: "Create a small endpoint with pagination",
    category: "code",
    type: "one-shot",
    difficulty: "Medium",
    time: "30–45 min",
    completion: 61,
    points: 120,
  },
];

export async function GET() {
  try {
    const user = await getCurrentUser();

    // Get user's progress to calculate completion stats
    const userProgress = await db
      .select()
      .from(Progress)
      .where(eq(Progress.user_id, user.id));

    // Calculate user stats
    const totalChallenges = challenges.length;
    const completedChallenges = userProgress.length;
    const completionRate =
      totalChallenges > 0
        ? Math.round((completedChallenges / totalChallenges) * 100)
        : 0;

    // Calculate average score (ELO-like rating)
    const averageScore =
      userProgress.length > 0
        ? Math.round(
            userProgress.reduce((sum, p) => sum + p.score, 0) /
              userProgress.length
          )
        : 1200; // Default ELO

    // Calculate current streak (simplified - challenges completed in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentProgress = userProgress.filter(
      (p) => p.created_at >= sevenDaysAgo
    );
    const currentStreak = recentProgress.length;

    // Calculate leaderboard rank (simplified - based on score)
    const totalUsers = 100; // Mock total users
    const userRank = Math.max(
      1,
      Math.floor((averageScore / 2000) * totalUsers)
    );

    return NextResponse.json({
      challenges,
      stats: {
        totalChallenges,
        completedChallenges,
        completionRate,
        averageScore,
        currentStreak,
        userRank,
        totalUsers,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```
