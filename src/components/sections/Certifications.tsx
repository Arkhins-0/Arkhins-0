'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import portfolioData from '@/data/portfolio.json';
import { Panel, SectionHead, Stack, stackChild } from '@/components/fx';

const CERTS = portfolioData.certifications.filter(
  (c) => !c.id.includes('placeholder')
);

/** Boarding-pass stub: hazard-taped counterfoil on the left, detail on the
 *  right, foil sheen sliding across the whole thing on hover. */
function Stub({ cert }: { cert: (typeof CERTS)[number] }) {
  const year = cert.date.split(' ').pop();
  const verified = Boolean(cert.credentialUrl);

  const body = (
    <div className="group/stub relative grid h-full grid-cols-[3.25rem_1fr] overflow-hidden">
      {/* foil sheen */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 -translate-x-full opacity-0 transition-all duration-[900ms] ease-swift group-hover/stub:translate-x-full group-hover/stub:opacity-100"
        style={{
          background:
            'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.16) 45%, rgb(var(--accent-rgb) / 0.24) 52%, rgba(255,255,255,0.12) 60%, transparent 72%)',
        }}
      />

      {/* counterfoil */}
      <div className="relative flex flex-col items-center justify-between border-r border-dashed border-white/18 bg-white/[0.03] py-4">
        <span className="hazard h-8 w-4 opacity-60" />
        <span
          className="hud whitespace-nowrap text-ink-faint"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          {verified ? 'Verified' : 'On file'} · {year}
        </span>
        <ShieldCheck
          size={14}
          className={verified ? 'text-accent' : 'text-ink-faint'}
        />
      </div>

      {/* detail */}
      <div className="relative flex flex-col gap-2 p-5">
        <div className="flex items-start gap-3">
          <span className="relative h-10 w-10 shrink-0 overflow-hidden">
            <Image
              src={cert.badge}
              alt=""
              fill
              sizes="40px"
              className="object-contain"
            />
          </span>
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
              Verify
              <ExternalLink size={11} />
            </span>
          ) : (
            <span className="hud text-ink-faint">
              {cert.credentialId ?? '—'}
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
            aria-label={`Verify ${cert.name}`}
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

export function Certifications() {
  return (
    <section id="proof" className="band">
      <div className="shell">
        <SectionHead
          index="06"
          label="Receipts"
          title="Certified,"
          accentWord="not claimed"
          lede="Every badge below links out to its issuer where a public verification page exists."
        />

        <Stack className="mt-14">
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {CERTS.map((c) => (
              <Stub key={c.id} cert={c} />
            ))}
          </ul>
        </Stack>
      </div>
    </section>
  );
}
