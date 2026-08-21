'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { ArrowUpRight, Github, Globe } from 'lucide-react';
import portfolioData from '@/data/portfolio.json';
import {
  NeonButton,
  Panel,
  Reveal,
  SectionHead,
  Stack,
  stackChild,
} from '@/components/fx';
import { cn } from '@/lib/utils';

type Project = (typeof portfolioData.projects)[number] & {
  pageUrl?: string;
  role?: string;
  year?: string;
};

const ALL = portfolioData.projects.filter(
  (p) => !p.id.includes('placeholder')
) as Project[];

const FEATURED = ALL[0];
const REST = ALL.slice(1);

const CATEGORIES = ['All', ...Array.from(new Set(REST.map((p) => p.category)))];

function destination(p: Project) {
  return p.pageUrl || p.liveUrl || p.githubUrl || '';
}

/* ------------------------------------------------------------ hover peek */

/** Thumbnail that trails the cursor over the project index, tilting with its
 *  own horizontal velocity so it feels weighted rather than pinned. */
function Peek({ project }: { project: Project | null }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 170, damping: 20, mass: 0.55 });
  const sy = useSpring(my, { stiffness: 170, damping: 20, mass: 0.55 });
  const vx = useVelocity(sx);
  const rotate = useTransform(vx, [-1400, 0, 1400], [-14, 0, 14], {
    clamp: true,
  });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [mx, my]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 hidden lg:block"
    >
      <motion.div style={{ x: sx, y: sy, rotate }} className="absolute left-0 top-0">
        <AnimatePresence>
          {project && (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative -translate-x-1/2 -translate-y-1/2"
            >
              <div
                className="notch-diag relative h-[13rem] w-[19rem] overflow-hidden border border-accent/40"
                style={{
                  ['--notch' as string]: '16px',
                  boxShadow: '0 0 60px rgb(var(--accent-rgb) / 0.35)',
                }}
              >
                <Image
                  src={project.thumbnail}
                  alt=""
                  fill
                  sizes="304px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="hud absolute bottom-3 left-3 text-accent">
                  {project.category}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------ index row */

function IndexRow({
  project,
  n,
  onEnter,
  onLeave,
}: {
  project: Project;
  n: number;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const href = destination(project);
  const internal = Boolean(project.pageUrl);
  const Wrapper: any = internal ? Link : 'a';
  const title = project.title.split(':')[0];

  return (
    <motion.li
      variants={stackChild}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="group relative border-b border-white/8"
    >
      {/* accent wash that wipes in from the left */}
      <span
        aria-hidden="true"
        className="absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-accent/12 to-transparent transition-transform duration-500 ease-swift group-hover:scale-x-100"
      />
      <Wrapper
        {...(internal
          ? { href }
          : { href, target: '_blank', rel: 'noopener noreferrer' })}
        className="relative flex flex-col gap-2 py-6 transition-transform duration-500 ease-swift group-hover:translate-x-3 sm:flex-row sm:items-center sm:gap-6 sm:py-7"
      >
        <span className="hud w-8 shrink-0 text-accent/70">
          {String(n).padStart(2, '0')}
        </span>

        <h3 className="flex-1 font-display text-[clamp(1.4rem,3.4vw,2.4rem)] font-bold leading-tight tracking-tight transition-colors group-hover:text-accent">
          {title}
        </h3>

        <div className="flex shrink-0 items-center gap-4 sm:gap-8">
          <span className="hud hidden text-ink-faint md:block">
            {project.role}
          </span>
          <span className="hud text-ink-faint">{project.year}</span>
          <ArrowUpRight
            size={20}
            className="text-ink-faint transition-all duration-500 ease-swift group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent"
          />
        </div>
      </Wrapper>

      {/* tag strip, revealed on hover for desktop, always on for touch */}
      <div className="relative -mt-1 flex flex-wrap gap-2 pb-5 transition-opacity duration-500 sm:pl-14 lg:max-h-0 lg:overflow-hidden lg:pb-0 lg:opacity-0 lg:group-hover:max-h-20 lg:group-hover:pb-5 lg:group-hover:opacity-100">
        {project.tags.map((t) => (
          <span
            key={t}
            className="border border-white/10 px-2 py-0.5 font-mono text-[0.65rem] text-ink-faint"
          >
            {t}
          </span>
        ))}
      </div>
    </motion.li>
  );
}

/* ------------------------------------------------------------- section */

export function Projects() {
  const [filter, setFilter] = useState('All');
  const [peek, setPeek] = useState<Project | null>(null);

  const rows = useMemo(
    () => (filter === 'All' ? REST : REST.filter((p) => p.category === filter)),
    [filter]
  );

  return (
    <section id="work" className="band">
      <div className="shell">
        <SectionHead
          index="03"
          label="Selected work"
          title="Things I have"
          accentWord="shipped"
          lede="A case study, a few products, and the experiments in between. Each one taught me something the tutorial didn't."
        />

        {/* ------------------------------------------------- featured */}
        <Reveal className="mt-14">
          <Panel hot cut={30} className="group/f overflow-hidden">
            <div className="grid lg:grid-cols-[1.15fr_1fr]">
              {/* visual */}
              <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[26rem]">
                <Image
                  src={FEATURED.images?.[0] || FEATURED.thumbnail}
                  alt={FEATURED.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover transition-transform duration-[1.2s] ease-swift group-hover/f:scale-[1.04]"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-bg via-bg/35 to-transparent" />
                <div
                  className="pointer-events-none absolute inset-0 opacity-[calc(0.4*var(--fx))] mix-blend-color"
                  style={{
                    background:
                      'linear-gradient(140deg, rgb(var(--accent-rgb) / 0.75), transparent 65%)',
                  }}
                />
                <span
                  className="hud absolute left-5 top-5 border border-accent/50 bg-black/45 px-2.5 py-1 text-accent backdrop-blur-sm">
                  ★ Featured case study
                </span>
              </div>

              {/* copy */}
              <div className="flex flex-col justify-center gap-5 p-7 md:p-10">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="hud text-accent">{FEATURED.category}</span>
                  <span className="h-3 w-px bg-white/15" />
                  <span className="hud text-ink-faint">{FEATURED.date}</span>
                  <span className="h-3 w-px bg-white/15" />
                  <span className="hud text-ink-faint">{FEATURED.status}</span>
                </div>

                <h3 className="font-display text-[clamp(1.7rem,3.6vw,2.9rem)] font-extrabold leading-[0.98] tracking-tightest">
                  {FEATURED.title.split(':')[0]}
                  <span className="neon-text">.</span>
                </h3>

                <p className="max-w-lg text-[0.95rem] leading-relaxed text-ink-dim">
                  {FEATURED.description}
                </p>

                <ul className="flex flex-wrap gap-2">
                  {FEATURED.tags.map((t) => (
                    <li
                      key={t}
                      className="border border-accent/25 bg-accent/8 px-2.5 py-1 font-mono text-[0.65rem] text-accent"
                    >
                      {t}
                    </li>
                  ))}
                </ul>

                <div className="mt-2 flex flex-wrap gap-3">
                  <NeonButton
                    href={FEATURED.pageUrl!}
                    icon={<ArrowUpRight size={15} />}
                  >
                    Read case study
                  </NeonButton>
                  <NeonButton
                    href={FEATURED.githubUrl}
                    external
                    variant="ghost"
                    icon={<Github size={15} />}
                  >
                    Source
                  </NeonButton>
                </div>
              </div>
            </div>
          </Panel>
        </Reveal>

        {/* ------------------------------------------------- filters */}
        <Reveal className="mt-16 flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-3">Index</span>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
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

        {/* ------------------------------------------------- index list */}
        <Stack key={filter} className="mt-6 border-t border-white/8" amount={0.05}>
          <ul>
            {rows.map((p, i) => (
              <IndexRow
                key={p.id}
                project={p}
                n={i + 2}
                onEnter={() => setPeek(p)}
                onLeave={() => setPeek(null)}
              />
            ))}
          </ul>
        </Stack>

        {rows.length === 0 && (
          <p className="py-14 text-center font-mono text-sm text-ink-faint">
            Nothing filed under “{filter}” yet.
          </p>
        )}

        {/* ------------------------------------------------- outro */}
        <Reveal className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-white/8 pt-8">
          <p className="max-w-md text-sm text-ink-dim">
            More experiments, half-finished ideas and commit history live on
            GitHub.
          </p>
          <NeonButton
            href={
              portfolioData.socialLinks.find((s) => s.id === 'github')?.url || ''
            }
            external
            variant="ghost"
            icon={<Globe size={15} />}
          >
            Browse the repos
          </NeonButton>
        </Reveal>
      </div>

      <Peek project={peek} />
    </section>
  );
}
