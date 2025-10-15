import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { Progress, examples } from "@/lib/db";

export async function getExamplesByChallengeId(challengeId: number, limit = 20) {
  return db
    .select({
      id: examples.id,
      content: examples.content,
      created_at: examples.created_at,
      parent_id: examples.parent_id,
    })
    .from(examples)
    .where(and(eq(examples.challenge_id, challengeId), eq(examples.is_flagged, false)))
    .orderBy(desc(examples.created_at))
    .limit(limit);
}

export async function hasPassedChallenge(userId: string, challengeId: number) {
  const rows = await db
    .select({ id: Progress.id })
    .from(Progress)
    .where(and(eq(Progress.user_id, userId), eq(Progress.challenge_id, challengeId), gte(Progress.score, 100)))
    .limit(1);
  return rows.length > 0;
}

export async function createExample(params: {
  challengeId: number;
  content: string;
  userId?: string | null;
  parentId?: number | null;
}) {
  const [row] = await db
    .insert(examples)
    .values({
      challenge_id: params.challengeId,
      content: params.content,
      created_by: params.userId ?? null,
      parent_id: params.parentId ?? null,
    })
    .returning({ id: examples.id });
  return row;
}

export async function flagExample(exampleId: number) {
  const [row] = await db
    .update(examples)
    .set({ is_flagged: true })
    .where(eq(examples.id, exampleId))
    .returning({ id: examples.id });
  return row;
}


