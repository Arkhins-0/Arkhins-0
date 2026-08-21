'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import portfolioData from '@/data/portfolio.json';
import { Panel, Reveal, SectionHead } from '@/components/fx';
import { cn } from '@/lib/utils';

const ROLES = portfolioData.experience.filter(
  (e) => !e.id.includes('placeholder')
);

function Entry({ role, n }: { role: (typeof ROLES)[number]; n: number }) {
  return (
    <div className="group relative pl-14 md:pl-24">
      {/* node on the rail */}
      <span className="absolute left-[1.15rem] top-7 z-10 flex h-3 w-3 -translate-x-1/2 items-center justify-center md:left-[2.4rem]">
        <span
          className={cn(
            'absolute h-full w-full rotate-45 transition-all duration-500',
            role.current
              ? 'bg-accent shadow-[0_0_16px_rgb(var(--accent-rgb)/0.9)]'
              : 'bg-bg ring-1 ring-white/25 group-hover:bg-accent group-hover:ring-accent'
          )}
        />
        {role.current && (
          <span className="absolute h-full w-full rotate-45 bg-accent animate-pulse-ring" />
        )}
      </span>

      {/* branch line into the card */}
      <span
        aria-hidden="true"
        className="absolute left-[1.15rem] top-[2.15rem] h-px w-8 origin-left scale-x-0 bg-accent/60 transition-transform duration-500 ease-swift group-hover:scale-x-100 md:left-[2.4rem] md:w-12"
      />

      <Panel
        cut={18}
        spotlight
        className="transition-transform duration-500 ease-swift group-hover:translate-x-1"
      >
        <div className="relative overflow-hidden p-6 md:p-7">
          {/* oversized index watermark */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 -top-6 font-display text-[6rem] font-extrabold leading-none text-white/[0.035]"
          >
            {String(n).padStart(2, '0')}
          </span>

          <div className="relative flex flex-wrap items-start gap-4">
            <span className="relative h-11 w-11 shrink-0 overflow-hidden border border-white/12 bg-white/5">
              <Image
                src={role.logo}
                alt=""
                fill
                sizes="44px"
                className="object-contain p-1.5"
              />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="font-display text-lg font-bold leading-tight md:text-xl">
                  {role.position}
                </h3>
                {role.current && (
                  <span className="hud border border-accent/45 px-1.5 py-0.5 text-accent">
                    Now
                  </span>
                )}
              </div>

              <a
                href={role.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-ink-dim transition-colors hover:text-accent"
              >
                {role.company}
                <ArrowUpRight size={12} />
              </a>

              <p className="hud mt-2 text-ink-faint">
                {role.startDate} — {role.endDate}
                <span className="text-accent"> · </span>
                {role.type}
                <span className="text-accent"> · </span>
                {role.location}
              </p>
            </div>
          </div>

          {/* highlights read as a terminal log */}
          <ul className="relative mt-5 space-y-1.5 border-l border-white/10 pl-4">
            {role.highlights.map((h) => (
              <li
                key={h}
                className="relative text-[0.86rem] leading-relaxed text-ink-dim"
              >
                <span className="absolute -left-4 text-accent/70">▸</span>
                {h}
              </li>
            ))}
          </ul>

          <ul className="relative mt-5 flex flex-wrap gap-1.5">
            {role.technologies.map((t) => (
              <li
                key={t}
                className="border border-white/10 px-2 py-0.5 font-mono text-[0.63rem] text-ink-faint transition-colors group-hover:border-accent/25 group-hover:text-ink-dim"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </div>
  );
}

export function Experience() {
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ['start 65%', 'end 60%'],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <section id="path" className="band">
      <div className="shell">
        <SectionHead
          index="04"
          label="Trajectory"
          title="Where I've"
          accentWord="plugged in"
          lede="Internships, a student developer community, and the habit of volunteering for the job nobody has done yet."
        />

        <div ref={track} className="relative mt-14">
          {/* rail: dim base + scroll-linked neon fill */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-[1.15rem] top-0 w-px bg-white/10 md:left-[2.4rem]"
          />
          <motion.div
            aria-hidden="true"
            style={{ scaleY: fill }}
            className="absolute bottom-0 left-[1.15rem] top-0 w-px origin-top bg-accent shadow-[0_0_14px_rgb(var(--accent-rgb)/0.8)] md:left-[2.4rem]"
          />

          <ul className="space-y-8">
            {ROLES.map((role, i) => (
              <Reveal key={role.id} as="li" dir="up" delay={i * 0.05}>
                <Entry role={role} n={i + 1} />
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
