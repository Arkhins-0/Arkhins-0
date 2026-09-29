/* eslint-disable @next/next/no-img-element -- thumbnails and guest art may be bucket URLs of unknown size */
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { ProjectRow } from '@/types/content';
import { cn, getAssetPath } from '@/lib/utils';

import type { Guest } from '@/types/guest';
export type { Guest };

type Variant = {
  accent: string;
  surface: string;
  dark?: boolean;
  pattern: string;
  side: 'left' | 'right';
};

/**
 * Six panel treatments cycled by position: the same cut-corner frame every time, with the
 * surface colour, the screen pattern and the side the guest stands on changing between neighbours.
 */
const VARIANTS: Variant[] = [
  { accent: 'var(--ak-sakura)', surface: '#fff', pattern: 'ak-halftone-pink', side: 'right' },
  { accent: 'var(--ak-sky)', surface: 'var(--ak-sky-soft)', pattern: 'ak-grid-paper', side: 'left' },
  { accent: 'var(--ak-sun)', surface: '#fff8dc', pattern: 'ak-stripes', side: 'right' },
  { accent: 'var(--ak-mint)', surface: '#e2f9f0', pattern: 'ak-halftone', side: 'left' },
  { accent: 'var(--ak-lilac)', surface: '#f0eaff', pattern: 'ak-waves', side: 'right' },
  { accent: 'var(--ak-sakura)', surface: 'var(--ak-ink)', dark: true, pattern: 'ak-stars', side: 'left' },
];

/** One project as a manga panel: screenshot with its guest star in front, a numbered stamp, title and tags. */
export function ProjectPanel({
  project: p,
  index,
  big = false,
  openLabel,
  featuredLabel,
  guest,
  guestLabel,
}: {
  project: ProjectRow;
  index: number;
  big?: boolean;
  openLabel: string;
  featuredLabel: string;
  guest?: Guest;
  guestLabel?: string;
}) {
  const v = VARIANTS[index % VARIANTS.length];
  const title = p.title.split(':')[0].trim();
  const subtitle = p.tagline ?? p.title.split(':')[1]?.trim();
  const muted = v.dark ? 'text-white/70' : 'text-[color:var(--ak-ink-2)]';

  return (
    <Link
      href={`/projects/${p.slug}`}
      className={cn('ak-panel ak-lift group flex h-full flex-col', v.dark && 'text-white')}
      style={{ background: v.surface }}
    >
      <div className={cn('ak-panel-img', big ? 'aspect-[16/9]' : 'aspect-[16/10]')}>
        {p.thumbnail ? (
          <img src={getAssetPath(p.thumbnail)} alt={p.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="ak-halftone absolute inset-0" />
        )}
        <div
          className={cn('absolute inset-x-0 bottom-0 h-1/2 opacity-60', v.pattern)}
          style={{ maskImage: 'linear-gradient(transparent, #000)', WebkitMaskImage: 'linear-gradient(transparent, #000)' }}
        />

        {guest?.image && (
          <div className={cn('absolute bottom-0 z-10 h-[78%]', v.side === 'right' ? 'right-2' : 'left-2')}>
            <img
              src={guest.image}
              alt={`${guest.name} from ${guest.series}`}
              loading="lazy"
              className={cn(
                'h-full w-auto max-w-none object-contain object-bottom drop-shadow-[3px_4px_0_rgba(28,22,51,0.45)] transition-transform duration-500 group-hover:-translate-y-1',
                v.side === 'left' && '-scale-x-100'
              )}
            />
            <span
              className={cn(
                'ak-bubble ak-bubble-none absolute top-1 hidden w-40 px-3 py-2 text-[0.7rem] font-bold leading-snug text-[color:var(--ak-ink)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block md:w-48',
                v.side === 'right' ? 'right-full mr-1' : 'left-full ml-1'
              )}
            >
              {guest.line}
            </span>
          </div>
        )}

        <span
          className={cn(
            'ak-display absolute top-3 z-20 flex h-14 w-14 flex-col items-center justify-center rounded-full border-[3px] border-[color:var(--ak-ink)] text-white shadow-[3px_3px_0_var(--ak-ink)]',
            v.side === 'right' ? 'left-3' : 'right-3'
          )}
          style={{ background: v.accent }}
        >
          <span className="text-[0.55rem] leading-none">No.</span>
          <span className="text-xl leading-none">{String(index + 1).padStart(2, '0')}</span>
        </span>
        {p.featured && (
          <span className={cn('ak-tag absolute bottom-3 z-20 bg-[color:var(--ak-sun)] text-[color:var(--ak-ink)] shadow-[2px_2px_0_var(--ak-ink)]', v.side === 'right' ? 'left-3' : 'right-3')}>
            ★ {featuredLabel}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest">
          <span style={{ color: v.accent }} className={v.dark ? '' : '[filter:brightness(0.8)]'}>{p.category}</span>
          {p.year && <span className={muted}>· {p.year}</span>}
          <span className={cn('ml-auto', muted)}>{p.status}</span>
        </div>
        <h3 className={cn('ak-display mt-2 leading-tight', big ? 'text-3xl md:text-4xl' : 'text-2xl')}>{title}</h3>
        {subtitle && <p className={cn('mt-1 text-sm font-bold', muted)}>{subtitle}</p>}
        <p className={cn('mt-3 text-[0.92rem] leading-relaxed', muted)}>{p.summary}</p>
        {guest && guestLabel && (
          <p className="mt-3 text-xs font-bold">
            <span className="rounded-full border-2 px-2 py-0.5" style={{ borderColor: v.accent, color: v.dark ? '#fff' : undefined }}>
              {guestLabel}: {guest.name} · <span className={muted}>{guest.series}</span>
            </span>
          </p>
        )}
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
          {p.tags.slice(0, big ? 8 : 5).map((t) => (
            <li
              key={t}
              className={cn('rounded-md border-2 px-2 py-0.5 text-[0.7rem] font-bold', v.dark ? 'border-white/60 bg-white/10' : 'border-[color:var(--ak-ink)] bg-[color:var(--ak-paper)]')}
            >
              {t}
            </li>
          ))}
        </ul>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-extrabold">
          <span className={v.dark ? 'underline decoration-[color:var(--ak-sun)] decoration-4 underline-offset-4' : 'ak-marker'}>{openLabel}</span>
          <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
