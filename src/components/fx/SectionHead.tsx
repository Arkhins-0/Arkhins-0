'use client';

import { Reveal } from './Reveal';
import { Scramble } from './Scramble';
import { cn } from '@/lib/utils';

/** Schematic section header: index chip, hazard tape, mono label, edge rule, then title and lede. */
export function SectionHead({
  index,
  label,
  title,
  accentWord,
  lede,
  align = 'left',
  className,
}: {
  index: string;
  label: string;
  title: string;
  accentWord?: string;
  lede?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  const centered = align === 'center';

  return (
    <div className={cn('relative', className)}>
      <Reveal dir="none">
        <div
          className={cn(
            'flex items-center gap-3',
            centered && 'justify-center'
          )}
        >
          <span className="hud border border-accent/40 px-2 py-1 text-accent">
            {index}
          </span>
          <span className="hazard h-3 w-10 opacity-70" />
          <span className="eyebrow">{label}</span>
          <span className="neon-line h-px flex-1 opacity-60" />
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <h2
          className={cn(
            'mt-5 font-display text-[clamp(2.1rem,6.4vw,4.6rem)] font-extrabold leading-[0.94] tracking-tightest',
            centered && 'text-center'
          )}
        >
          <Scramble text={title} speed={1} />
          {accentWord && (
            <>
              {' '}
              <span className="neon-text italic">{accentWord}</span>
            </>
          )}
        </h2>
      </Reveal>

      {lede && (
        <Reveal delay={0.16}>
          <p
            className={cn(
              'mt-5 max-w-2xl text-[0.98rem] leading-relaxed text-ink-dim',
              centered && 'mx-auto text-center'
            )}
          >
            {lede}
          </p>
        </Reveal>
      )}
    </div>
  );
}
