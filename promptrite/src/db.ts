import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

// Load environment variables from .env or .env.local
config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in environment");
}

const sql = neon(process.env.DATABASE_URL);

// Create and export the Drizzle database instance
export const db = drizzle(sql);
