/* eslint-disable @next/next/no-img-element -- hero art is swapped from the admin (bucket URL of unknown size) */
import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';
import type { Site } from '@/lib/site';
import { fill } from '@/lib/utils';
import { RoleCycler } from './RoleCycler';
import { Ribbon, Sakura } from './primitives';

const STICKER_STYLE = [
  'left-[2%] top-[18%] -rotate-6 bg-[color:var(--ak-sakura)] text-white',
  'right-[0%] top-[8%] rotate-6 bg-[color:var(--ak-sun)]',
  'left-[0%] bottom-[26%] rotate-3 bg-[color:var(--ak-mint)] text-white',
  'right-[4%] bottom-[16%] -rotate-3 bg-white',
];

/** Opening title card: sky, sunburst, a few petals, the name in outlined display type and the lead character. */
export function Hero({ site }: { site: Site }) {
  const { profile } = site.portfolio;
  const { hero, series } = site.anime;
  const copy = site.copy.hero;
  const [first, ...rest] = profile.name.split(' ');

  return (
    <section id="home" className="ak-sky relative overflow-hidden pt-28 md:pt-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-10%] top-[-10%] h-[120%] w-[80%]">
          <div className="ak-sunburst" />
        </div>
        <span className="ak-cloud left-[6%] top-[14%] h-10 w-40 opacity-90" />
        <span className="ak-cloud right-[8%] top-[34%] h-8 w-28 opacity-80" />
        <span className="ak-cloud left-[14%] top-[46%] h-7 w-24 opacity-60" />
      </div>
      <Sakura count={10} />

      {/* One column, top to bottom: name, then the picture, then the rest, so the art is never cropped at the side. */}
      <div className="ak-shell relative flex flex-col items-center pb-20 text-center lg:pb-24">
        <div className="relative z-10 w-full">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="ak-episode">
              <span>{hero.episode}</span>
              <span lang="ja">{series.kana}</span>
            </span>
            <span className="ak-tag">
              <span className="h-2 w-2 rounded-full bg-[color:var(--ak-mint)]" />
              {profile.availability}
            </span>
          </div>

          <h1 className="relative mt-7 inline-block">
            <span lang="ja" aria-hidden="true" className="ak-kana ak-display absolute -left-12 top-1 hidden text-2xl text-[color:var(--ak-sakura)] xl:block">
              {series.nameKana}
            </span>
            <span className="ak-display ak-outline-text block text-[clamp(3.4rem,13vw,8.5rem)] leading-[0.9]">{first}</span>
            {rest.length > 0 && (
              <span className="ak-display mt-2 block text-[clamp(1.8rem,6vw,3.6rem)] leading-none text-[color:var(--ak-sakura)] [-webkit-text-stroke:2px_var(--ak-ink)] [paint-order:stroke_fill]">
                {rest.join(' ')}
              </span>
            )}
          </h1>
        </div>

        <div className="relative mx-auto mt-10 w-full max-w-[460px] text-left">
          <div aria-hidden="true" className="ak-halo absolute left-1/2 top-[8%] aspect-square w-[88%] -translate-x-1/2 bg-white">
            <span className="ak-halftone-pink absolute inset-0 rounded-full" />
          </div>
          <img
            src={hero.image}
            alt={hero.imageAlt}
            fetchPriority="high"
            className="ak-float relative z-10 mx-auto h-auto w-full object-contain [filter:drop-shadow(8px_10px_0_rgba(28,22,51,0.2))]"
            style={{ '--dur': '8s' } as React.CSSProperties}
          />

          {hero.stickers.map((s, i) => (
            <span key={s} className={`ak-tag absolute z-20 px-4 py-1.5 text-sm shadow-[3px_3px_0_var(--ak-ink)] ${STICKER_STYLE[i % STICKER_STYLE.length]}`}>
              {s}
            </span>
          ))}

          {hero.greeting && (
            <div className="ak-bubble ak-bubble-right absolute -top-2 left-[6%] z-20 rotate-[-4deg] px-4 py-2 sm:left-[10%]">
              <p className="ak-display text-lg leading-tight">{hero.greeting}</p>
              {hero.greetingKana && <p lang="ja" className="text-xs font-bold text-[color:var(--ak-sakura)]">{hero.greetingKana}</p>}
            </div>
          )}
        </div>

        <div className="relative z-10 mt-8 w-full">
          <div className="ak-bubble ak-bubble-none mt-2 inline-block min-h-[3.6rem] min-w-[17rem] max-w-full">
            <p className="text-sm font-bold text-[color:var(--ak-ink-2)]">{profile.headline}</p>
            <p className="ak-display text-xl md:text-2xl">
              <RoleCycler roles={profile.roles} />
            </p>
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-base font-medium leading-relaxed text-[color:var(--ak-ink-2)] md:text-lg">
            {fill(copy.blurb, { tagline: profile.tagline ?? '', city: profile.city })}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href={copy.primaryHref} className="ak-btn">
              {copy.primaryAction}
              <ArrowRight size={18} />
            </Link>
            {profile.resumeUrl && (
              <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="ak-btn ak-btn-ghost">
                <FileText size={18} />
                {copy.secondaryAction}
              </a>
            )}
          </div>

          {hero.stats.length > 0 && (
            <dl className="mx-auto mt-10 grid max-w-xl grid-cols-3 gap-3">
              {hero.stats.map((s) => (
                <div key={s.label} className="ak-cel-sm flex flex-col px-3 py-3 text-center">
                  <dt className="order-2 mt-1 text-[0.7rem] font-bold leading-tight text-[color:var(--ak-ink-2)]">{s.label}</dt>
                  <dd className="ak-display order-1 text-2xl md:text-3xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      <Ribbon items={hero.ribbon} className="-ml-[5%] w-[110%]" />
    </section>
  );
}
