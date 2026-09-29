/* eslint-disable @next/next/no-img-element -- badges may be bucket URLs of unknown size */
import { ArrowUpRight } from 'lucide-react';
import type { Site } from '@/lib/site';
import { isReal } from '@/lib/site';
import { cn, fill, getAssetPath, getInitials } from '@/lib/utils';
import { Pop } from './Pop';
import { EpisodeHead } from './ui';

/** Credentials as gacha-style cards: verifiable ones are SSR, ones with an ID are SR, the rest R. */
export function Proof({ site }: { site: Site }) {
  const { proof, sections } = site.anime;
  const copy = site.copy.proof;
  const certs = site.portfolio.certifications.filter(isReal);
  const [ssr, sr, r] = proof.rarities;

  return (
    <section id="proof" className="ak-section bg-[color:var(--ak-paper-2)]">
      <div className="ak-shell">
        <EpisodeHead copy={sections.proof} />

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {certs.map((c, i) => {
            const cred = 'credentialId' in c ? (c.credentialId as string) : '';
            const rarity = c.credentialUrl ? ssr : cred ? sr : r;
            const top = rarity === ssr;
            return (
              <Pop as="li" key={c.id} delay={(i % 4) * 0.05}>
                <article className={cn('ak-cel ak-lift relative flex h-full flex-col overflow-hidden p-5', top && 'ak-card-ssr')}>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'ak-display rounded-md border-2 border-[color:var(--ak-ink)] px-2 text-sm',
                        top ? 'bg-[color:var(--ak-sun)]' : rarity === sr ? 'bg-[color:var(--ak-sky-soft)]' : 'bg-white'
                      )}
                    >
                      {rarity}
                    </span>
                    <span className="text-xs font-bold text-[color:var(--ak-ink-2)]">{c.category}</span>
                  </div>

                  <div className="my-5 flex justify-center">
                    <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-[3px] border-[color:var(--ak-ink)] bg-white shadow-[3px_3px_0_var(--ak-ink)]">
                      {c.badge ? (
                        <img src={getAssetPath(c.badge)} alt="" loading="lazy" className="h-14 w-14 object-contain" />
                      ) : (
                        <span className="ak-display text-xl">{getInitials(c.issuer)}</span>
                      )}
                    </span>
                  </div>

                  <h3 className="ak-display text-center text-lg leading-tight">{c.name}</h3>
                  <p className="mt-1 text-center text-xs font-bold text-[color:var(--ak-ink-2)]">
                    {c.issuer} · {c.date}
                  </p>
                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-[color:var(--ak-ink-2)]">{c.description}</p>

                  <div className="mt-auto flex items-end justify-between gap-2 pt-5">
                    {c.credentialUrl ? (
                      <a
                        href={c.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={fill(copy.verifyAria, { name: c.name })}
                        className="ak-stamp inline-flex items-center gap-1 text-[color:var(--ak-sakura)] transition-transform hover:rotate-0"
                      >
                        {proof.verified}
                        <ArrowUpRight size={12} />
                      </a>
                    ) : (
                      <span className="ak-stamp text-[color:var(--ak-ink-2)]">{proof.onFile}</span>
                    )}
                    {cred && <span className="truncate font-mono text-[0.6rem] text-[color:var(--ak-ink-2)]">{cred}</span>}
                  </div>
                </article>
              </Pop>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
