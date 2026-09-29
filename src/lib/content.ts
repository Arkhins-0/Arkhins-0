/**
 * Content repository. The single place that knows where rows come from:
 * the Neon tables in db/schema.sql, or the bundled JSON under src/data/db when there is no database.
 */
import 'server-only';
import { cache } from 'react';
import castMembers from '@/data/db/cast_members.json';
import certifications from '@/data/db/certifications.json';
import education from '@/data/db/education.json';
import experience from '@/data/db/experience.json';
import guests from '@/data/db/guests.json';
import interests from '@/data/db/interests.json';
import languages from '@/data/db/languages.json';
import profile from '@/data/db/profile.json';
import projects from '@/data/db/projects.json';
import skillCategories from '@/data/db/skill_categories.json';
import skills from '@/data/db/skills.json';
import socialLinks from '@/data/db/social_links.json';
import techStack from '@/data/db/tech_stack.json';
import volunteering from '@/data/db/volunteering.json';
import workshops from '@/data/db/workshops.json';
import type {
  BaseRow,
  CastMemberRow,
  CertificationRow,
  EducationRow,
  ExperienceRow,
  GuestRow,
  InterestRow,
  LanguageRow,
  ProfileRow,
  ProjectRow,
  ShowcaseDoc,
  SkillCategoryRow,
  SkillRow,
  SocialLinkRow,
  TechStackRow,
  VolunteeringRow,
  WorkshopRow,
} from '@/types/content';
import { getAssetPath } from '@/lib/utils';
import { query, tryQuery } from '@/lib/db';
import { TABLES, type TableKey, fromDb } from '@/lib/tables';

/** Row type for each table key. */
export type RowOf = {
  profile: ProfileRow;
  social_links: SocialLinkRow;
  experience: ExperienceRow;
  education: EducationRow;
  skill_categories: SkillCategoryRow;
  skills: SkillRow;
  tech_stack: TechStackRow;
  certifications: CertificationRow;
  volunteering: VolunteeringRow;
  workshops: WorkshopRow;
  interests: InterestRow;
  languages: LanguageRow;
  projects: ProjectRow;
  cast_members: CastMemberRow;
  guests: GuestRow;
};

/** Bundled seeds. They carry no ids; `listRows` gives them stable ones. */
const SEEDS: { [K in TableKey]: Omit<RowOf[K], 'id'>[] } = {
  profile: profile as never,
  social_links: socialLinks as never,
  experience: experience as never,
  education: education as never,
  skill_categories: skillCategories as never,
  skills: skills as never,
  tech_stack: techStack as never,
  certifications: certifications as never,
  volunteering: volunteering as never,
  workshops: workshops as never,
  interests: interests as never,
  languages: languages as never,
  projects: projects as never,
  cast_members: castMembers as never,
  guests: guests as never,
};

const bySort = <T extends BaseRow>(a: T, b: T) => a.sortOrder - b.sortOrder;

function seeded<K extends TableKey>(table: K): RowOf[K][] {
  return (SEEDS[table] as Omit<RowOf[K], 'id'>[]).map((r, i) => ({ ...r, id: `${table}-${i + 1}` }) as RowOf[K]);
}

/** Every row of a table in display order, from the database or the bundled JSON. */
export const listRows = cache(async <K extends TableKey>(table: K): Promise<RowOf[K][]> => {
  const spec = TABLES[table];
  const rows = await tryQuery(async () => {
    const r = await query(`select * from ${spec.name} order by sort_order, created_at`);
    return r.length ? r.map((x) => fromDb<RowOf[K]>(spec, x)) : seeded(table);
  }, seeded(table));
  return [...rows].sort(bySort);
});

/** Published projects in display order. */
export async function listProjects(): Promise<ProjectRow[]> {
  return (await listRows('projects')).filter((p) => p.published);
}

/** Every published slug, for static generation. */
export async function listProjectSlugs(): Promise<string[]> {
  return (await listProjects()).map((p) => p.slug);
}

export async function getProject(slug: string): Promise<ProjectRow | null> {
  return (await listProjects()).find((p) => p.slug === slug) ?? null;
}

export const listEducation = () => listRows('education');

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
