'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Award, ExternalLink, ShieldCheck } from 'lucide-react';
import portfolioData from '@/data/portfolio.json';
import content from '@/data/content.json';
import { cn, fill } from '@/lib/utils';
import { Panel, Reveal, SectionHead, Stack, stackChild } from '@/components/fx';

const COPY = content.proof;

const CERTS = portfolioData.certifications.filter(
  (c) => !c.id.includes('placeholder')
);

const CATEGORIES = [
  COPY.allFilter,
  ...Array.from(new Set(CERTS.map((c) => c.category))),
];

/** Stub: boarding-pass certificate card with counterfoil and hover foil sheen. */
function Stub({ cert }: { cert: (typeof CERTS)[number] }) {
  const year = cert.date.split(' ').pop();
  const verified = Boolean(cert.credentialUrl);

  const body = (
    <div className="group/stub relative grid h-full grid-cols-[3.25rem_1fr] overflow-hidden">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 -translate-x-full opacity-0 transition-all duration-[900ms] ease-swift group-hover/stub:translate-x-full group-hover/stub:opacity-100"
        style={{
          background:
            'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.16) 45%, rgb(var(--accent-rgb) / 0.24) 52%, rgba(255,255,255,0.12) 60%, transparent 72%)',
        }}
      />

      <div className="relative flex flex-col items-center justify-between border-r border-dashed border-white/18 bg-white/[0.03] py-4">
        <span className="hazard h-8 w-4 opacity-60" />
        <span
          className="hud whitespace-nowrap text-ink-faint"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          {verified ? COPY.verifiedLabel : COPY.unverifiedLabel} · {year}
        </span>
        <ShieldCheck
          size={14}
          className={verified ? 'text-accent' : 'text-ink-faint'}
        />
      </div>

      <div className="relative flex flex-col gap-2 p-5">
        <div className="flex items-start gap-3">
          {cert.badge ? (
            <span className="relative h-10 w-10 shrink-0 overflow-hidden">
              <Image
                src={cert.badge}
                alt=""
                fill
                sizes="40px"
                className="object-contain"
              />
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="notch-br grid h-10 w-10 shrink-0 place-items-center border border-accent/30 bg-accent/8 text-accent"
              style={{ ['--notch' as string]: '8px' }}
            >
              <Award size={17} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base font-bold leading-tight">
              {cert.name}
            </h3>
            <p className="hud mt-1 text-accent">{cert.issuer}</p>
          </div>
        </div>

        <p className="text-[0.83rem] leading-relaxed text-ink-dim">
          {cert.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/8 pt-3">
          <span className="hud text-ink-faint">{cert.date}</span>
          {verified ? (
            <span className="hud inline-flex items-center gap-1.5 text-accent transition-transform duration-300 group-hover/stub:translate-x-0.5">
              {COPY.verifyAction}
              <ExternalLink size={11} />
            </span>
          ) : (
            <span className="hud text-ink-faint">
              {cert.credentialId ?? COPY.emptyCredential}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <motion.li variants={stackChild} className="h-full">
      <Panel cut={16} spotlight className="h-full">
        {verified ? (
          <a
            href={cert.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full"
            aria-label={fill(COPY.verifyAria, { name: cert.name })}
          >
            {body}
          </a>
        ) : (
          body
        )}
      </Panel>
    </motion.li>
  );
}

/** Certifications: filterable grid of boarding-pass certificate stubs. */
export function Certifications() {
  const [filter, setFilter] = useState(COPY.allFilter);

  const shown = useMemo(
    () =>
      filter === COPY.allFilter
        ? CERTS
        : CERTS.filter((c) => c.category === filter),
    [filter]
  );

  return (
    <section id="proof" className="band">
      <div className="shell">
        <SectionHead {...COPY.head} />

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
              <span className="ml-2 text-[0.6rem] opacity-50">
                {String(
                  c === COPY.allFilter
                    ? CERTS.length
                    : CERTS.filter((x) => x.category === c).length
                ).padStart(2, '0')}
              </span>
            </button>
          ))}
        </Reveal>

        <Stack key={filter} className="mt-6" amount={0.05}>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((c) => (
              <Stub key={c.id} cert={c} />
            ))}
          </ul>
        </Stack>

        {shown.length === 0 && (
          <p className="py-14 text-center font-mono text-sm text-ink-faint">
            {fill(COPY.emptyState, { filter })}
          </p>
        )}
      </div>
    </section>
  );
}
