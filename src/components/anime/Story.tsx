/* eslint-disable @next/next/no-img-element -- logos may be bucket URLs of unknown size */
import { ArrowUpRight, Check } from 'lucide-react';
import type { Site } from '@/lib/site';
import { isReal } from '@/lib/site';
import { getAssetPath } from '@/lib/utils';
import { Pop } from './Pop';
import { Character, EpisodeHead } from './ui';

const ARC_COLORS = ['var(--ak-sakura)', 'var(--ak-sky)', 'var(--ak-mint)', 'var(--ak-lilac)'];

/** Experience as numbered story arcs down a timeline, with a character keeping watch on the side. */
export function Story({ site }: { site: Site }) {
  const { story, sections } = site.anime;
  const arcs = site.portfolio.experience.filter(isReal);

  return (
    <section id="story" className="ak-section ak-halftone">
      <div className="ak-shell">
        <EpisodeHead copy={sections.story} />

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_300px]">
          <ol className="relative space-y-10 border-l-[3px] border-dashed border-[color:var(--ak-ink)] pl-7 md:pl-10">
            {arcs.map((a, i) => {
              const color = ARC_COLORS[i % ARC_COLORS.length];
              return (
                <Pop as="li" key={a.id} delay={0.04 * i} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[calc(1.75rem+11px)] top-6 h-5 w-5 rounded-full border-[3px] border-[color:var(--ak-ink)] md:-left-[calc(2.5rem+11px)]"
                    style={{ background: color }}
                  />
                  <article className="ak-cel ak-lift overflow-hidden">
                    <header className="flex flex-wrap items-center gap-3 border-b-[3px] border-[color:var(--ak-ink)] px-5 py-3" style={{ background: color }}>
                      <span className="ak-display text-white [-webkit-text-stroke:1px_var(--ak-ink)] [paint-order:stroke_fill]">
                        {story.arcLabel} {String(arcs.length - i).padStart(2, '0')}
                      </span>
                      <span className="rounded-full border-2 border-[color:var(--ak-ink)] bg-white px-2.5 py-0.5 text-xs font-extrabold">
                        {a.startDate} — {a.endDate}
                      </span>
                      {a.current && (
                        <span className="ml-auto flex items-center gap-1.5 rounded-full border-2 border-[color:var(--ak-ink)] bg-[color:var(--ak-sun)] px-2.5 py-0.5 text-xs font-extrabold">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                          {story.nowLabel}
                        </span>
                      )}
                    </header>
                    <div className="flex gap-4 p-5 md:p-6">
                      {a.logo && (
                        <img
                          src={getAssetPath(a.logo)}
                          alt=""
                          loading="lazy"
                          className="hidden h-14 w-14 shrink-0 rounded-xl border-2 border-[color:var(--ak-ink)] bg-white object-contain p-1.5 sm:block"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="ak-display text-xl leading-tight md:text-2xl">{a.position}</h3>
                        <p className="mt-1 font-bold text-[color:var(--ak-ink-2)]">
                          {a.url ? (
                            <a href={a.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline decoration-[color:var(--ak-sakura)] decoration-2 underline-offset-4 hover:text-[color:var(--ak-ink)]">
                              {a.company}
                              <ArrowUpRight size={14} />
                            </a>
                          ) : (
                            a.company
                          )}
                          <span className="font-medium"> · {a.type} · {a.location}</span>
                        </p>
                        <p className="mt-3 leading-relaxed text-[color:var(--ak-ink-2)]">{a.description}</p>
                        {a.highlights.length > 0 && (
                          <ul className="mt-4 space-y-1.5">
                            {a.highlights.map((h) => (
                              <li key={h} className="flex gap-2 text-sm font-medium">
                                <Check size={16} strokeWidth={3} className="mt-0.5 shrink-0" style={{ color }} />
                                {h}
                              </li>
                            ))}
                          </ul>
                        )}
                        <ul className="mt-4 flex flex-wrap gap-1.5">
                          {a.technologies.map((t) => (
                            <li key={t} className="rounded-md border-2 border-[color:var(--ak-ink)] bg-[color:var(--ak-paper)] px-2 py-0.5 text-[0.7rem] font-bold">
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                </Pop>
              );
            })}
          </ol>

          <div className="hidden lg:block">
            <div className="sticky top-28">
              <div className="ak-bubble mb-6 rotate-2">
                <p className="text-sm font-bold">{story.bubble}</p>
              </div>
              <Character src={story.image} alt={story.imageAlt} disc="var(--ak-sky-soft)" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
