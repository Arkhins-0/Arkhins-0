'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, FileText, Github, Globe } from 'lucide-react';
import portfolioData from '@/data/portfolio.json';
import content from '@/data/content.json';
import {
  NeonButton,
  Panel,
  Reveal,
  SectionHead,
  Stack,
  stackChild,
} from '@/components/fx';
import { CaseNotes, type NotesTarget } from './CaseNotes';
import { cn, fill } from '@/lib/utils';

const COPY = content.work;

type Project = (typeof portfolioData.projects)[number] & {
  pageUrl?: string;
  markdownFile?: string;
  role?: string;
  year?: string;
};

const ALL = portfolioData.projects.filter(
  (p) => !p.id.includes('placeholder')
) as Project[];

const CATEGORIES = [
  COPY.allFilter,
  ...Array.from(new Set(ALL.map((p) => p.category))),
];

/* --------------------------------------------------------------- mosaic */

const COLUMNS = 6;
const SPAN_CYCLE = [4, 2, 3, 3, 2, 4];

const SPAN_CLASS: Record<number, string> = {
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6',
};

/**
 * Widths for an uneven grid that always ends flush: tiles take turns being
 * wide, and whatever is left on the final row is absorbed by the last tile.
 * Works for any number of projects, which is the point.
 */
function mosaic(count: number) {
  const spans: number[] = [];
  let left = COLUMNS;

  for (let i = 0; i < count; i++) {
    if (left < 2) left = COLUMNS;
    let span = Math.min(SPAN_CYCLE[i % SPAN_CYCLE.length], left);
    if (i === count - 1 && left - span > 0) span = left;
    spans.push(span);
    left -= span;
  }
  return spans;
}

/* ----------------------------------------------------------------- card */

function ProjectCard({
  project,
  n,
  span,
  lead,
  onNotes,
}: {
  project: Project;
  n: number;
  span: number;
  lead: boolean;
  onNotes: (p: Project) => void;
}) {
  const wide = span >= 4;
  const title = project.title.split(':')[0];

  return (
    <motion.li
      variants={stackChild}
      className={cn('col-span-1', SPAN_CLASS[span] ?? SPAN_CLASS[3])}
    >
      <Panel
        hot={lead}
        cut={22}
        spotlight
        className="group/card h-full"
      >
        <div className={cn('flex h-full', wide ? 'flex-col sm:flex-row' : 'flex-col')}>
          {/* cover */}
          <div
            className={cn(
              'relative shrink-0 overflow-hidden bg-black/40',
              wide
                ? 'aspect-[16/10] w-full sm:aspect-auto sm:w-[44%] sm:self-stretch'
                : 'aspect-[16/10] w-full'
            )}
          >
            <Image
              src={project.thumbnail}
              alt={title}
              fill
              sizes={
                wide
                  ? '(max-width: 768px) 100vw, 60vw'
                  : '(max-width: 768px) 100vw, 35vw'
              }
              className="object-cover transition-transform duration-[1.1s] ease-swift group-hover/card:scale-[1.05]"
            />
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-t from-bg via-bg/25 to-transparent',
                wide && 'sm:hidden'
              )}
            />
            {wide && (
              <div className="absolute inset-0 hidden bg-gradient-to-r from-transparent via-transparent to-bg/85 sm:block" />
            )}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
              style={{
                background:
                  'linear-gradient(130deg, rgb(var(--accent-rgb) / 0.3), transparent 55%)',
                mixBlendMode: 'color',
              }}
            />

            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 right-3 font-display text-[3.5rem] font-extrabold leading-none text-white/[0.09]"
            >
              {String(n).padStart(2, '0')}
            </span>

            {lead && (
              <span className="hud absolute left-4 top-4 border border-accent/50 bg-black/55 px-2 py-1 text-accent backdrop-blur-sm">
                {COPY.featuredBadge}
              </span>
            )}
          </div>

          {/* body */}
          <div className="flex flex-1 flex-col p-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="hud text-accent">{project.category}</span>
              <span className="h-3 w-px bg-white/15" />
              <span className="hud text-ink-faint">{project.year}</span>
              {project.role && (
                <>
                  <span className="hidden h-3 w-px bg-white/15 sm:block" />
                  <span className="hud hidden text-ink-faint sm:block">
                    {project.role}
                  </span>
                </>
              )}
            </div>

            <h3
              className={cn(
                'mt-3 font-display font-bold leading-tight tracking-tight transition-colors group-hover/card:text-accent',
                wide ? 'text-2xl md:text-[1.75rem]' : 'text-xl'
              )}
            >
              {title}
            </h3>

            <p className="mt-2.5 max-w-2xl text-[0.88rem] leading-relaxed text-ink-dim">
              {project.description}
            </p>

            <ul className="mt-4 flex flex-wrap gap-1.5">
              {project.tags.map((t) => (
                <li
                  key={t}
                  className="border border-white/10 px-2 py-0.5 font-mono text-[0.63rem] text-ink-faint transition-colors group-hover/card:border-accent/25"
                >
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex-1" aria-hidden="true" />

            {/* actions */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/8 pt-4">
              {project.pageUrl && (
                <Link
                  href={project.pageUrl}
                  className="group/act hud inline-flex items-center gap-1.5 text-accent"
                >
                  <ArrowUpRight
                    size={13}
                    className="transition-transform duration-300 group-hover/act:-translate-y-0.5 group-hover/act:translate-x-0.5"
                  />
                  {COPY.caseStudyAction}
                </Link>
              )}

              {project.markdownFile && (
                <button
                  onClick={() => onNotes(project)}
                  aria-label={fill(COPY.reader.openAria, { title })}
                  className="hud inline-flex items-center gap-1.5 text-ink-faint transition-colors hover:text-accent"
                >
                  <FileText size={13} />
                  {COPY.notesAction}
                </button>
              )}

              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hud inline-flex items-center gap-1.5 text-ink-faint transition-colors hover:text-accent"
                >
                  <Globe size={13} />
                  {COPY.liveAction}
                </a>
              )}

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hud inline-flex items-center gap-1.5 text-ink-faint transition-colors hover:text-accent"
                >
                  <Github size={13} />
                  {COPY.sourceAction}
                </a>
              )}
            </div>
          </div>
        </div>
      </Panel>
    </motion.li>
  );
}

/* -------------------------------------------------------------- section */

export function Projects() {
  const [filter, setFilter] = useState(COPY.allFilter);
  const [notes, setNotes] = useState<NotesTarget>(null);

  const shown = useMemo(
    () =>
      filter === COPY.allFilter ? ALL : ALL.filter((p) => p.category === filter),
    [filter]
  );

  const spans = useMemo(() => mosaic(shown.length), [shown.length]);

  return (
    <section id="work" className="band">
      <div className="shell">
        <SectionHead {...COPY.head} />

        {/* filters */}
        <Reveal className="mt-12 flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-3">{COPY.indexLabel}</span>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              aria-pressed={filter === c}
              className={cn(
                'border px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-all duration-300',
                filter === c
                  ? 'border-accent bg-accent/12 text-accent'
                  : 'border-white/10 text-ink-faint hover:border-white/30 hover:text-ink'
              )}
            >
              {c}
            </button>
          ))}
        </Reveal>

        {/* mosaic */}
        <Stack key={filter} className="mt-6" amount={0.05}>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-6">
            {shown.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                n={i + 1}
                span={spans[i]}
                lead={i === 0}
                onNotes={setNotes}
              />
            ))}
          </ul>
        </Stack>

        {shown.length === 0 && (
          <p className="py-14 text-center font-mono text-sm text-ink-faint">
            {fill(COPY.emptyState, { filter })}
          </p>
        )}

        {/* outro */}
        <Reveal className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-white/8 pt-8">
          <p className="max-w-md text-sm text-ink-dim">{COPY.outroCopy}</p>
          <NeonButton
            href={
              portfolioData.socialLinks.find((s) => s.id === 'github')?.url || ''
            }
            external
            variant="ghost"
            icon={<Globe size={15} />}
          >
            {COPY.outroAction}
          </NeonButton>
        </Reveal>
      </div>

      <CaseNotes project={notes} onClose={() => setNotes(null)} />
    </section>
  );
}
