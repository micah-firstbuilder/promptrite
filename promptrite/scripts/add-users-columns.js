/* eslint-disable */
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
require('dotenv').config();

async function main() {
  const { neon } = require('@neondatabase/serverless');
  const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL/NEON_DATABASE_URL missing');
  const sql = neon(url);
  await sql`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS elo_rating integer NOT NULL DEFAULT 1200;`;
  await sql`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at timestamp NOT NULL DEFAULT now();`;
  console.log('Users columns ensured.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});




