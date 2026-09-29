/* eslint-disable @next/next/no-img-element -- the character art is swapped from the admin */
import Link from 'next/link';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { getSite } from '@/lib/site';
import { fill } from '@/lib/utils';
import { socialIcon } from './primitives';

/** Ending card: "to be continued", a bowing character, link columns, the wordmark and art credits. */
export async function AnimeFooter() {
  const { portfolio, anime, copy } = await getSite();
  const { profile, socialLinks } = portfolio;
  const f = anime.footer;
  const year = new Date().getFullYear();

  return (
    <footer className="ak relative !min-h-0 overflow-hidden border-t-[3px] border-[color:var(--ak-ink)]">
      <div className="ak-shell flex justify-end py-8">
        <Link
          href="/#contact"
          className="ak-display group relative inline-flex items-center bg-[color:var(--ak-ink)] py-3 pl-6 pr-14 text-lg text-white md:text-2xl"
          style={{ clipPath: 'polygon(0 0, calc(100% - 36px) 0, 100% 50%, calc(100% - 36px) 100%, 0 100%)' }}
        >
          {f.toBeContinued}
          <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <div className="bg-[color:var(--ak-ink)] text-white">
        <div className="ak-shell grid gap-10 py-14 md:grid-cols-[auto_1fr_1fr_1fr]">
          <div className="flex items-start gap-4 md:flex-col">
            {f.image && <img src={f.image} alt={f.imageAlt} loading="lazy" className="h-auto w-28 shrink-0 md:w-36" />}
            <div>
              <p className="ak-display text-xl leading-tight">{f.thanks}</p>
              <p lang="ja" className="mt-1 text-xs font-bold text-[color:var(--ak-sun)]">{f.thanksKana}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[color:var(--ak-sakura)]">{copy.footer.currentlyLabel}</p>
            <p className="mt-3 max-w-xs font-bold leading-snug">{fill(copy.footer.currentlyCopy, { availability: profile.availability })}</p>
            <a href={`mailto:${profile.email}`} className="mt-3 inline-block break-all text-sm text-white/75 underline decoration-[color:var(--ak-sakura)] decoration-2 underline-offset-4 hover:text-white">
              {profile.email}
            </a>
          </div>

          <nav aria-label={copy.nav.footerNavLabel}>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[color:var(--ak-sakura)]">{copy.footer.sectionsLabel}</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              {anime.nav.items.map((it, i) => (
                <li key={it.id}>
                  <Link href={`/#${it.id}`} className="group inline-flex items-baseline gap-2 text-sm font-bold text-white/80 hover:text-white">
                    <span className="text-[0.65rem] text-[color:var(--ak-sun)]">EP.{String(i + 1).padStart(2, '0')}</span>
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[color:var(--ak-sakura)]">{copy.footer.elsewhereLabel}</p>
            <ul className="mt-3 space-y-2">
              {socialLinks.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm font-bold text-white/80 hover:text-white">
                    <span className="text-[color:var(--ak-sky-soft)]">{socialIcon(s.icon)}</span>
                    {s.name}
                    <ArrowUpRight size={12} className="opacity-60" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="ak-shell select-none overflow-hidden" aria-hidden="true">
          <p className="ak-display whitespace-nowrap text-center text-[clamp(2.6rem,13vw,11rem)] leading-[0.85] text-transparent [-webkit-text-stroke:2px_rgb(255_255_255/0.22)]">
            {anime.series.title}
          </p>
        </div>

        <div className="ak-shell flex flex-col gap-4 border-t border-white/15 py-6 text-xs font-bold text-white/60 md:flex-row md:items-start md:justify-between">
          <p>{fill(copy.footer.copyright, { year, name: profile.name, domain: copy.brand.domain })}</p>

          {f.credits.length > 0 && (
            <details className="max-w-xl md:text-right">
              <summary className="cursor-pointer list-none text-white/70 hover:text-white">{f.creditsLabel} ▾</summary>
              <ul className="mt-2 space-y-1">
                {f.credits.map((c) => (
                  <li key={c.label}>
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                      {c.label} · {c.license}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <Link
            href="/#home"
            aria-label={copy.footer.backToTop}
            className="flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-full border-2 border-white/40 hover:border-white hover:text-white md:self-auto"
          >
            <ArrowUp size={15} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
