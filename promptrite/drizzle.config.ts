import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL)
  throw new Error("DATABASE_URL not found in environment");

const config = {
  schema: "./lib/db/schema",
  out: "./app/db/migrations",
  dialect: "postgresql",
  // drizzle-kit requires either a url or host/database; provide url from env
  dbCredentials: { url: process.env.DATABASE_URL },
  strict: true,
};

export default config;
