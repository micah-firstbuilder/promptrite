import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { Users } from "./db";
import { db } from "./db";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // Check if user exists in our database, create if not
  let dbUser = await db
    .select()
    .from(Users)
    .where(eq(Users.id, userId))
    .limit(1);

  if (dbUser.length === 0) {
    // For now, we'll create with empty email - in a real app you'd get this from Clerk
    await db.insert(Users).values({
      id: userId,
      email: "", // Will be updated when we get user profile data
    });

    // Fetch the newly created user
    dbUser = await db.select().from(Users).where(eq(Users.id, userId)).limit(1);
  }

  return {
    id: dbUser[0].id,
    email: dbUser[0].email,
    created_at: dbUser[0].created_at,
  };
}
