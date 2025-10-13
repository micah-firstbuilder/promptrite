import { desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { Progress } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    const progress = await db
      .select()
      .from(Progress)
      .where(eq(Progress.user_id, user.id))
      .orderBy(desc(Progress.created_at));

    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const { challenge_id, score, metadata } = body;

    if (!challenge_id || typeof score !== "number") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const newProgress = await db
      .insert(Progress)
      .values({
        user_id: user.id,
        challenge_id,
        prompt: "", // Default empty prompt for progress tracking
        score,
        metadata: metadata || null,
      })
      .returning();

    return NextResponse.json(newProgress[0]);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
