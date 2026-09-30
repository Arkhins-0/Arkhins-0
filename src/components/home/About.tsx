import { GraduationCap, MapPin, Star } from 'lucide-react';
import type { Site } from '@/lib/site';
import type { EducationRow } from '@/types/content';
import { qr } from '@/lib/qr';
import { cn, fill } from '@/lib/utils';
import { Pop } from './Pop';
import { Character, EpisodeHead } from './primitives';

const CHIP_COLORS = ['var(--ak-sakura-soft)', 'var(--ak-sky-soft)', '#fff1bf', '#d4f7ea', '#e9e1ff'];

function QrMark({ value, label }: { value: string; label: string }) {
  const code = qr(value);
  if (!code) return null;
  return (
    <svg viewBox={`0 0 ${code.size} ${code.size}`} role="img" aria-label={label} className="h-16 w-16 rounded-md border-2 border-[color:var(--ak-ink)] bg-white" shapeRendering="crispEdges">
      {code.runs.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.width} height={1} fill="#1c1633" />
      ))}
    </svg>
  );
}

/** "ARKHINS" reads as "Arkhins" on the profile sheet. */
const titleCase = (s: string) => (s === s.toUpperCase() ? s.charAt(0) + s.slice(1).toLowerCase() : s);

/** Character profile: the art on a panel beside a wiki-style profile sheet. */
export function About({ site, education }: { site: Site; education: EducationRow[] }) {
  const { profile, languages, interests } = site.portfolio;
  const { about, sections, series } = site.anime;
  const copy = site.copy.about;
  const alias = titleCase(series.title);
  const year = new Date().getFullYear();

  const rows = [
    { label: about.aliasLabel, value: alias },
    { label: about.classLabel, value: profile.headline },
    { label: about.baseLabel, value: `${profile.city}, ${profile.country}` },
    { label: about.statusLabel, value: profile.availability },
  ];

  return (
    <section id="about" className="ak-section">
      <div className="ak-shell">
        <EpisodeHead copy={sections.about} />

        <div className="mt-14 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <Pop className="relative">
            <div className="ak-cel ak-grid-paper relative overflow-hidden px-6 pb-24 pt-10">
              <span className="ak-tag absolute left-4 top-4 z-20 -rotate-3 bg-[color:var(--ak-ink)] text-white">{about.badge}</span>
              <Character src={about.image} alt={about.imageAlt} disc="var(--ak-sakura-soft)" className="mx-auto max-w-[340px]" imgClassName="max-h-[440px] w-auto md:max-h-[520px]" />
              <div className="absolute inset-x-4 bottom-4 z-20 rounded-xl border-[3px] border-[color:var(--ak-ink)] bg-[color:var(--ak-sun)] px-4 py-3 shadow-[3px_3px_0_var(--ak-ink)]">
                <p className="ak-display text-xl leading-tight md:text-2xl">{profile.name}</p>
                <p lang="ja" className="text-sm font-bold text-[color:var(--ak-ink-2)]">
                  {series.nameKana} · {series.title}
                </p>
              </div>
            </div>
          </Pop>

          <div className="space-y-6">
            <Pop delay={0.05} className="ak-cel overflow-hidden">
              <div className="flex items-center justify-between gap-4 border-b-[3px] border-[color:var(--ak-ink)] bg-[color:var(--ak-ink)] px-5 py-3 text-white">
                <p className="ak-display uppercase tracking-wide">
                  {about.sheetTitle}
                  <span lang="ja" className="ml-2 text-sm normal-case text-[color:var(--ak-sun)]">{about.sheetKana}</span>
                </p>
                <p className="text-xs font-bold opacity-80">{fill(about.idLabel, { year })}</p>
              </div>
              <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:p-6">
                <dl className="grid gap-2 sm:grid-cols-2">
                  {rows.map((r) => (
                    <div key={r.label} className="rounded-xl border-2 border-dashed border-[rgb(28_22_51/0.25)] px-3 py-2">
                      <dt className="text-[0.7rem] font-extrabold uppercase tracking-widest text-[color:var(--ak-sakura)]">{r.label}</dt>
                      <dd className="font-bold leading-snug">{r.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="hidden flex-col items-center gap-1 md:flex">
                  <QrMark value={copy.qr.value} label={copy.qr.aria} />
                  <span className="flex items-center gap-1 text-[0.65rem] font-bold text-[color:var(--ak-ink-2)]">
                    <MapPin size={10} /> {copy.timezoneLabel}
                  </span>
                </div>
              </div>
              <div className="px-5 pb-6 md:px-6">
                <div className="ak-bubble ak-bubble-none bg-[color:var(--ak-paper)]">
                  <p className="text-[0.95rem] leading-relaxed text-[color:var(--ak-ink-2)]">{profile.bio}</p>
                </div>
              </div>
            </Pop>

            <div className="grid gap-6 md:grid-cols-2">
              {languages.length > 0 && (
                <Pop delay={0.1} className="ak-cel p-5">
                  <p className="ak-display text-lg">{about.languagesLabel}</p>
                  <ul className="mt-4 space-y-3">
                    {languages.map((l) => (
                      <li key={l.id} className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold leading-tight">{l.name}</p>
                          <p className="text-xs font-medium text-[color:var(--ak-ink-2)]">{l.proficiency}</p>
                        </div>
                        <span className="flex gap-0.5" aria-label={`${l.level} of 5`}>
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              size={15}
                              strokeWidth={2.5}
                              className={cn(i < l.level ? 'fill-[color:var(--ak-sun)] text-[color:var(--ak-ink)]' : 'text-[rgb(28_22_51/0.25)]')}
                            />
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Pop>
              )}

              {education.length > 0 && (
                <Pop delay={0.15} className="ak-cel p-5">
                  <p className="ak-display text-lg">{about.educationLabel}</p>
                  <ul className="mt-4 space-y-4">
                    {education.map((e) => (
                      <li key={e.id} className="flex gap-3">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-[color:var(--ak-ink)] bg-[color:var(--ak-sky-soft)]">
                          <GraduationCap size={16} />
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold leading-tight">{e.degree}</p>
                          <p className="text-xs font-medium text-[color:var(--ak-ink-2)]">
                            {e.institution} · {e.startYear}–{e.current ? about.nowLabel : e.endYear}
                          </p>
                          {e.score && <span className="ak-tag mt-1 bg-[color:var(--ak-sun)] px-2 py-0 text-[0.65rem]">{e.score}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </Pop>
              )}
            </div>

            {interests.length > 0 && (
              <Pop delay={0.2}>
                <p className="ak-display text-lg">{about.interestsLabel}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {interests.map((it, i) => (
                    <li key={it.id} title={it.description ?? undefined} className="ak-tag px-3 py-1.5 text-sm" style={{ background: CHIP_COLORS[i % CHIP_COLORS.length] }}>
                      {it.name}
                    </li>
                  ))}
                </ul>
              </Pop>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
