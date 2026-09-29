/* eslint-disable @next/next/no-img-element */
import type { Action, Block, Head, ThemedImage } from '@/types/content';
import { Zoom } from './Lightbox';
import { CastSprite } from '../cast';
import type { PageGuest } from '../types';

/** Deterministic pseudo-random numbers, so server and client print the same tear and barcode. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A ragged paper edge as a clip-path: points wander along the top of the strip. */
export function tearPath(seed: number, points = 46) {
  const r = rng(seed);
  const pts: string[] = ['0% 100%'];
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * 100;
    const y = 18 + r() * 64;
    pts.push(`${x.toFixed(2)}% ${y.toFixed(1)}%`);
  }
  pts.push('100% 100%');
  return `polygon(${pts.join(',')})`;
}

export function Tear({ seed, flip = false }: { seed: number; flip?: boolean }) {
  return (
    <div className={flip ? 'ctr-tear ctr-tear--top' : 'ctr-tear'} aria-hidden="true">
      <span className="ctr-tear__fibre" style={{ clipPath: tearPath(seed + 7) }} />
      <span className="ctr-tear__paper" style={{ clipPath: tearPath(seed) }} />
    </div>
  );
}

export function Barcode({ text, className }: { text: string; className?: string }) {
  const r = rng(hash(text));
  const bars = Array.from({ length: 38 }, () => 1 + Math.floor(r() * 3.2));
  return (
    <span className={className ? `ctr-barcode ${className}` : 'ctr-barcode'} aria-hidden="true">
      <span className="ctr-barcode__bars">
        {bars.map((w, i) => (
          <i key={i} style={{ width: `${w}px`, background: i % 2 ? 'transparent' : 'currentColor' }} />
        ))}
      </span>
      <span className="ctr-barcode__num">{String(hash(text)).padStart(10, '0').slice(0, 12)}</span>
    </span>
  );
}

export function ActionLink({ action, variant }: { action: Action; variant?: 'solid' | 'ghost' }) {
  const kind = variant ?? action.kind ?? 'solid';
  return (
    <a
      href={action.href}
      className={`ctr-btn ctr-btn--${kind}`}
      {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span>{action.label}</span>
      <span aria-hidden="true" className="ctr-btn__arrow">
        {action.external ? '↗' : '→'}
      </span>
      {action.external && <span className="ctr-sr">(opens in a new tab)</span>}
    </a>
  );
}

/** Kicker, bleeding headline and standfirst: the way every feature in the issue opens. */
export function Headline({ head, page, tone = 'ink' }: { head: Head; page: number; tone?: 'ink' | 'red' }) {
  return (
    <header className="ctr-hed">
      <span className="ctr-hed__ghost" aria-hidden="true">
        {head.index}
      </span>
      <p className="ctr-hed__kicker">
        <span className="ctr-hed__idx">{head.index}</span>
        <span>{head.label}</span>
        <span className="ctr-hed__pg">p.{page}</span>
      </p>
      <h2 className={`ctr-hed__title ctr-hed__title--${tone}`}>
        {head.title}
        {head.accentWord && (
          <>
            {' '}
            <span className="ctr-hed__accent">{head.accentWord}</span>
          </>
        )}
      </h2>
      {head.lede && <p className="ctr-hed__lede">{head.lede}</p>}
    </header>
  );
}

/** A printed photograph: plate border, optional tape, caption set like a credit line. */
export function Plate({
  items,
  index,
  tall,
  tape,
  className,
  caption,
}: {
  items: ThemedImage[];
  index: number;
  tall?: boolean;
  tape?: boolean;
  className?: string;
  caption?: string | false;
}) {
  const img = items[index];
  if (!img) return null;
  const cap = caption === false ? null : caption ?? img.caption ?? img.alt;
  return (
    <figure className={`ctr-plate${tall ? ' ctr-plate--tall' : ''}${className ? ` ${className}` : ''}`}>
      {tape && <span className="ctr-tape" aria-hidden="true" />}
      <Zoom items={items} index={index} className="ctr-plate__zoom">
        <img src={img.light} alt={img.alt} loading="lazy" decoding="async" />
        {tall && (
          <span className="ctr-plate__more" aria-hidden="true">
            Full page →
          </span>
        )}
      </Zoom>
      {cap && <figcaption className="ctr-plate__cap">{cap}</figcaption>}
    </figure>
  );
}

/** Short name for a block, used on the contents page and in folios. */
export function blockLabel(b: Block): string {
  switch (b.type) {
    case 'marquee':
      return 'Ticker';
    case 'stats':
      return 'By the numbers';
    case 'outro':
      return 'Back cover';
    case 'table':
      return b.head?.label ?? 'Classification';
    default:
      return b.head.label;
  }
}

export function blockTitle(b: Block): string | null {
  if (b.type === 'marquee') return null;
  if (b.type === 'stats') return b.items.map((s) => `${s.value} ${s.label.toLowerCase()}`).slice(0, 2).join(', ');
  if (b.type === 'outro') return [b.title, b.accentWord].filter(Boolean).join(' ');
  const head = b.head;
  if (!head) return null;
  return [head.title, head.accentWord].filter(Boolean).join(' ');
}

/** How many printed pages each kind of spread takes up. */
export function pagesFor(b: Block) {
  switch (b.type) {
    case 'marquee':
      return 0;
    case 'stats':
      return 1;
    case 'steps':
      return Math.max(4, b.items.length);
    case 'tabs':
      return 4;
    case 'gallery':
      return 3;
    default:
      return 2;
  }
}

/**
 * The guide as a magazine cut-out: a white sticker outline and a paper shadow. `flip` mirrors the
 * pose so the character faces the copy it stands beside.
 */
export function Star({
  src,
  guest,
  flip,
  size = 'md',
  className,
}: {
  src?: string;
  guest?: PageGuest;
  flip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  if (!src) return null;
  return (
    <span className={`ctr-star ctr-star--${size}${className ? ` ${className}` : ''}`}>
      <CastSprite src={src} guest={guest} className={flip ? 'ctr-star__img is-flip' : 'ctr-star__img'} />
    </span>
  );
}

/** Content with a cut-out standing beside it in its own column, so the sprite never covers copy. */
export function CastRow({
  src,
  guest,
  side = 'right',
  flip,
  size,
  className,
  children,
}: {
  src?: string;
  guest?: PageGuest;
  side?: 'left' | 'right';
  flip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}) {
  if (!src) return <>{children}</>;
  return (
    <div className={`ctr-castrow ctr-castrow--${side}${className ? ` ${className}` : ''}`}>
      <div className="ctr-castrow__main">{children}</div>
      <Star src={src} guest={guest} flip={flip} size={size} />
    </div>
  );
}
