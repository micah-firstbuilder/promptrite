import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const baselineMetrics = pgTable("baseline_metrics", {
  id: serial("id").primaryKey(),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  metric_type: text("metric_type").notNull(), // 'elo', 'completion_rate', 'streak', etc.
  value: integer("value").notNull(),
  baseline_value: integer("baseline_value"), // Initial value when tracking started
  improvement_percentage: integer("improvement_percentage").default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Legacy compatibility - export as BaselineMetrics for existing code
export const BaselineMetrics = baselineMetrics;
