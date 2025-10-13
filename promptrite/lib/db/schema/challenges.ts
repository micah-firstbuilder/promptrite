import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  goals: jsonb("goals").notNull(), // Array of goal objects with criteria
  difficulty: varchar("difficulty", { length: 50 }).default("medium").notNull(), // 'easy', 'medium', 'hard'
  category: varchar("category", { length: 100 }).notNull(),
  is_active: integer("is_active").default(1).notNull(), // 1 = active, 0 = inactive
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  challenge_id: integer("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(), // User's submitted prompt/response
  type: varchar("type", { length: 50 }).default("text").notNull(), // 'text', 'code', etc.
  score: integer("score").notNull().default(0), // Performance score
  metadata: jsonb("metadata"), // Additional submission data
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Legacy compatibility - export as Progress for existing code
export const Progress = submissions;
