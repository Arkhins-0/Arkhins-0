'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';
import type { ProjectRow } from '@/types/content';
import { cn, fill } from '@/lib/utils';
import { Pop } from './Pop';
import { type Guest, ProjectPanel } from './ProjectPanel';

type Copy = {
  allFilter: string;
  emptyState: string;
  caseStudyAction: string;
  featuredBadge: string;
  outroCopy: string;
  outroAction: string;
};

/** Filter chips over the manga-panel grid. Featured projects take a double-width panel. */
export function Work({
  projects,
  copy,
  githubUrl,
  allHref,
  allLabel,
  guests,
  guestLabel,
}: {
  guests: Record<string, Guest>;
  guestLabel: string;
  projects: ProjectRow[];
  copy: Copy;
  githubUrl?: string;
  allHref: string;
  allLabel: string;
}) {
  const categories = useMemo(() => Array.from(new Set(projects.map((p) => p.category))), [projects]);
  const [filter, setFilter] = useState<string | null>(null);
  const shown = filter ? projects.filter((p) => p.category === filter) : projects;
  // When every card is featured (the home page), the badge says nothing: hide it, and lay the
  // cards out as an even two-column grid instead of one wide lead panel.
  const allFeatured = projects.length > 0 && projects.every((p) => p.featured);
  const featured = allFeatured ? '' : copy.featuredBadge.replace(/^★\s*/, '');

  return (
    <>
      <Pop className="mt-10 flex flex-wrap gap-2" delay={0.05}>
        {[null, ...categories].map((c) => (
          <button
            key={c ?? 'all'}
            type="button"
            onClick={() => setFilter(c)}
            aria-pressed={filter === c}
            className={cn(
              'ak-tag px-4 py-1.5 text-sm transition-transform hover:-translate-y-0.5',
              filter === c ? 'bg-[color:var(--ak-ink)] text-white' : 'bg-white'
            )}
          >
            {c ?? copy.allFilter}
            <span className="text-[0.65rem] opacity-70">{c ? projects.filter((p) => p.category === c).length : projects.length}</span>
          </button>
        ))}
        <Link
          href={allHref}
          className="ml-auto inline-flex items-center gap-1.5 self-center text-sm font-extrabold underline decoration-[color:var(--ak-sakura)] decoration-2 underline-offset-4 hover:text-[color:var(--ak-sakura)]"
        >
          {allLabel}
          <ArrowRight size={15} />
        </Link>
      </Pop>

      {shown.length === 0 ? (
        <p className="mt-10 font-bold text-[color:var(--ak-ink-2)]">{fill(copy.emptyState, { filter: filter ?? '' })}</p>
      ) : (
        <ul className={cn('mt-10 grid gap-7 md:grid-cols-2', !allFeatured && 'lg:grid-cols-3')}>
          {shown.map((p, i) => {
            // The lead featured project gets a double-width panel; the next one fills the row beside it.
            const big = !allFeatured && i === 0 && p.featured && !filter;
            return (
              <Pop as="li" key={p.id} delay={(i % 3) * 0.06} className={cn(big && 'md:col-span-2')}>
                <ProjectPanel
                  project={p}
                  index={projects.indexOf(p)}
                  big={big}
                  openLabel={copy.caseStudyAction}
                  featuredLabel={featured}
                  guest={guests[p.slug]}
                  guestLabel={guestLabel}
                />
              </Pop>
            );
          })}
        </ul>
      )}

      <Pop className="ak-cel mt-12 flex flex-col items-start justify-between gap-4 bg-[color:var(--ak-sky-soft)] px-6 py-5 sm:flex-row sm:items-center">
        <p className="font-bold">{copy.outroCopy}</p>
        <div className="flex flex-wrap gap-3">
          <Link href={allHref} className="ak-btn px-4 py-2 text-sm">
            {allLabel}
            <ArrowRight size={16} />
          </Link>
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="ak-btn ak-btn-ghost px-4 py-2 text-sm">
              <Github size={16} />
              {copy.outroAction}
            </a>
          )}
        </div>
      </Pop>
    </>
  );
}
