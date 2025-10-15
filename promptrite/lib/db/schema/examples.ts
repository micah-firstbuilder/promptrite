import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { challenges } from "./challenges";
import { users } from "./users";

export const examples = pgTable("examples", {
  id: serial("id").primaryKey(),
  challenge_id: integer("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  parent_id: integer("parent_id").references((): AnyPgColumn => examples.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  created_by: text("created_by").references(() => users.id, { onDelete: "set null" }),
  is_flagged: boolean("is_flagged").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
});


