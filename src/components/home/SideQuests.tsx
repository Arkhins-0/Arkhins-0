/* eslint-disable @next/next/no-img-element -- logos may be bucket URLs of unknown size */
import { ArrowUpRight, Flag, Sparkles } from 'lucide-react';
import type { Site } from '@/lib/site';
import { getAssetPath } from '@/lib/utils';
import { Pop } from './Pop';
import { EpisodeHead } from './primitives';

/** Volunteering and workshops as a quest log. */
export function SideQuests({ site }: { site: Site }) {
  const { beyond, sections } = site.anime;
  const { volunteering, workshops } = site.portfolio;
  if (!volunteering.length && !workshops.length) return null;

  return (
    <section id="beyond" className="ak-section">
      <div className="ak-shell">
        <EpisodeHead copy={sections.beyond} />

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Pop>
            <h3 className="ak-display flex items-center gap-2 text-xl">
              <Flag size={20} className="text-[color:var(--ak-sakura)]" /> {beyond.volunteering}
            </h3>
            <ul className="mt-5 space-y-5">
              {volunteering.map((v) => (
                <li key={v.id} className="ak-cel ak-lift overflow-hidden">
                  {v.logo && (
                    <div className="relative flex h-32 items-center justify-center border-b-[3px] border-[color:var(--ak-ink)] bg-white px-8">
                      <img src={getAssetPath(v.logo)} alt="" loading="lazy" className="max-h-16 w-auto max-w-full object-contain" />
                      <span className="ak-tag absolute left-3 top-3 bg-[color:var(--ak-mint)] text-white">
                        {v.current ? `${v.startDate} –` : v.endDate && v.endDate !== v.startDate ? `${v.startDate} – ${v.endDate}` : v.startDate}
                      </span>
                    </div>
                  )}
                  <div className="p-5">
                    <p className="ak-display text-xl leading-tight">{v.role}</p>
                    <p className="font-bold text-[color:var(--ak-ink-2)]">{v.organization}</p>
                    {v.description && <p className="mt-3 text-sm leading-relaxed text-[color:var(--ak-ink-2)]">{v.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </Pop>

          <Pop delay={0.08}>
            <h3 className="ak-display flex items-center gap-2 text-xl">
              <Sparkles size={20} className="text-[color:var(--ak-sky)]" /> {beyond.workshops}
            </h3>
            <ol className="mt-5 space-y-4">
              {workshops.map((w, i) => (
                <li key={w.id} className="ak-cel-sm flex gap-4 p-4">
                  <span className="ak-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[color:var(--ak-ink)] bg-[color:var(--ak-sun)]">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold leading-tight">{w.name}</p>
                    <p className="text-xs font-bold text-[color:var(--ak-sakura)]">
                      {w.organizer} · {w.date}
                    </p>
                    {w.description && <p className="mt-2 text-sm leading-relaxed text-[color:var(--ak-ink-2)]">{w.description}</p>}
                    {w.certificateUrl && (
                      <a
                        href={w.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold underline decoration-[color:var(--ak-sky)] decoration-2 underline-offset-4"
                      >
                        {beyond.certificate}
                        <ArrowUpRight size={12} />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Pop>
        </div>
      </div>
    </section>
  );
}
