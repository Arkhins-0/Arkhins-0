'use client';

/* eslint-disable @next/next/no-img-element -- cast art and thumbnails may be bucket URLs of unknown size */
import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CastRole = {
  name: string;
  kana: string;
  series: string;
  role: string;
  pitch: string;
  image: string;
  /** Square face crop for the selector tabs; falls back to a crop of `image`. */
  face?: string;
  color: string;
  subject: string;
  skills: { name: string; level: number | null; icon: string | null }[];
  projects: { slug: string; title: string; category: string; thumbnail: string }[];
};

/** Fired to prefill the contact form; ContactForm listens for it. */
export const HIRE_EVENT = 'ak:hire';

type Labels = { role: string; skills: string; proof: string; hire: string; work: string };

/** Fighting-game style select: portraits along the top, the chosen role in the spotlight below. */
export function RolePicker({ roles, labels }: { roles: CastRole[]; labels: Labels }) {
  const [i, setI] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const r = roles[i];

  const pick = (n: number) => {
    const next = (n + roles.length) % roles.length;
    setI(next);
    tabs.current[next]?.focus();
  };

  const hire = () => {
    window.dispatchEvent(new CustomEvent(HIRE_EVENT, { detail: { subject: r.subject } }));
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="mt-12">
      <div
        role="tablist"
        aria-label={labels.role}
        className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') pick(i + 1);
          if (e.key === 'ArrowLeft') pick(i - 1);
        }}
      >
        {roles.map((c, n) => (
          <button
            key={c.name}
            ref={(el) => {
              tabs.current[n] = el;
            }}
            type="button"
            role="tab"
            id={`cast-tab-${n}`}
            aria-selected={n === i}
            aria-controls="cast-panel"
            tabIndex={n === i ? 0 : -1}
            onClick={() => setI(n)}
            className={cn(
              'group flex shrink-0 snap-start items-center gap-3 rounded-2xl border-[3px] py-2 pl-2 pr-4 text-left transition-all duration-300',
              n === i ? 'border-white bg-white text-[color:var(--ak-ink)] shadow-[4px_4px_0_var(--ak-sakura)]' : 'border-white/25 hover:border-white/70'
            )}
          >
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 border-current" style={{ background: c.color }}>
              {c.face ? (
                <img src={c.face} alt="" className="h-full w-full object-cover" />
              ) : (
                <img src={c.image} alt="" className="absolute left-1/2 top-0 h-[260%] w-auto max-w-none -translate-x-1/2 object-cover object-top" />
              )}
            </span>
            <span>
              <span className="block text-[0.65rem] font-extrabold uppercase tracking-widest opacity-70">{String(n + 1).padStart(2, '0')} · {c.name}</span>
              <span className="ak-display block whitespace-nowrap text-base leading-tight">{c.role}</span>
            </span>
          </button>
        ))}
      </div>

      <div
        id="cast-panel"
        role="tabpanel"
        aria-labelledby={`cast-tab-${i}`}
        className="mt-8 grid overflow-hidden rounded-[26px] border-[3px] border-white lg:grid-cols-[0.85fr_1.15fr]"
      >
        <div key={`stage-${i}`} className="relative min-h-[360px] overflow-hidden md:min-h-[460px]" style={{ background: r.color }}>
          <span aria-hidden="true" className="ak-halftone absolute inset-0 opacity-40 [filter:invert(1)]" />
          <span aria-hidden="true" className="absolute left-1/2 top-1/2 aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white/60 bg-white/15" />
          <span lang="ja" aria-hidden="true" className="ak-kana ak-display absolute left-4 top-4 text-4xl text-white/30 md:text-5xl">
            {r.kana}
          </span>
          <img
            src={r.image}
            alt={`${r.name} from ${r.series}`}
            className="animate-[ak-cast-in_0.6s_cubic-bezier(0.22,1,0.36,1)] absolute bottom-0 left-1/2 h-[94%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom drop-shadow-[6px_8px_0_rgba(0,0,0,0.3)]"
          />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <p className="rounded-xl border-[3px] border-[color:var(--ak-ink)] bg-white px-3 py-1.5 text-[color:var(--ak-ink)] shadow-[3px_3px_0_var(--ak-ink)]">
              <span className="ak-display block text-lg leading-none">{r.name}</span>
              <span className="text-[0.65rem] font-bold text-[color:var(--ak-ink-2)]">{r.series}</span>
            </p>
          </div>
        </div>

        <div key={`info-${i}`} className="animate-[ak-cast-info_0.5s_ease-out] bg-[color:var(--ak-paper)] p-6 text-[color:var(--ak-ink)] md:p-8">
          <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: r.color }}>
            {labels.role} {String(i + 1).padStart(2, '0')}/{String(roles.length).padStart(2, '0')}
          </p>
          <h3 className="ak-display mt-1 text-3xl leading-tight md:text-4xl">{r.role}</h3>
          <p className="mt-3 max-w-xl leading-relaxed text-[color:var(--ak-ink-2)]">{r.pitch}</p>

          <p className="ak-display mt-7 text-sm">{labels.skills}</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {r.skills.map((s) => (
              <li key={s.name}>
                <div className="mb-1 flex items-center gap-2 text-sm font-bold">
                  {s.icon && <img src={s.icon} alt="" className="h-4 w-4 object-contain" />}
                  {s.name}
                  {s.level !== null && <span className="ml-auto text-xs font-extrabold tabular-nums">Lv.{s.level}</span>}
                </div>
                {s.level !== null ? (
                  <div className="ak-bar h-3" role="meter" aria-valuenow={s.level} aria-valuemin={0} aria-valuemax={100} aria-label={s.name}>
                    <span className="!scale-x-100" style={{ width: `${s.level}%`, '--c': r.color } as React.CSSProperties} />
                  </div>
                ) : (
                  <div className="h-3 rounded-full border-2 border-dashed border-[rgb(28_22_51/0.25)]" />
                )}
              </li>
            ))}
          </ul>

          {r.projects.length > 0 && (
            <>
              <p className="ak-display mt-7 text-sm">{labels.proof}</p>
              <ul className="mt-3 grid gap-3 sm:grid-cols-3">
                {r.projects.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/projects/${p.slug}`}
                      className="group block overflow-hidden rounded-xl border-[3px] border-[color:var(--ak-ink)] bg-white shadow-[3px_3px_0_var(--ak-ink)] transition-transform hover:-translate-y-0.5"
                    >
                      <span className="relative block aspect-[16/10] overflow-hidden border-b-2 border-[color:var(--ak-ink)] bg-[color:var(--ak-sky-soft)]">
                        {p.thumbnail && <img src={p.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-2">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-extrabold">{p.title}</span>
                          <span className="block text-[0.65rem] font-bold text-[color:var(--ak-ink-2)]">{p.category}</span>
                        </span>
                        <ArrowUpRight size={14} className="ml-auto shrink-0" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={hire} className="ak-btn" style={{ background: r.color }}>
              <Send size={16} />
              {labels.hire}
            </button>
            <Link href="/#work" className="ak-btn ak-btn-ghost">
              {labels.work}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
