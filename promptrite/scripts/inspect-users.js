/* eslint-disable */
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });
require("dotenv").config();

async function main() {
  const { neon } = require("@neondatabase/serverless");
  const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL or NEON_DATABASE_URL is not set");
    process.exit(1);
  }
  const sql = neon(databaseUrl);

  const [{ regclass: regUsers }] =
    await sql`select to_regclass('public.users') as regclass;`;
  console.log("public.users exists as:", regUsers);

  const usersCols =
    await sql`select column_name, data_type, is_nullable, column_default from information_schema.columns where table_schema = 'public' and table_name = 'users' order by ordinal_position;`;
  console.log("users columns:", usersCols);

  const userId = process.env.DEBUG_USER_ID;
  if (userId) {
    try {
      const rows =
        await sql`select id, email, first_name, last_name, username, elo_rating, created_at, updated_at from public.users where id = ${userId} limit 1;`;
      console.log("select by id result:", rows);
    } catch (e) {
      console.error("select by id error:", e);
    }
  } else {
    console.log("Set DEBUG_USER_ID in .env.local to test a specific user id");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
