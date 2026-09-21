'use client';
/* eslint-disable @next/next/no-img-element */

import { useRef } from 'react';
import { Reveal } from '@/components/fx';
import { ProjectBar } from '@/components/layout/ProjectBar';
import { cn } from '@/lib/utils';
import type { ProjectRow, ShowcaseDoc, ThemedImage } from '@/types/content';
import { ActionButton, BlockView } from './blocks';
import { Frame, LightboxProvider, ScreensProvider, ScreensSwitch, ThemedImg } from './ui';
import './showcase.css';

/** Does any image in the document carry a dark variant? Decides whether the screens switch shows. */
function hasDarkVariant(doc: ShowcaseDoc): boolean {
  const seen: ThemedImage[] = [];
  const s = doc.hero.stage;
  if (s) seen.push(s.center, ...(s.left ? [s.left] : []), ...(s.right ? [s.right] : []));
  for (const b of doc.sections) {
    if (b.type === 'steps') seen.push(...b.items.map((i) => i.image));
    if (b.type === 'phones' || b.type === 'gallery') seen.push(...b.items);
    if (b.type === 'compare') seen.push(b.image);
  }
  return seen.some((i) => i.dark && i.dark !== i.light);
}

export function Showcase({ project, doc }: { project: ProjectRow; doc: ShowcaseDoc }) {
  const { theme } = doc;
  const vars = {
    ['--accent' as string]: theme.accent.hex,
    ['--accent-rgb' as string]: theme.accent.rgb,
    ['--accent-2' as string]: theme.accent2.hex,
    ['--accent-2-rgb' as string]: theme.accent2.rgb,
  };
  const shortName = project.title.split(':')[0].trim();

  return (
    <ScreensProvider initial={doc.screens.default} hasDark={hasDarkVariant(doc)}>
      <LightboxProvider>
        <div className="sc" data-look={theme.look} style={vars}>
          <div className="sc-bg" aria-hidden="true" />
          {theme.watermark && <img className="sc-watermark" src={theme.watermark} alt="" aria-hidden="true" />}

          <ProjectBar name={shortName} />

          <main>
            <Hero doc={doc} />
            {doc.sections.map((b, i) => (
              <BlockView key={`${b.type}-${i}`} block={b} index={i} />
            ))}
          </main>

          <ScreensSwitch />
        </div>
      </LightboxProvider>
    </ScreensProvider>
  );
}

function Hero({ doc }: { doc: ShowcaseDoc }) {
  const h = doc.hero;
  return (
    <section className="relative overflow-hidden pb-6 pt-32 md:pt-40">
      <div className="shell text-center">
        {h.eyebrow && (
          <Reveal dir="none">
            <p className="eyebrow inline-flex items-center gap-3">
              <span className="hazard h-3 w-10 opacity-70" />
              {h.eyebrow}
            </p>
          </Reveal>
        )}
        <Reveal delay={0.06}>
          <h1 className="mx-auto mt-6 max-w-5xl font-display text-[clamp(2.6rem,7.4vw,6rem)] font-extrabold leading-[0.92] tracking-tightest">
            {h.title}
            {h.accent && (
              <>
                <br />
                <span className="neon-text">{h.accent}</span>
              </>
            )}
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-7 max-w-2xl text-[clamp(1rem,1.6vw,1.2rem)] leading-relaxed text-ink-dim">{h.lede}</p>
        </Reveal>
        {h.badges && (
          <Reveal delay={0.18}>
            <ul className="mt-7 flex flex-wrap justify-center gap-2">
              {h.badges.map((b) => (
                <li key={b.label} className={cn('rounded-full border px-3 py-1.5 font-mono text-[0.68rem]', b.tone === 'accent' ? 'border-accent/45 bg-accent/10 text-accent' : 'border-white/12 text-ink-dim')}>
                  {b.label}
                </li>
              ))}
            </ul>
          </Reveal>
        )}
        {h.actions && (
          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              {h.actions.map((a) => <ActionButton key={a.href + a.label} action={a} />)}
            </div>
          </Reveal>
        )}
        {h.facts && (
          <Reveal delay={0.3}>
            <dl className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-4">
              {h.facts.map((f) => (
                <div key={f.label} className="text-left">
                  <dt className="hud text-ink-faint">{f.label}</dt>
                  <dd className="mt-1 text-sm font-medium text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </div>

      {h.stage && <Stage stage={h.stage} />}
    </section>
  );
}

function Stage({ stage }: { stage: NonNullable<ShowcaseDoc['hero']['stage']> }) {
  const ref = useRef<HTMLDivElement>(null);
  const single = !stage.left && !stage.right;

  const base = {
    center: (x: number, y: number) => `translateX(-50%) rotateX(${8 - y * 6}deg) rotateY(${x * 6}deg)`,
    left: (x: number, y: number) => `rotateY(${28 + x * 8}deg) rotateX(${4 - y * 5}deg) translateZ(-120px) translateX(${x * 14}px)`,
    right: (x: number, y: number) => `rotateY(${-28 + x * 8}deg) rotateX(${4 - y * 5}deg) translateZ(-120px) translateX(${x * 14}px)`,
  };

  const apply = (x: number, y: number) => {
    ref.current?.querySelectorAll<HTMLElement>('.sc-shot').forEach((el) => {
      const pos = el.dataset.pos as keyof typeof base;
      const d = pos === 'center' ? 1 : 0.6;
      el.style.transform = base[pos](x * d, y * d);
    });
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    apply(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
  };

  return (
    <div className="shell mt-14">
      <div ref={ref} className="sc-stage" data-single={single ? 'true' : undefined} onPointerMove={onMove} onPointerLeave={() => apply(0, 0)} aria-hidden="true">
        {stage.left && (
          <div className="sc-shot" data-pos="left" style={{ transform: base.left(0, 0) }}>
            <Frame image={stage.left} />
          </div>
        )}
        <div className="sc-shot" data-pos="center" style={{ transform: base.center(0, 0) }}>
          <Frame image={stage.center} url={stage.url} />
        </div>
        {stage.right && (
          <div className="sc-shot" data-pos="right" style={{ transform: base.right(0, 0) }}>
            <Frame image={stage.right} />
          </div>
        )}
      </div>
    </div>
  );
}

export { ThemedImg };
