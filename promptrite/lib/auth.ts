import { auth, clerkClient, getAuth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db, Users } from "./db";

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

    // Fallback bootstrap: attempt Clerk fetch, but don't fail if unavailable
    let primaryEmail = "";
    let firstName: string | undefined;
    let lastName: string | undefined;
    let username: string | undefined;
    try {
      const user = await (clerkClient as any)?.users?.getUser?.(userId);
      if (user) {
        primaryEmail =
          user.emailAddresses.find((e: any) => e.id === user.primaryEmailAddressId)
            ?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "";
        firstName = user.firstName ?? undefined;
        lastName = user.lastName ?? undefined;
        username = user.username ?? undefined;
      }
    } catch {
      // Ignore; create minimal bootstrap record
    }


    await db
      .insert(Users)
      .values({
        id: userId,
        email: primaryEmail,
        first_name: firstName,
        last_name: lastName,
        username,
      })
      .onConflictDoUpdate({
        target: Users.id,
        set: {
          email: primaryEmail,
          first_name: firstName,
          last_name: lastName,
          username,
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

    let primaryEmail = "";
    let firstName: string | undefined;
    let lastName: string | undefined;
    let username: string | undefined;
    try {
      const user = await (clerkClient as any)?.users?.getUser?.(userId);
      if (user) {
        primaryEmail =
          user.emailAddresses.find((e: any) => e.id === user.primaryEmailAddressId)
            ?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "";
        firstName = user.firstName ?? undefined;
        lastName = user.lastName ?? undefined;
        username = user.username ?? undefined;
      }
    } catch {
      // ignore
    }


    await db
      .insert(Users)
      .values({
        id: userId,
        email: primaryEmail,
        first_name: firstName,
        last_name: lastName,
        username,
      })
      .onConflictDoUpdate({
        target: Users.id,
        set: {
          email: primaryEmail,
          first_name: firstName,
          last_name: lastName,
          username,
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
