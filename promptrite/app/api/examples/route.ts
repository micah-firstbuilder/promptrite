import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getAuth } from "@clerk/nextjs/server";
import {
  createExample,
  flagExample,
  getExamplesByChallengeId,
  hasPassedChallenge,
} from "@/lib/db/queries";

const getSchema = z.object({
  challenge_id: z.coerce.number().int().positive(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

const postSchema = z.object({
  challenge_id: z.coerce.number().int().positive(),
  content: z.string().min(10).max(5000),
  opt_in: z.literal(true),
  parent_id: z.coerce.number().int().positive().optional(),
});

const patchSchema = z.object({
  id: z.coerce.number().int().positive(),
  action: z.literal("flag"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = getSchema.safeParse({
      challenge_id: searchParams.get("challenge_id"),
      limit: searchParams.get("limit") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    const { challenge_id, limit } = parsed.data;
    const list = await getExamplesByChallengeId(challenge_id, limit ?? 20);
    return NextResponse.json({ examples: list });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: "Internal Server Error", message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Require sign-in (prefer request-scoped auth)
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { challenge_id, content, parent_id } = parsed.data;

  try {
    const created = await createExample({
      challengeId: challenge_id,
      content,
      userId,
      parentId: parent_id ?? null,
    });
    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: "Failed to create", message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const { id } = parsed.data;
    await flagExample(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}


