'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import portfolioData from '@/data/portfolio.json';
import content from '@/data/content.json';
import { Panel, Reveal, SectionHead, Stack, stackChild } from '@/components/fx';
import { cn, fill } from '@/lib/utils';

const { basics, education, languages, interests } = portfolioData;
const COPY = content.about;

/* Phrases the content file marks for emphasis, so the bio reads as edited copy
   rather than a dumped data string. */
const HIGHLIGHTS = COPY.highlights;

function markUp(text: string) {
  const pattern = new RegExp(`(${HIGHLIGHTS.join('|')})`, 'gi');
  return text.split(pattern).map((chunk, i) =>
    HIGHLIGHTS.some((h) => h.toLowerCase() === chunk.toLowerCase()) ? (
      <em key={i} className="not-italic text-ink">
        <span className="neon-text">{chunk}</span>
      </em>
    ) : (
      <span key={i}>{chunk}</span>
    )
  );
}

/** Datasheet row: mono key on the left, content on the right, lights on hover. */
function SpecRow({
  k,
  children,
  index,
}: {
  k: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      variants={stackChild}
      className="group relative grid grid-cols-[auto_1fr] gap-4 border-b border-white/8 py-5 transition-colors sm:grid-cols-[9rem_1fr] sm:gap-8"
    >
      <span
        aria-hidden="true"
        className="absolute -left-4 top-0 h-full w-px origin-top scale-y-0 bg-accent transition-transform duration-500 ease-swift group-hover:scale-y-100 sm:-left-6"
      />
      <div className="flex items-baseline gap-2">
        <span className="hud text-accent/60">
          {String(index).padStart(2, '0')}
        </span>
        <span className="hud text-ink-faint transition-colors group-hover:text-ink">
          {k}
        </span>
      </div>
      <div className="min-w-0">{children}</div>
    </motion.div>
  );
}

function IstClock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat('en-GB', {
        timeZone: COPY.idCard.timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(new Date());
    setTime(fmt());
    const t = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="tabular-nums text-ink">
      {time ?? COPY.idCard.timePlaceholder}
    </span>
  );
}

/** Five chamfered ticks; filled ones show proficiency. */
function LevelBar({ level }: { level: number }) {
  return (
    <span className="inline-flex gap-1" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-3 w-1.5 -skew-x-12',
            i < level ? 'bg-accent' : 'bg-white/12'
          )}
          style={
            i < level
              ? { boxShadow: '0 0 8px rgb(var(--accent-rgb) / 0.7)' }
              : undefined
          }
        />
      ))}
    </span>
  );
}

export function About() {
  return (
    <section id="about" className="band">
      <div className="shell">
        <SectionHead {...COPY.head} />

        <div className="mt-14 grid gap-10 lg:grid-cols-[20rem_1fr] lg:gap-16">
          {/* ------------------------------------------------ ID card */}
          <Reveal dir="right" className="lg:sticky lg:top-28 lg:self-start">
            <Panel hot cut={22} spotlight className="w-full">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="hud text-accent">
                    {fill(COPY.idCard.badge, {
                      year: new Date().getFullYear(),
                    })}
                  </span>
                  <span className="hazard h-3 w-12 opacity-70" />
                </div>

                <div className="relative mt-4 aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={basics.profilePicture}
                    alt={basics.name}
                    fill
                    sizes="320px"
                    className="object-cover grayscale transition-all duration-700 hover:grayscale-0"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 mix-blend-color opacity-[calc(0.55*var(--fx))]"
                    style={{
                      background:
                        'linear-gradient(160deg, rgb(var(--accent-rgb) / 0.9), rgb(var(--accent-2-rgb) / 0.6))',
                    }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[calc(0.35*var(--fx))] mix-blend-overlay"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(to bottom, rgba(255,255,255,0.5) 0 1px, transparent 1px 4px)',
                    }}
                  />
                </div>

                <h3 className="mt-4 font-display text-xl font-bold leading-tight">
                  {basics.name}
                </h3>
                <p className="hud mt-1 text-ink-faint">{basics.headline}</p>

                <dl className="mt-5 space-y-2 border-t border-white/8 pt-4 font-mono text-[0.7rem]">
                  <div className="flex justify-between">
                    <dt className="text-ink-faint">{COPY.idCard.localTime}</dt>
                    <dd>
                      <IstClock />
                      <span className="ml-1 text-ink-faint">
                        {COPY.idCard.timezoneLabel}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-faint">{COPY.idCard.base}</dt>
                    <dd className="text-ink">{basics.location.city}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-faint">{COPY.idCard.status}</dt>
                    <dd className="text-accent">{COPY.idCard.statusValue}</dd>
                  </div>
                </dl>

                {/* pseudo-barcode */}
                <div
                  className="mt-5 h-8 w-full opacity-70"
                  aria-hidden="true"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, rgba(233,237,251,0.85) 0 1px, transparent 1px 3px, rgba(233,237,251,0.85) 3px 5px, transparent 5px 9px)',
                    maskImage:
                      'linear-gradient(90deg, #000, #000 88%, transparent)',
                    WebkitMaskImage:
                      'linear-gradient(90deg, #000, #000 88%, transparent)',
                  }}
                />
              </div>
            </Panel>
          </Reveal>

          {/* ------------------------------------------------ datasheet */}
          <div>
            <Reveal>
              <p className="max-w-3xl font-display text-[clamp(1.15rem,2.3vw,1.65rem)] font-semibold leading-[1.5] tracking-tight text-ink-dim">
                {markUp(basics.bio)}
              </p>
            </Reveal>

            <Stack className="mt-12">
              <SpecRow k={COPY.specRows.education} index={1}>
                <ul className="space-y-4">
                  {education.map((e) => (
                    <li key={e.id} className="flex items-start gap-3">
                      <span className="relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden border border-white/12 bg-white/5">
                        <Image
                          src={e.logo}
                          alt=""
                          fill
                          sizes="36px"
                          className="object-contain p-1"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-snug">
                          {e.degree}
                          <span className="text-ink-faint"> · </span>
                          <span className="text-ink-dim">{e.field}</span>
                        </p>
                        <p className="mt-0.5 font-mono text-[0.68rem] text-ink-faint">
                          {e.institution} — {e.startDate}–{e.endDate}
                          <span className="text-accent"> · {e.score}</span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </SpecRow>

              <SpecRow k={COPY.specRows.languages} index={2}>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {languages.map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-3">
                      <span className="text-sm">
                        {l.name}
                        <span className="ml-2 font-mono text-[0.65rem] text-ink-faint">
                          {l.proficiency}
                        </span>
                      </span>
                      <LevelBar level={l.level} />
                    </li>
                  ))}
                </ul>
              </SpecRow>

              <SpecRow k={COPY.specRows.contact} index={3}>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <a
                    href={`mailto:${basics.email}`}
                    className="underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent"
                  >
                    {basics.email}
                  </a>
                  <span className="font-mono text-[0.68rem] text-ink-faint">
                    {basics.location.city}, {basics.location.state},{' '}
                    {basics.location.country}
                  </span>
                </div>
              </SpecRow>
            </Stack>

            {/* ------------------------------------------ interest field */}
            <Reveal delay={0.1} className="mt-12">
              <p className="eyebrow mb-5">{COPY.interestsLabel}</p>
              <ul className="flex flex-wrap gap-2">
                {interests.map((it, i) => (
                  <li key={it.id}>
                    <span
                      title={it.description}
                      className={cn(
                        'inline-block cursor-default border px-3 py-1.5 font-mono text-[0.72rem] transition-all duration-300',
                        i % 5 === 0
                          ? 'border-accent/45 text-accent hover:bg-accent/10'
                          : 'border-white/10 text-ink-dim hover:border-white/30 hover:text-ink'
                      )}
                      style={{
                        transform: `rotate(${((i * 37) % 5) - 2}deg)`,
                      }}
                    >
                      {it.name}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
