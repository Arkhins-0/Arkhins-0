/* eslint-disable @next/next/no-img-element -- images come from the admin (bucket URLs of unknown size) */
import { FaGithub, FaInstagram, FaLinkedin, FaTelegram } from 'react-icons/fa6';
import { FaDiscord } from 'react-icons/fa';
import { SiGoogle } from 'react-icons/si';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Pop } from './Pop';

export const SOCIAL_ICON: Record<string, React.ReactNode> = {
  github: <FaGithub />,
  linkedin: <FaLinkedin />,
  instagram: <FaInstagram />,
  google: <SiGoogle />,
  discord: <FaDiscord />,
  telegram: <FaTelegram />,
};

export const socialIcon = (id: string) => SOCIAL_ICON[id] ?? <Globe size={16} />;

export type EpisodeCopy = { episode: string; kana: string; title: string; lede?: string };

/** Section opener styled as an episode title card: "EP.02 | 作品", a big outlined title and a lede. */
export function EpisodeHead({
  copy,
  align = 'left',
  className,
}: {
  copy: EpisodeCopy;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <Pop className={cn(align === 'center' && 'text-center', className)}>
      <div className={cn('flex items-center gap-3', align === 'center' && 'justify-center')}>
        <span className="ak-episode">
          <span>{copy.episode}</span>
          <span lang="ja">{copy.kana}</span>
        </span>
      </div>
      <h2 className="ak-display ak-outline-text mt-5 text-[clamp(2.1rem,6.4vw,4.4rem)] leading-[1.02]">
        {copy.title}
      </h2>
      {copy.lede && (
        <p
          className={cn(
            'mt-5 max-w-2xl text-base font-medium leading-relaxed text-[color:var(--ak-ink-2)] md:text-lg',
            align === 'center' && 'mx-auto'
          )}
        >
          {copy.lede}
        </p>
      )}
    </Pop>
  );
}

/** A scrolling ribbon of phrases, doubled so the loop is seamless. */
export function Ribbon({
  items,
  className,
  tilt = -2,
  duration = 40,
}: {
  items: string[];
  className?: string;
  tilt?: number;
  duration?: number;
}) {
  const run = [...items, ...items];
  return (
    <div className={cn('ak-ribbon relative z-10', className)} style={{ transform: `rotate(${tilt}deg)` }} aria-hidden="true">
      <div className="ak-ribbon-track py-3" style={{ '--dur': `${duration}s` } as React.CSSProperties}>
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center">
            {run.map((t, i) => (
              <span key={`${half}-${i}`} className="ak-display flex items-center gap-6 whitespace-nowrap px-6 text-lg md:text-xl">
                {t}
                <span className="text-[color:var(--ak-sakura)]">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Falling sakura petals. Positions are derived from the index so server and client agree. */
export function Sakura({ count = 16, className }: { count?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {Array.from({ length: count }, (_, i) => {
        const r = (n: number) => ((i * 9301 + n * 49297) % 233280) / 233280;
        return (
          <span
            key={i}
            className="ak-petal"
            style={
              {
                left: `${r(1) * 100}%`,
                '--s': `${10 + r(2) * 12}px`,
                '--fall': `${11 + r(3) * 12}s`,
                '--sway': `${2.5 + r(4) * 3}s`,
                '--delay': `${-r(5) * 20}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

/** A transparent character PNG standing on a coloured disc, with a soft float. */
export function Character({
  src,
  alt,
  className,
  imgClassName,
  disc = 'var(--ak-sun)',
  float = true,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  disc?: string | null;
  float?: boolean;
}) {
  if (!src) return null;
  return (
    <div className={cn('relative', className)}>
      {disc && (
        <span
          aria-hidden="true"
          className="ak-halo absolute left-1/2 top-[18%] aspect-square w-[82%] -translate-x-1/2"
          style={{ background: disc }}
        >
          <span className="ak-halftone absolute inset-0 rounded-full opacity-60" />
        </span>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn('relative z-10 mx-auto h-auto w-full object-contain drop-shadow-[6px_8px_0_rgba(28,22,51,0.18)]', float && 'ak-float', imgClassName)}
      />
    </div>
  );
}
