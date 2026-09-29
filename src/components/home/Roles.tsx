import type { Site } from '@/lib/site';
import type { CastMemberRow, ProjectRow } from '@/types/content';
import { fill, getAssetPath } from '@/lib/utils';
import { RolePicker, type CastRole } from './RolePicker';
import { EpisodeHead } from './primitives';

/**
 * "What are you hiring for?": each cast member stands for a role, and selecting one shows the
 * real skill levels and shipped projects for that role, with a shortcut into the contact form.
 */
export function Roles({ site, members, projects }: { site: Site; members: CastMemberRow[]; projects: ProjectRow[] }) {
  const { cast, sections } = site.anime;
  const { categories, techStack } = site.portfolio.skills;
  const iconTemplate = site.copy.stack.iconPathTemplate;
  if (!members.length) return null;

  const levelled = categories.flatMap((c) => c.skills);
  const bySlug = new Map(projects.map((p) => [p.slug, p]));

  const roles: CastRole[] = members.map((m) => ({
    name: m.name,
    kana: m.kana ?? '',
    series: m.series,
    role: m.role,
    pitch: m.pitch,
    image: m.image,
    face: m.face ?? undefined,
    color: m.color,
    subject: fill(cast.subjectTemplate, { role: m.role }),
    skills: m.skills.map((name) => {
      const s = levelled.find((x) => x.name.toLowerCase() === name.toLowerCase());
      const icon = s
        ? s.icon.includes('/') ? s.icon : fill(iconTemplate, { icon: s.icon })
        : techStack.find((t) => t.name.toLowerCase() === name.toLowerCase())?.icon;
      return { name, level: s?.level ?? null, icon: icon ? getAssetPath(icon) : null };
    }),
    projects: m.projects
      .map((slug) => bySlug.get(slug))
      .filter((p): p is ProjectRow => !!p)
      .map((p) => ({ slug: p.slug, title: p.title.split(':')[0].trim(), category: p.category, thumbnail: p.thumbnail ? getAssetPath(p.thumbnail) : '' })),
  }));

  return (
    <section id="cast" className="ak-section overflow-hidden bg-[color:var(--ak-ink)] text-white">
      <div aria-hidden="true" className="ak-speedlines opacity-30 [filter:invert(1)]" />
      <div className="ak-shell relative">
        <EpisodeHead copy={sections.cast} className="[&_p]:!text-white/75" />
        <RolePicker
          roles={roles}
          labels={{
            role: cast.roleLabel,
            skills: cast.skillsLabel,
            proof: cast.proofLabel,
            hire: cast.hireAction,
            work: cast.workAction,
          }}
        />
      </div>
    </section>
  );
}
