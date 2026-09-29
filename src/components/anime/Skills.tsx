/* eslint-disable @next/next/no-img-element -- skill icons may be bucket URLs of unknown size */
import type { Site } from '@/lib/site';
import { fill, getAssetPath } from '@/lib/utils';
import { Pop } from './Pop';
import { Character, EpisodeHead } from './ui';

const BAR_COLORS = ['var(--ak-sakura)', 'var(--ak-sky)', 'var(--ak-mint)', 'var(--ak-lilac)', 'var(--ak-sun)'];

const iconSrc = (template: string, icon: string) =>
  icon.includes('/') ? getAssetPath(icon) : fill(template, { icon });

/** Skill categories as RPG stat sheets, plus the full stack as a scrolling equipment belt. */
export function Skills({ site }: { site: Site }) {
  const { categories, techStack } = site.portfolio.skills;
  const { skills, sections } = site.anime;
  const template = site.copy.stack.iconPathTemplate;
  const stack = techStack.filter((t, i) => techStack.findIndex((x) => x.name === t.name) === i);

  return (
    <section id="skills" className="ak-section overflow-hidden">
      <div className="ak-shell">
        <EpisodeHead copy={sections.skills} />

        <div className="mt-14 grid gap-10 lg:grid-cols-[280px_1fr]">
          <Pop className="relative hidden lg:block">
            <div className="sticky top-28">
              <div className="ak-bubble ak-bubble-right mb-6 -rotate-2">
                <p className="text-sm font-bold">{skills.tip}</p>
              </div>
              <Character src={skills.image} alt={skills.imageAlt} disc="#fff1bf" />
            </div>
          </Pop>

          <div className="grid gap-6 md:grid-cols-2">
            {categories.map((c, ci) => {
              const color = BAR_COLORS[ci % BAR_COLORS.length];
              return (
                <Pop key={c.name} delay={0.05 * (ci % 2)} className="ak-cel ak-lift p-5 md:p-6">
                  <div className="flex items-start gap-3">
                    <span
                      className="ak-display flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-[3px] border-[color:var(--ak-ink)] text-white"
                      style={{ background: color }}
                    >
                      {ci + 1}
                    </span>
                    <div>
                      <h3 className="ak-display text-lg leading-tight">{c.name}</h3>
                      <p className="mt-1 text-sm leading-snug text-[color:var(--ak-ink-2)]">{c.description}</p>
                    </div>
                  </div>
                  <ul className="mt-5 space-y-3.5">
                    {c.skills.map((s) => (
                      <li key={s.name}>
                        <div className="mb-1.5 flex items-center gap-2">
                          <img src={iconSrc(template, s.icon)} alt="" loading="lazy" className="h-5 w-5 object-contain" />
                          <span className="text-sm font-bold">{s.name}</span>
                          <span className="ml-auto text-xs font-extrabold tabular-nums">
                            Lv.<span className="text-sm">{s.level}</span>
                          </span>
                        </div>
                        <div className="ak-bar" role="meter" aria-valuenow={s.level} aria-valuemin={0} aria-valuemax={100} aria-label={s.name}>
                          <span style={{ width: `${s.level}%`, '--c': color } as React.CSSProperties} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </Pop>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <p className="ak-shell ak-display mb-4 text-lg">{skills.stackLabel}</p>
        <div className="ak-ribbon bg-white" aria-label={stack.map((s) => s.name).join(', ')}>
          <div className="ak-ribbon-track py-4" style={{ '--dur': '50s' } as React.CSSProperties}>
            {[0, 1].map((half) => (
              <ul key={half} aria-hidden={half === 1} className="flex shrink-0 items-center">
                {stack.map((t) => (
                  <li key={t.name} className="mx-3 flex items-center gap-2 rounded-full border-2 border-[color:var(--ak-ink)] bg-[color:var(--ak-paper)] py-1.5 pl-1.5 pr-4">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                      <img src={getAssetPath(t.icon)} alt="" loading="lazy" className="h-5 w-5 object-contain" />
                    </span>
                    <span className="whitespace-nowrap text-sm font-bold">{t.name}</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
