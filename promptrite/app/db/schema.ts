import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const Users = pgTable("users", {
  id: text("id").primaryKey().notNull(), // Clerk user id
  email: text("email").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const Progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  challenge_id: text("challenge_id").notNull(),
  score: integer("score").notNull().default(0),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const BaselineMetrics = pgTable("baseline_metrics", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  metric_type: text("metric_type").notNull(), // 'elo', 'completion_rate', 'streak', etc.
  value: integer("value").notNull(),
  baseline_value: integer("baseline_value"), // Initial value when tracking started
  improvement_percentage: integer("improvement_percentage").default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
