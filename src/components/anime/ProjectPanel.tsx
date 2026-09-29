/* eslint-disable @next/next/no-img-element -- thumbnails and guest art may be bucket URLs of unknown size */
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { ProjectRow } from '@/types/content';
import { cn, getAssetPath } from '@/lib/utils';

import type { Guest } from '@/types/anime';
export type { Guest };

type Variant = {
  accent: string;
  surface: string;
  dark?: boolean;
  shape: string;
  radius?: string;
  pattern: string;
  stamp: string;
  side: 'left' | 'right';
  tilt: number;
};

const CUT = 24;

/**
 * Eight panel treatments, one per position, so neighbouring projects never share a frame:
 * each differs in cut corner or rounding, surface colour, screen pattern, stamp shape and
 * which side the guest character stands on.
 */
const VARIANTS: Variant[] = [
  { accent: 'var(--ak-sakura)', surface: '#fff', shape: `polygon(0 0,100% 0,100% calc(100% - ${CUT}px),calc(100% - ${CUT}px) 100%,0 100%)`, pattern: 'ak-halftone-pink', stamp: 'rounded-full', side: 'right', tilt: 0 },
  { accent: 'var(--ak-sky)', surface: 'var(--ak-sky-soft)', shape: 'none', radius: '28px', pattern: 'ak-grid-paper', stamp: 'rounded-md rotate-45 [&>*]:-rotate-45', side: 'left', tilt: 0.4 },
  { accent: 'var(--ak-sun)', surface: '#fff8dc', shape: `polygon(${CUT}px 0,100% 0,100% 100%,0 100%,0 ${CUT}px)`, pattern: 'ak-stripes', stamp: 'rounded-xl', side: 'right', tilt: -0.4 },
  { accent: 'var(--ak-mint)', surface: '#e2f9f0', shape: `polygon(0 0,calc(100% - ${CUT}px) 0,100% ${CUT}px,100% 100%,0 100%)`, pattern: 'ak-halftone', stamp: 'ak-burst', side: 'left', tilt: 0 },
  { accent: 'var(--ak-lilac)', surface: '#f0eaff', shape: 'polygon(0 14px,100% 0,100% calc(100% - 14px),0 100%)', pattern: 'ak-waves', stamp: 'rounded-full', side: 'right', tilt: 0.5 },
  { accent: 'var(--ak-sakura)', surface: 'var(--ak-ink)', dark: true, shape: 'none', radius: '10px', pattern: 'ak-stars', stamp: 'rounded-md', side: 'left', tilt: -0.3 },
  { accent: 'var(--ak-sky)', surface: 'var(--ak-sakura-soft)', shape: `polygon(${CUT}px 0,100% 0,100% calc(100% - ${CUT}px),calc(100% - ${CUT}px) 100%,0 100%,0 ${CUT}px)`, pattern: 'ak-checker', stamp: 'rounded-md rotate-45 [&>*]:-rotate-45', side: 'right', tilt: 0 },
  { accent: 'var(--ak-mint)', surface: '#fff', shape: 'none', radius: '999px 999px 22px 22px / 48px 48px 22px 22px', pattern: 'ak-rays', stamp: 'ak-burst', side: 'left', tilt: 0.3 },
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
    <div className="h-full" style={{ transform: v.tilt ? `rotate(${v.tilt}deg)` : undefined }}>
    <Link
      href={`/projects/${p.slug}`}
      className={cn('ak-panel ak-lift group flex h-full flex-col', v.dark && 'text-white')}
      style={{ clipPath: v.shape, borderRadius: v.radius, background: v.surface }}
    >
      <div className={cn('ak-panel-img', big ? 'aspect-[16/9]' : 'aspect-[16/10]')} style={{ borderRadius: v.radius ? `${v.radius} ${v.radius} 0 0` : undefined }}>
        {p.thumbnail ? (
          <img src={getAssetPath(p.thumbnail)} alt={p.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="ak-halftone absolute inset-0" />
        )}
        <div className={cn('absolute inset-x-0 bottom-0 h-1/2 opacity-80', v.pattern)} style={{ maskImage: 'linear-gradient(transparent, #000)', WebkitMaskImage: 'linear-gradient(transparent, #000)' }} />
        <div className="ak-speedlines opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {guest?.image && (
          <div className={cn('absolute bottom-0 z-10 h-[88%]', v.side === 'right' ? 'right-2' : 'left-2')}>
            <img
              src={guest.image}
              alt={`${guest.name} from ${guest.series}`}
              loading="lazy"
              className={cn(
                'h-full w-auto max-w-none object-contain object-bottom drop-shadow-[3px_4px_0_rgba(28,22,51,0.45)] transition-transform duration-500 group-hover:-translate-y-1.5',
                v.side === 'left' && '-scale-x-100'
              )}
            />
            <span
              className={cn(
                'ak-bubble ak-bubble-none absolute top-1 w-40 px-3 py-2 text-[0.7rem] font-bold leading-snug text-[color:var(--ak-ink)] opacity-0 transition-all duration-300 group-hover:opacity-100 md:w-48',
                v.side === 'right' ? 'right-full mr-1 translate-x-2 group-hover:translate-x-0' : 'left-full ml-1 -translate-x-2 group-hover:translate-x-0'
              )}
            >
              {guest.line}
            </span>
          </div>
        )}

        <span
          className={cn(
            'ak-display absolute top-3 z-20 flex h-14 w-14 flex-col items-center justify-center border-[3px] border-[color:var(--ak-ink)] text-white shadow-[3px_3px_0_var(--ak-ink)]',
            v.side === 'right' ? 'left-3' : 'right-3',
            v.stamp
          )}
          style={{ background: v.accent }}
        >
          <span className="flex flex-col items-center">
            <span className="text-[0.55rem] leading-none">No.</span>
            <span className="text-xl leading-none">{String(index + 1).padStart(2, '0')}</span>
          </span>
        </span>
        {p.featured && (
          <span className={cn('ak-tag absolute bottom-3 z-20 rotate-3 bg-[color:var(--ak-sun)] text-[color:var(--ak-ink)] shadow-[2px_2px_0_var(--ak-ink)]', v.side === 'right' ? 'left-3' : 'right-3')}>
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
        {guest && (
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
              className={cn(
                'rounded-md border-2 px-2 py-0.5 text-[0.7rem] font-bold',
                v.dark ? 'border-white/60 bg-white/10' : 'border-[color:var(--ak-ink)] bg-[color:var(--ak-paper)]'
              )}
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
    </div>
  );
}
