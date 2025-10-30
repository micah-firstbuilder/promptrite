import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { submissions } from "./challenges";

export const verifications = pgTable("verifications", {
  id: serial("id").primaryKey(),
  submission_id: integer("submission_id")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  verifier_type: varchar("verifier_type", { length: 50 }).notNull(), // 'code', 'text', 'multimodal'
  llm_model_used: varchar("llm_model_used", { length: 255 }).notNull(),
  embedding_model_used: varchar("embedding_model_used", {
    length: 255,
  }).notNull(),
  llm_score: integer("llm_score").notNull(), // 0-100
  verifier_score: integer("verifier_score"), // 0-100, optional
  embed_similarity: integer("embed_similarity"), // 0-100, optional (stored as int, multiply by 100 before storage)
  composite_score: integer("composite_score").notNull(), // 0-100 final score
  passed: boolean("passed").notNull(), // whether submission passed
  details: jsonb("details"), // full scoring breakdown: { llm: {...}, embedding: {...}, verifier: {...} }
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type Verification = typeof verifications.$inferSelect;
export type VerificationInsert = typeof verifications.$inferInsert;
