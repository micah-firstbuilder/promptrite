import type { inferAsyncReturnType } from "@trpc/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

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

  // Derive auth from the incoming request; avoids direct auth() which requires middleware detection
  if (opts.req) {
    try {
      const u = await getCurrentUserFromRequest(opts.req as any);
      user = {
        id: u.id,
        email: u.email,
        first_name: u.first_name ?? null,
        last_name: u.last_name ?? null,
        username: u.username ?? null,
        elo_rating: u.elo_rating,
        created_at: u.created_at as unknown as Date,
      };
    } catch {
      // user remains null for unauthenticated requests
    }
  }

  return { db, user };
}

export type Context = inferAsyncReturnType<typeof createContext>;
