import type { inferAsyncReturnType } from "@trpc/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { Users } from "@/lib/db";

export async function createContext(opts: { req?: Request }) {
  let user: {
    id: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    elo_rating: number;
    created_at: Date;
  } | null = null;

  const { userId } = await auth();
  if (userId) {
    const rows = await db.select().from(Users).where(eq(Users.id, userId)).limit(1);
    if (rows.length > 0) {
      const u = rows[0];
      user = {
        id: u.id,
        email: u.email,
        first_name: u.first_name ?? null,
        last_name: u.last_name ?? null,
        username: u.username ?? null,
        elo_rating: u.elo_rating,
        created_at: u.created_at,
      };
    }
  }

  return { db, user };
}

export type Context = inferAsyncReturnType<typeof createContext>;


