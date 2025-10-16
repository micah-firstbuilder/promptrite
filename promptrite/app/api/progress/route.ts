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
