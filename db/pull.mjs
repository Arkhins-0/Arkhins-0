// Copies the live database back into the bundled JSON under src/data, the reverse of db:setup.
//   npm run db:pull            rewrite the files that differ from the database
//   npm run db:pull -- --dry   report what would change, write nothing
//
// Use it after editing in /admin, so the fallback JSON (used when the database is unreachable,
// and by db:setup on a fresh database) matches what the site actually shows.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { Pool } from '@neondatabase/serverless';
import { DOCS, SERVER_COLUMNS, TABLES, camel } from './tables.mjs';

if (existsSync('.env')) process.loadEnvFile('.env');
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const dry = process.argv.includes('--dry');
const pool = new Pool({ connectionString: url });

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const readJson = (file) => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null);
const text = (value) => JSON.stringify(value, null, 2) + '\n';

/**
 * Postgres jsonb re-sorts object keys. Lay the stored value out in the key order the local file
 * already uses (new keys go last), so a pull only shows real changes in a diff.
 */
function orderLike(value, like) {
  if (Array.isArray(value)) return value.map((v, i) => orderLike(v, Array.isArray(like) ? like[i] : undefined));
  if (!isObj(value)) return value;
  const ref = isObj(like) ? like : {};
  const keys = [...Object.keys(ref).filter((k) => k in value), ...Object.keys(value).filter((k) => !(k in ref))];
  return Object.fromEntries(keys.map((k) => [k, orderLike(value[k], ref[k])]));
}

/**
 * Site documents work as defaults (the file) plus overrides (the database), exactly as the site
 * reads them. The pull takes the stored value for every key the file knows, keeps keys only the
 * file has (added in code, not yet saved from /admin), and ignores stored keys the file no longer
 * has: leftovers the site never reads. Lists are taken whole from the database.
 */
function mergeDoc(local, stored, path, dropped) {
  if (!isObj(local) || !isObj(stored)) return orderLike(stored, local);
  for (const k of Object.keys(stored)) if (!(k in local)) dropped.push(path + k);
  return Object.fromEntries(
    Object.keys(local).map((k) => [k, k in stored ? mergeDoc(local[k], stored[k], `${path}${k}.`, dropped) : local[k]])
  );
}

/** A database row as a seed row: camelCase keys, server-managed columns dropped. */
function toSeed(row) {
  return Object.fromEntries(
    Object.entries(row)
      .filter(([col]) => !SERVER_COLUMNS.includes(col))
      .map(([col, v]) => [camel(col), v])
  );
}

/** Match each database row to its local counterpart, so nested documents keep their key order. */
function localTwin(table, seed, local, i) {
  if (!Array.isArray(local)) return undefined;
  if (table === 'projects') return local.find((r) => r.slug === seed.slug);
  return local[i];
}

const report = [];
function save(file, value, detail) {
  const before = existsSync(file) ? readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : null;
  const after = text(value);
  const changed = before !== after;
  if (changed && !dry) writeFileSync(file, after);
  report.push({ file, status: before === null ? 'new' : changed ? (dry ? 'would change' : 'updated') : 'same', detail });
}

try {
  for (const table of TABLES) {
    const file = `src/data/db/${table}.json`;
    const local = readJson(file);
    const { rows } = await pool.query(`select * from ${table} order by sort_order, created_at`);
    const seeds = rows.map((row, i) => {
      const seed = toSeed(row);
      return orderLike(seed, localTwin(table, seed, local, i));
    });
    save(file, seeds, `${seeds.length} rows`);
  }

  const { rows: docs } = await pool.query('select key, data from site_documents');
  for (const [key, file] of Object.entries(DOCS)) {
    const doc = docs.find((d) => d.key === key);
    if (!doc) {
      report.push({ file, status: 'skipped', detail: 'not in the database' });
      continue;
    }
    const dropped = [];
    const merged = mergeDoc(readJson(file), doc.data, '', dropped);
    save(file, merged, dropped.length ? `document; ignored ${dropped.length} unused stored key(s): ${dropped.slice(0, 6).join(', ')}${dropped.length > 6 ? ' ...' : ''}` : 'document');
  }
} finally {
  await pool.end();
}

const width = Math.max(...report.map((r) => r.file.length));
for (const r of report) console.log(`${r.file.padEnd(width)}  ${r.status.padEnd(12)}  ${r.detail}`);
const changed = report.filter((r) => r.status === 'updated' || r.status === 'would change' || r.status === 'new').length;
console.log(dry ? `\n${changed} file(s) would change. Run without --dry to write them.` : `\n${changed} file(s) written.`);
