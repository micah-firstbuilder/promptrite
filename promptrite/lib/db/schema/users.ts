import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(), // Clerk user id
  email: text("email").notNull(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  username: text("username"),
  elo_rating: integer("elo_rating").default(1200).notNull(), // ELO rating for ranking
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Legacy compatibility - export as Users for existing code
export const Users = users;
