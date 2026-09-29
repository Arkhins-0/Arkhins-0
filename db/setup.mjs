// Applies db/schema.sql and seeds empty tables from src/data/db/<table>.json.
//   npm run db:setup            create tables, seed whatever is empty
//   npm run db:setup -- --force overwrite every table and document with the bundled JSON
import { readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { Pool } from '@neondatabase/serverless';

if (existsSync('.env')) process.loadEnvFile('.env');
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const force = process.argv.includes('--force');
const json = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const snake = (s) => s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
const pool = new Pool({ connectionString: url });

/** Seeded in this order; each has a matching JSON file. */
const TABLES = [
  'profile', 'social_links', 'experience', 'education', 'skill_categories', 'skills', 'tech_stack',
  'certifications', 'volunteering', 'workshops', 'interests', 'languages', 'projects', 'cast_members', 'guests',
];

const DOCS = { anime: '../src/data/anime.json', copy: '../src/data/copy.json' };

async function insertRows(table, rows) {
  for (const row of rows) {
    const keys = Object.keys(row);
    // Postgres infers parameter types from the target columns, so arrays and booleans need no casts;
    // objects (the project `content` document) go in as JSON text.
    const values = keys.map((k) => (row[k] !== null && typeof row[k] === 'object' && !Array.isArray(row[k]) ? JSON.stringify(row[k]) : row[k]));
    await pool.query(
      `insert into ${table} (${keys.map(snake).join(', ')}) values (${keys.map((_, i) => `$${i + 1}`).join(', ')})`,
      values
    );
  }
}

async function count(table) {
  const { rows } = await pool.query(`select count(*)::int as n from ${table}`);
  return rows[0].n;
}

try {
  await pool.query(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  console.log('schema applied');

  for (const table of TABLES) {
    if (force) await pool.query(`delete from ${table}`);
    const n = await count(table);
    if (n === 0) {
      const rows = json(`../src/data/db/${table}.json`);
      await insertRows(table, rows);
      console.log(`${table}: seeded ${rows.length} rows`);
    } else {
      console.log(`${table}: ${n} rows, kept`);
    }
  }

  for (const [key, file] of Object.entries(DOCS)) {
    const res = await pool.query(
      `insert into site_documents (key, data) values ($1, $2::jsonb)
       on conflict (key) do ${force ? 'update set data = excluded.data, updated_at = now()' : 'nothing'}`,
      [key, JSON.stringify(json(file))]
    );
    console.log(`site_documents.${key}: ${res.rowCount ? 'written' : 'kept'}`);
  }

  // The single-document era: the résumé blob is now rows, and characters left the theme document.
  const gone = await pool.query(`delete from site_documents where key = 'portfolio'`);
  if (gone.rowCount) console.log('site_documents.portfolio: removed (now the profile and résumé tables)');
  await pool.query(`update site_documents set data = data - 'cast' - 'projectCast' || $1::jsonb where key = 'anime'`, [
    JSON.stringify({ cast: json(DOCS.anime).cast, projectCast: json(DOCS.anime).projectCast }),
  ]);
  await pool.query(`update site_documents set data = data - 'fx' - 'theme' - 'storage' - 'path' - 'beyond' where key = 'copy'`);
} finally {
  await pool.end();
}
