import { auth, clerkClient, getAuth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { Users } from "./db";
import { db } from "./db";
import type { NextRequest } from "next/server";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // Check if user exists in our database
  let dbUser = await db
    .select()
    .from(Users)
    .where(eq(Users.id, userId))
    .limit(1);

  if (dbUser.length === 0) {
    // Fallback bootstrap: fetch from Clerk and upsert once (in case webhook lagged)
    const user = await clerkClient.users.getUser(userId);
    const primaryEmail = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    )?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "";

    await db
      .insert(Users)
      .values({
        id: userId,
        email: primaryEmail,
        first_name: user.firstName ?? undefined,
        last_name: user.lastName ?? undefined,
        username: user.username ?? undefined,
      })
      .onConflictDoUpdate({
        target: Users.id,
        set: {
          email: primaryEmail,
          first_name: user.firstName ?? undefined,
          last_name: user.lastName ?? undefined,
          username: user.username ?? undefined,
        },
      });

    dbUser = await db.select().from(Users).where(eq(Users.id, userId)).limit(1);
  }

  return {
    id: dbUser[0].id,
    email: dbUser[0].email,
    first_name: dbUser[0].first_name ?? null,
    last_name: dbUser[0].last_name ?? null,
    username: dbUser[0].username ?? null,
    elo_rating: dbUser[0].elo_rating,
    created_at: dbUser[0].created_at,
  };
}

export async function getCurrentUserFromRequest(request: NextRequest) {
  const { userId } = getAuth(request);

  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  let dbUser = await db
    .select()
    .from(Users)
    .where(eq(Users.id, userId))
    .limit(1);

  if (dbUser.length === 0) {
    const user = await clerkClient.users.getUser(userId);
    const primaryEmail =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "";

    await db
      .insert(Users)
      .values({
        id: userId,
        email: primaryEmail,
        first_name: user.firstName ?? undefined,
        last_name: user.lastName ?? undefined,
        username: user.username ?? undefined,
      })
      .onConflictDoUpdate({
        target: Users.id,
        set: {
          email: primaryEmail,
          first_name: user.firstName ?? undefined,
          last_name: user.lastName ?? undefined,
          username: user.username ?? undefined,
        },
      });

    dbUser = await db
      .select()
      .from(Users)
      .where(eq(Users.id, userId))
      .limit(1);
  }

  return {
    id: dbUser[0].id,
    email: dbUser[0].email,
    first_name: dbUser[0].first_name ?? null,
    last_name: dbUser[0].last_name ?? null,
    username: dbUser[0].username ?? null,
    elo_rating: dbUser[0].elo_rating,
    created_at: dbUser[0].created_at,
  };
}
