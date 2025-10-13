import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Load environment variables
const databaseUrl = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL or NEON_DATABASE_URL must be set in environment"
  );
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, {
  schema,
});

// Legacy compatibility - export individual tables for existing imports
export const {
  Users,
  Progress,
  BaselineMetrics,
  baselineMetrics,
  users,
  challenges,
  submissions,
} = schema;
