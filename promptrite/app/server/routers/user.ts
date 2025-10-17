import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { db, Users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export const userRouter = router({
  me: publicProcedure.query(async () => {
    // Ensure bootstrap/upsert behavior via getCurrentUser
    try {
      const u = await getCurrentUser();
      return u;
    } catch {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
  }),

  update: protectedProcedure
    .input(
      z.object({
        first_name: z.string().trim().min(1).max(100).optional(),
        last_name: z.string().trim().min(1).max(100).optional(),
        username: z
          .string()
          .trim()
          .toLowerCase()
          .regex(/^[a-zA-Z0-9_\-.]{3,20}$/)
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const update: Record<string, string> = {};
      if (typeof input.first_name === "string") update.first_name = input.first_name;
      if (typeof input.last_name === "string") update.last_name = input.last_name;
      if (typeof input.username === "string") update.username = input.username;

      if (update.username) {
        const existing = await db
          .select({ id: Users.id })
          .from(Users)
          .where(eq(Users.username, update.username))
          .limit(1);
        if (existing.length > 0 && existing[0].id !== ctx.user.id) {
          throw new TRPCError({ code: "CONFLICT", message: "Username already taken" });
        }
      }

      if (Object.keys(update).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No fields to update" });
      }

      // Ensure email isn't lost if missing on the row
      const existing = await db.select().from(Users).where(eq(Users.id, ctx.user.id)).limit(1);
      if (!existing[0]?.email && ctx.user.email) {
        update.email = ctx.user.email;
      }

      await db.update(Users).set(update).where(eq(Users.id, ctx.user.id));

      const refreshed = await db.select().from(Users).where(eq(Users.id, ctx.user.id)).limit(1);
      const u = refreshed[0];
      return {
        id: u.id,
        email: u.email,
        first_name: u.first_name ?? null,
        last_name: u.last_name ?? null,
        username: u.username ?? null,
        elo_rating: u.elo_rating,
        created_at: u.created_at,
      };
    }),
});


