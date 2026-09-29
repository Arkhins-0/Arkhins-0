/**
 * Content repository. The single place that knows where rows come from:
 * the Neon tables in db/schema.sql, or the bundled JSON when there is no database.
 */
import 'server-only';
import { cache } from 'react';
import educationRows from '@/data/db/education.json';
import projectRows from '@/data/db/projects.json';
import type { EducationRow, ProjectRow, ShowcaseDoc } from '@/types/content';
import { getAssetPath } from '@/lib/utils';
import { query, tryQuery } from '@/lib/db';
import { TABLES, fromDb } from '@/lib/tables';

const PROJECTS = projectRows as unknown as ProjectRow[];
const EDUCATION = educationRows as unknown as EducationRow[];

const bySort = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;

const allProjects = cache(() =>
  tryQuery(async () => {
    const rows = await query('select * from projects order by sort_order, created_at');
    return rows.length ? rows.map((r) => fromDb<ProjectRow>(TABLES.projects, r)) : PROJECTS;
  }, PROJECTS)
);

/** Published projects in display order. */
export async function listProjects(): Promise<ProjectRow[]> {
  return (await allProjects()).filter((p) => p.published).sort(bySort);
}

/** Every published slug, for static generation. */
export async function listProjectSlugs(): Promise<string[]> {
  return (await listProjects()).map((p) => p.slug);
}

export async function getProject(slug: string): Promise<ProjectRow | null> {
  return (await listProjects()).find((p) => p.slug === slug) ?? null;
}

export const listEducation = cache(async (): Promise<EducationRow[]> => {
  const rows = await tryQuery(async () => {
    const r = await query('select * from education order by sort_order, created_at');
    return r.length ? r.map((x) => fromDb<EducationRow>(TABLES.education, x)) : EDUCATION;
  }, EDUCATION);
  return [...rows].sort(bySort);
});

/**
 * A project without a `content` document still gets a page: hero from the row,
 * its images as a gallery, the markdown case study inline, and the outro.
 */
export function defaultShowcase(p: ProjectRow): ShowcaseDoc {
  const actions = [
    p.liveUrl ? { label: 'Open the live build', href: p.liveUrl, external: true } : null,
    p.githubUrl ? { label: 'View source', href: p.githubUrl, external: true, kind: 'ghost' as const } : null,
  ].filter(Boolean) as ShowcaseDoc['hero']['actions'];

  const images = [p.cover, ...p.images]
    .filter((s): s is string => !!s)
    .map(getAssetPath)
    .filter((s, i, arr) => arr.indexOf(s) === i);

  const [title, accent] = splitTitle(p.title);

  return {
    version: 1,
    theme: {
      look: 'plain',
      accent: { hex: '#00f0ff', rgb: '0 240 255' },
      accent2: { hex: '#a855f7', rgb: '168 85 247' },
    },
    screens: { default: 'dark' },
    hero: {
      eyebrow: [p.category, p.year].filter(Boolean).join(' · '),
      title,
      accent,
      lede: p.description ?? p.summary,
      badges: p.tags.slice(0, 4).map((t) => ({ label: t, tone: 'muted' as const })),
      actions,
      facts: [
        p.role ? { label: 'Role', value: p.role } : null,
        p.date ? { label: 'Shipped', value: p.date } : null,
        { label: 'Status', value: p.status },
      ].filter(Boolean) as { label: string; value: string }[],
      stage: images[0] ? { center: { light: images[0], alt: p.title } } : undefined,
    },
    sections: [
      ...(images.length > 1
        ? [
            {
              type: 'gallery' as const,
              head: { index: '01', label: 'Screens', title: 'A closer', accentWord: 'look' },
              items: images.slice(1).map((src, i) => ({ light: src, alt: `${p.title} screen ${i + 1}` })),
            },
          ]
        : []),
      ...(p.markdownFile
        ? [
            {
              type: 'markdown' as const,
              head: { index: images.length > 1 ? '02' : '01', label: 'Case notes', title: 'How it was', accentWord: 'built' },
              file: p.markdownFile,
            },
          ]
        : []),
      {
        type: 'outro' as const,
        title: 'Want the code, or the',
        accentWord: 'next one?',
        actions: [
          ...(p.githubUrl ? [{ label: 'Repository', href: p.githubUrl, external: true }] : []),
          { label: 'Back to portfolio', href: '/#work', kind: 'ghost' as const },
        ],
      },
    ],
  };
}

/** "Name: Subtitle" -> ["Name", "Subtitle"]; otherwise the whole title on line one. */
function splitTitle(t: string): [string, string | undefined] {
  const i = t.indexOf(':');
  return i === -1 ? [t, undefined] : [t.slice(0, i).trim(), t.slice(i + 1).trim()];
}
