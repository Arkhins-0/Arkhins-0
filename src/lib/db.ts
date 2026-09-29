import 'server-only';
import { neon } from '@neondatabase/serverless';

/**
 * Neon over HTTP. `null` when DATABASE_URL is unset, in which case readers fall back
 * to the JSON files under src/data so the site still builds and renders.
 */
// The HTTP driver pools on Neon's side already; the -pooler host has no HTTP endpoint in this region.
const url = process.env.DATABASE_URL || process.env.DATABASE_URL_POOLED;
/** Tag for every read; admin saves call revalidateTag(DB_TAG) so edits show on the next request. */
export const DB_TAG = 'db';

// Next 14 caches server fetch() calls, including the driver's POSTs, across requests and builds.
// Public pages read through `query`: tagged so admin saves purge it, aging out after five minutes
// for edits made elsewhere. The admin reads and writes through `execute`, which never touches the
// cache, so it can't load a stale copy and save it back over newer data.
const cached = url
  ? neon(url, { fetchOptions: { next: { revalidate: 300, tags: [DB_TAG] } } as RequestInit })
  : null;
const fresh = url ? neon(url, { fetchOptions: { cache: 'no-store' } }) : null;

export const hasDb = cached !== null;

type Client = NonNullable<typeof cached>;

async function run<T>(client: Client | null, text: string, params: unknown[]): Promise<T[]> {
  if (!client) throw new Error('DATABASE_URL is not configured');
  try {
    return (await client.query(text, params)) as T[];
  } catch (err) {
    // Connection-level failures (a flaky DNS answer for Neon's HTTP host) get two retries;
    // SQL errors are thrown as they are.
    if (!(err instanceof Error) || !/fetch failed|Error connecting/i.test(err.message)) throw err;
    for (let attempt = 1; ; attempt++) {
      await new Promise((r) => setTimeout(r, 400 * attempt));
      try {
        return (await client.query(text, params)) as T[];
      } catch (again) {
        if (attempt >= 2 || !(again instanceof Error) || !/fetch failed|Error connecting/i.test(again.message)) throw again;
      }
    }
  }
}

/** Cached read for public pages. */
export function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  return run<T>(cached, text, params);
}

/** Uncached read or write, for the admin. */
export function execute<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  return run<T>(fresh, text, params);
}

/** Runs a read, returning `fallback` when there is no database or the query fails. */
export async function tryQuery<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  if (!cached) return fallback;
  try {
    return await run();
  } catch (err) {
    console.error('[db] falling back to bundled JSON:', err instanceof Error ? err.message : err);
    return fallback;
  }
}
