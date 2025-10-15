/* eslint-disable */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
require('dotenv').config();

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: node scripts/run-sql.js <sql-file-path>');
    process.exit(1);
  }
  const filePath = path.resolve(process.cwd(), fileArg);
  const sqlText = fs.readFileSync(filePath, 'utf8');

  const { neon } = require('@neondatabase/serverless');
  const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL or NEON_DATABASE_URL is not set');
    process.exit(1);
  }
  const sql = neon(databaseUrl);

  // Split on semicolons; execute statements sequentially, ignoring empty lines
  const statements = sqlText
    .split(/;\s*\n|;\s*$/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    // Skip comments-only chunks
    const noComments = stmt.replace(/--.*$/gm, '').trim();
    if (!noComments) continue;
    await sql.unsafe(stmt + ';');
  }

  console.log('SQL applied successfully:', path.basename(filePath));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


