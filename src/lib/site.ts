import 'server-only';
import { cache } from 'react';
import portfolioDefault from '@/data/portfolio.json';
import copyDefault from '@/data/content.json';
import animeDefault from '@/data/anime.json';
import { execute, query, tryQuery } from '@/lib/db';

export type Portfolio = typeof portfolioDefault;
export type Copy = typeof copyDefault;
export type Anime = typeof animeDefault;

/** Editable site documents, stored as rows of `site_documents` keyed by name. */
export const SITE_DOCS = {
  portfolio: { label: 'Profile & résumé', fallback: portfolioDefault },
  anime: { label: 'Anime theme', fallback: animeDefault },
  copy: { label: 'Interface copy', fallback: copyDefault },
} as const;

export type SiteDocKey = keyof typeof SITE_DOCS;

export const isSiteDocKey = (k: string): k is SiteDocKey => k in SITE_DOCS;

/**
 * A stored document laid over its bundled default, key by key, so fields added to the
 * JSON later still show up for rows saved before they existed.
 */
function overlay<T extends object>(base: T, stored: unknown): T {
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(stored)) {
    const b = (base as Record<string, unknown>)[k];
    out[k] =
      b && typeof b === 'object' && !Array.isArray(b) && v && typeof v === 'object' && !Array.isArray(v)
        ? overlay(b as object, v)
        : v;
  }
  return out as T;
}

export const getSiteDoc = cache(async <K extends SiteDocKey>(key: K): Promise<(typeof SITE_DOCS)[K]['fallback']> => {
  const fallback = SITE_DOCS[key].fallback;
  const rows = await tryQuery(
    () => query<{ data: unknown }>('select data from site_documents where key = $1', [key]),
    []
  );
  return overlay(fallback, rows[0]?.data);
});

/** The admin's view of a document: straight from the database, never from the page cache. */
export async function readSiteDocFresh<K extends SiteDocKey>(key: K): Promise<(typeof SITE_DOCS)[K]['fallback']> {
  const rows = await execute<{ data: unknown }>('select data from site_documents where key = $1', [key]);
  return overlay(SITE_DOCS[key].fallback, rows[0]?.data);
}

export const getSite = cache(async () => {
  const [portfolio, anime, copy] = await Promise.all([
    getSiteDoc('portfolio'),
    getSiteDoc('anime'),
    getSiteDoc('copy'),
  ]);
  return { portfolio, anime, copy };
});

export type Site = Awaited<ReturnType<typeof getSite>>;

/** Placeholder rows in the résumé file ("Your Company Name" …) are kept as templates, never shown. */
export const isReal = (row: { id?: string }) => !row.id?.includes('placeholder');

import type { Guest } from '@/types/anime';
export type { Guest };

/**
 * One guest character per project, never repeated: the slug's own entry when it has one,
 * otherwise the next unused spare. Projects left over once spares run out get no guest.
 */
export function guestsFor(slugs: string[], cast: Anime['projectCast']): Record<string, Guest> {
  const bySlug = cast.bySlug as Record<string, Guest>;
  const used = new Set<string>();
  const out: Record<string, Guest> = {};
  for (const slug of slugs) {
    const g = bySlug[slug];
    if (g?.image && !used.has(g.name)) {
      out[slug] = g;
      used.add(g.name);
    }
  }
  const spares = (cast.spares as Guest[]).filter((g) => g.image && !used.has(g.name));
  for (const slug of slugs) {
    if (out[slug]) continue;
    const g = spares.shift();
    if (!g) break;
    out[slug] = g;
    used.add(g.name);
  }
  return out;
}
