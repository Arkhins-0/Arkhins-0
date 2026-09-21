'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Github, Globe } from 'lucide-react';
import portfolioData from '@/data/portfolio.json';
import content from '@/data/content.json';
import { NeonButton, Reveal, SectionHead, Stack, stackChild } from '@/components/fx';
import { cn, fill } from '@/lib/utils';
import type { ProjectRow } from '@/types/content';

const COPY = content.work;

/** ProjectRow: ledger-style entry with number, cover, copy and actions. Every row opens /projects/<slug>. */
function Row({ project, n, lead }: { project: ProjectRow; n: number; lead: boolean }) {
  const title = project.title.split(':')[0];
  const href = `/projects/${project.slug}`;

  return (
    <motion.li variants={stackChild} className="group relative border-b border-white/10">
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'linear-gradient(90deg, rgb(var(--accent-rgb) / 0.09), transparent 58%)' }} />
      <span aria-hidden="true" className="absolute left-0 top-0 h-full w-px origin-top scale-y-0 bg-accent transition-transform duration-700 ease-swift group-hover:scale-y-100" style={{ boxShadow: '0 0 14px rgb(var(--accent-rgb) / 0.8)' }} />

      <div className="relative grid gap-5 py-7 pl-4 pr-1 transition-transform duration-500 ease-swift group-hover:translate-x-2 md:grid-cols-[3rem_minmax(0,16rem)_minmax(0,1fr)] md:items-center md:gap-8 md:py-9 md:pl-6">
        <div className="flex items-center gap-3 md:block">
          <span className="font-display text-2xl font-extrabold leading-none text-white/25 transition-colors duration-500 group-hover:text-accent md:text-[2.75rem]">{String(n).padStart(2, '0')}</span>
          <span aria-hidden="true" className="hazard h-3 w-8 opacity-45 transition-opacity duration-500 group-hover:opacity-90 md:mt-4 md:block" />
        </div>

        <Link href={href} className="notch-br relative block aspect-[16/10] overflow-hidden border border-white/10 bg-black/40 transition-colors duration-500 group-hover:border-accent/40" style={{ ['--notch' as string]: '16px' }} aria-label={fill(COPY.openAria, { title })}>
          <Image src={project.thumbnail} alt={title} fill sizes="(max-width: 768px) 100vw, 16rem" className="object-cover saturate-[0.65] transition-all duration-[1.1s] ease-swift group-hover:scale-[1.06] group-hover:saturate-100" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/80 via-bg/10 to-transparent transition-opacity duration-500 group-hover:opacity-40" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'linear-gradient(130deg, rgb(var(--accent-rgb) / 0.35), transparent 60%)', mixBlendMode: 'color' }} />
          {lead && <span className="hud absolute left-3 top-3 border border-accent/50 bg-black/60 px-2 py-1 text-accent backdrop-blur-sm">{COPY.featuredBadge}</span>}
        </Link>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="hud text-accent">{project.category}</span>
            {project.year && (<><span className="h-3 w-px bg-white/15" /><span className="hud text-ink-faint">{project.year}</span></>)}
            {project.role && (<><span className="hidden h-3 w-px bg-white/15 sm:block" /><span className="hud hidden text-ink-faint sm:block">{project.role}</span></>)}
          </div>

          <div className="mt-2 flex items-start justify-between gap-4">
            <h3 className="font-display text-2xl font-bold leading-tight tracking-tight transition-colors duration-300 group-hover:text-accent md:text-[1.9rem]">
              <Link href={href}>{title}</Link>
            </h3>
            <ArrowUpRight size={20} aria-hidden="true" className="mt-1 shrink-0 text-ink-faint opacity-0 transition-all duration-500 ease-swift group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent group-hover:opacity-100" />
          </div>

          <p className="mt-2.5 max-w-2xl text-[0.88rem] leading-relaxed text-ink-dim">{project.summary}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
            <ul className="flex flex-wrap gap-1.5">
              {project.tags.map((t) => <li key={t} className="border border-white/10 px-2 py-0.5 font-mono text-[0.63rem] text-ink-faint transition-colors group-hover:border-accent/25">{t}</li>)}
            </ul>
            <span aria-hidden="true" className="hidden h-px flex-1 bg-white/10 sm:block" />
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link href={href} className="group/act hud inline-flex items-center gap-1.5 text-accent">
                <ArrowUpRight size={13} className="transition-transform duration-300 group-hover/act:-translate-y-0.5 group-hover/act:translate-x-0.5" />
                {COPY.caseStudyAction}
              </Link>
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="group/act hud inline-flex items-center gap-1.5 text-ink-faint transition-colors hover:text-accent">
                  <Globe size={13} />{COPY.liveAction}
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="hud inline-flex items-center gap-1.5 text-ink-faint transition-colors hover:text-accent">
                  <Github size={13} />{COPY.sourceAction}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

/** Projects: filterable work ledger. Data arrives from the server page via the content repository. */
export function Projects({ projects }: { projects: ProjectRow[] }) {
  const [filter, setFilter] = useState(COPY.allFilter);
  const categories = useMemo(() => [COPY.allFilter, ...Array.from(new Set(projects.map((p) => p.category)))], [projects]);
  const shown = useMemo(() => (filter === COPY.allFilter ? projects : projects.filter((p) => p.category === filter)), [filter, projects]);

  return (
    <section id="work" className="band">
      <div className="shell">
        <SectionHead {...COPY.head} />

        <Reveal className="mt-12 flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-3">{COPY.indexLabel}</span>
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)} aria-pressed={filter === c}
              className={cn('border px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-all duration-300', filter === c ? 'border-accent bg-accent/12 text-accent' : 'border-white/10 text-ink-faint hover:border-white/30 hover:text-ink')}>
              {c}
            </button>
          ))}
          <span className="hud ml-auto hidden text-ink-faint sm:block">{String(shown.length).padStart(2, '0')}</span>
        </Reveal>

        <Stack key={filter} className="mt-8" amount={0.05}>
          <ol className="border-t border-white/10">
            {shown.map((p, i) => <Row key={p.id} project={p} n={i + 1} lead={i === 0} />)}
          </ol>
        </Stack>

        {shown.length === 0 && <p className="py-14 text-center font-mono text-sm text-ink-faint">{fill(COPY.emptyState, { filter })}</p>}

        <Reveal className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-white/8 pt-8">
          <p className="max-w-md text-sm text-ink-dim">{COPY.outroCopy}</p>
          <NeonButton href={portfolioData.socialLinks.find((s) => s.id === 'github')?.url || ''} external variant="ghost" icon={<Globe size={15} />}>
            {COPY.outroAction}
          </NeonButton>
        </Reveal>
      </div>
    </section>
  );
}
