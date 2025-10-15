/* eslint-disable */
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
require('dotenv').config();

async function main() {
  const { neon } = require('@neondatabase/serverless');
  const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL or NEON_DATABASE_URL is not set');
    process.exit(1);
  }
  try {
    const parsed = new URL(databaseUrl);
    console.log('db host:', parsed.host);
    console.log('db name:', parsed.pathname.replace(/^\//, ''));
  } catch {}
  const sql = neon(databaseUrl);

  const sp = await sql`show search_path;`;
  console.log('search_path:', sp[0]?.search_path);

  const [{ regclass }] = await sql`select to_regclass('public.examples') as regclass;`;
  console.log('public.examples exists as:', regclass);

  const columns = await sql`select column_name, data_type, is_nullable, column_default from information_schema.columns where table_schema = 'public' and table_name = 'examples' order by ordinal_position;`;
  console.log('examples columns:', columns);

  const [{ regclass: regChallenges }] = await sql`select to_regclass('public.challenges') as regclass;`;
  console.log('public.challenges exists as:', regChallenges);

  const [{ regclass: regSubmissions }] = await sql`select to_regclass('public.submissions') as regclass;`;
  console.log('public.submissions exists as:', regSubmissions);

  const tables = await sql`select table_name from information_schema.tables where table_schema = 'public' order by table_name;`;
  console.log('public tables:', tables.map(t => t.table_name));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


