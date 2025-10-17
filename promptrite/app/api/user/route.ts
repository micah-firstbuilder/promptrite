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
