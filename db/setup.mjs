// Applies db/schema.sql and seeds empty tables from the bundled JSON.
//   npm run db:setup            create tables, seed whatever is empty
//   npm run db:setup -- --force overwrite the database with the JSON files
import { readFileSync, existsSync } from 'node:fs';
import { Pool } from '@neondatabase/serverless';

if (existsSync('.env')) process.loadEnvFile('.env');
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const force = process.argv.includes('--force');
const json = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const pool = new Pool({ connectionString: url });

const DOCS = {
  portfolio: '../src/data/portfolio.json',
  anime: '../src/data/anime.json',
  copy: '../src/data/content.json',
};

const PROJECT_COLS = {
  slug: 'slug', title: 'title', tagline: 'tagline', summary: 'summary', description: 'description',
  category: 'category', role: 'role', year: 'year', date: 'date', status: 'status', featured: 'featured',
  published: 'published', sortOrder: 'sort_order', tags: 'tags', thumbnail: 'thumbnail', cover: 'cover',
  images: 'images', githubUrl: 'github_url', liveUrl: 'live_url', markdownFile: 'markdown_file', content: 'content',
};
const EDU_COLS = {
  institution: 'institution', degree: 'degree', field: 'field', score: 'score', startYear: 'start_year',
  endYear: 'end_year', current: 'current', description: 'description', logo: 'logo', sortOrder: 'sort_order',
};

async function insertRows(table, cols, rows) {
  for (const row of rows) {
    const keys = Object.keys(cols).filter((k) => k in row);
    const values = keys.map((k) => (k === 'content' && row[k] != null ? JSON.stringify(row[k]) : row[k]));
    const marks = keys.map((k, i) => `$${i + 1}${k === 'content' ? '::jsonb' : ''}`);
    await pool.query(
      `insert into ${table} (${keys.map((k) => cols[k]).join(', ')}) values (${marks.join(', ')})`,
      values
    );
  }
}

async function empty(table) {
  const { rows } = await pool.query(`select count(*)::int as n from ${table}`);
  return rows[0].n === 0;
}

try {
  await pool.query(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  console.log('schema applied');

  for (const [key, file] of Object.entries(DOCS)) {
    const res = await pool.query(
      `insert into site_documents (key, data) values ($1, $2::jsonb)
       on conflict (key) do ${force ? 'update set data = excluded.data, updated_at = now()' : 'nothing'}`,
      [key, JSON.stringify(json(file))]
    );
    console.log(`site_documents.${key}: ${res.rowCount ? 'written' : 'kept'}`);
  }

  for (const [table, cols, file] of [
    ['projects', PROJECT_COLS, '../src/data/db/projects.json'],
    ['education', EDU_COLS, '../src/data/db/education.json'],
  ]) {
    if (force) await pool.query(`delete from ${table}`);
    if (await empty(table)) {
      const rows = json(file);
      await insertRows(table, cols, rows);
      console.log(`${table}: seeded ${rows.length} rows`);
    } else {
      console.log(`${table}: has rows, kept`);
    }
  }
} finally {
  await pool.end();
}
