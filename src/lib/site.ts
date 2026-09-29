import 'server-only';
import { cache } from 'react';
import copyDefault from '@/data/copy.json';
import animeDefault from '@/data/anime.json';
import type { Guest } from '@/types/guest';
import type { GuestRow, Portfolio, ProfileRow } from '@/types/content';
import { execute, query, tryQuery } from '@/lib/db';
import { listRows } from '@/lib/content';

export type { Guest };
export type Copy = typeof copyDefault;
export type Anime = typeof animeDefault;

/** Editable site documents, stored as rows of `site_documents` keyed by name. */
export const SITE_DOCS = {
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

/** The one profile row (the bundled one when the table is empty). */
export const getProfile = cache(async (): Promise<ProfileRow> => (await listRows('profile'))[0]);

/** The résumé, assembled from its tables in the shape the sections read. */
export const getPortfolio = cache(async (): Promise<Portfolio> => {
  const [profile, socialLinks, experience, categories, skills, techStack, certifications, volunteering, workshops, interests, languages] =
    await Promise.all([
      getProfile(),
      listRows('social_links'),
      listRows('experience'),
      listRows('skill_categories'),
      listRows('skills'),
      listRows('tech_stack'),
      listRows('certifications'),
      listRows('volunteering'),
      listRows('workshops'),
      listRows('interests'),
      listRows('languages'),
    ]);

  // Skills join their card by category name; a name without a card still gets one.
  const cards = categories.map((c) => ({ ...c, skills: skills.filter((s) => s.category === c.name) }));
  for (const s of skills) {
    if (cards.some((c) => c.name === s.category)) continue;
    cards.push({
      id: `category-${s.category}`,
      name: s.category,
      description: null,
      sortOrder: 1000 + cards.length,
      skills: skills.filter((x) => x.category === s.category),
    });
  }

  return {
    profile,
    socialLinks,
    experience,
    skills: { categories: cards.filter((c) => c.skills.length), techStack },
    certifications,
    volunteering,
    workshops,
    interests,
    languages,
  };
});

export const getSite = cache(async () => {
  const [portfolio, anime, copy] = await Promise.all([getPortfolio(), getSiteDoc('anime'), getSiteDoc('copy')]);
  return { portfolio, anime, copy };
});

export type Site = Awaited<ReturnType<typeof getSite>>;

const toGuest = (g: GuestRow): Guest => ({
  name: g.name,
  series: g.series,
  line: g.line,
  image: g.image,
  face: g.face ?? undefined,
  poses: g.poses,
});

/**
 * One guest character per project, never repeated: the slug's own row when it has one,
 * otherwise the next unused spare. Projects left over once spares run out get no guest.
 */
export function guestsFor(slugs: string[], guests: GuestRow[]): Record<string, Guest> {
  const used = new Set<string>();
  const out: Record<string, Guest> = {};
  for (const slug of slugs) {
    const g = guests.find((x) => x.projectSlug === slug);
    if (g?.image && !used.has(g.name)) {
      out[slug] = toGuest(g);
      used.add(g.name);
    }
  }
  const spares = guests.filter((g) => !g.projectSlug && g.image && !used.has(g.name));
  for (const slug of slugs) {
    if (out[slug]) continue;
    const g = spares.shift();
    if (!g) break;
    out[slug] = toGuest(g);
    used.add(g.name);
  }
  return out;
}
