'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLightbox } from '../../primitives';
import type { Block, ThemedImage } from '@/types/content';

/** A screenshot that opens the shared lightbox. Overlays (tags, captions) arrive as children. */
export function Shot({
  items,
  index,
  className,
  imgClassName,
  children,
}: {
  items: ThemedImage[];
  index: number;
  className?: string;
  imgClassName?: string;
  children?: React.ReactNode;
}) {
  const { open } = useLightbox();
  const img = items[index];
  if (!img) return null;
  return (
    <button
      type="button"
      className={className ? `ctru-shot ${className}` : 'ctru-shot'}
      onClick={() => open(items, index)}
      aria-label={`Enlarge screenshot: ${img.caption ?? img.alt}`}
    >
      <img src={img.light} alt={img.alt} loading="lazy" decoding="async" className={imgClassName} />
      {children}
    </button>
  );
}

type TabsBlock = Extract<Block, { type: 'tabs' }>;

/** The tabs block as a game's settings screen: categories on a rail, each step a settings row. */
export function SettingsScreen({ tabs }: { tabs: TabsBlock['tabs'] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const uid = 'ctru-set';

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const last = tabs.length - 1;
    let n = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = i === last ? 0 : i + 1;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = i === 0 ? last : i - 1;
    if (e.key === 'Home') n = 0;
    if (e.key === 'End') n = last;
    if (n < 0) return;
    e.preventDefault();
    setActive(n);
    refs.current[n]?.focus();
  };

  return (
    <div className="ctru-settings ctru-glass ctru-corner">
      <div className="ctru-set-rail">
        <div className="ctru-set-rail-head">
          <span className="ctru-label">Categories</span>
          <span className="ctru-prompts" aria-hidden="true">
            <span><i className="ctru-kb ctru-kb--lb">LB</i><i className="ctru-kb ctru-kb--rb">RB</i></span>
          </span>
        </div>
        <div role="tablist" aria-orientation="vertical" aria-label="Categories">
          {tabs.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={`${uid}-tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-controls={`${uid}-panel-${t.id}`}
              tabIndex={i === active ? 0 : -1}
              className="ctru-set-tab"
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <b>{t.label}</b>
              {t.subtitle && <small>{t.subtitle}</small>}
            </button>
          ))}
        </div>
      </div>

      {tabs.map((t, i) => (
        <div
          key={t.id}
          id={`${uid}-panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${t.id}`}
          hidden={i !== active}
          className="ctru-set-panel"
          tabIndex={0}
        >
          <div className="ctru-set-title">
            <h3>{t.label}</h3>
            <span className="ctru-label">
              {t.steps.length} settings{t.details?.length ? ` · ${t.details.length} modules` : ''}
            </span>
          </div>
          <ol className="ctru-set-rows">
            {t.steps.map((s, j) => {
              const pct = Math.round(((j + 1) / t.steps.length) * 100);
              return (
                <li key={j} className="ctru-set-row">
                  <span className="ctru-set-num">{String(j + 1).padStart(2, '0')}</span>
                  <div>
                    <h4>{s.title}</h4>
                    <p>{s.description}</p>
                  </div>
                  <div className="ctru-slider" aria-hidden="true">
                    <span className="ctru-slider-track">
                      <span className="ctru-slider-fill" style={{ width: `${pct}%` }} />
                      <span className="ctru-slider-knob" style={{ left: `${pct}%` }} />
                    </span>
                    <span className="ctru-slider-val">{pct}</span>
                  </div>
                </li>
              );
            })}
          </ol>
          {t.details && t.details.length > 0 && (
            <>
              <p className="ctru-label" style={{ marginTop: 22 }}>{t.detailsTitle ?? 'Modules'}</p>
              <ul className="ctru-toggles">
                {t.details.map((d) => (
                  <li key={d} className="ctru-toggle">
                    <code>{d}</code>
                    <span className="ctru-switch" aria-hidden="true" />
                    <span className="ctru-sr">enabled</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ))}

      <div className="ctru-set-foot ctru-prompts" aria-hidden="true">
        <span><i className="ctru-kb">A</i> Select</span>
        <span><i className="ctru-kb ctru-kb--y">Y</i> Defaults</span>
        <span><i className="ctru-kb ctru-kb--b">B</i> Back</span>
      </div>
    </div>
  );
}

/** The gallery block as a garage: one car on the turntable, the rest of the collection below. */
export function Garage({ items }: { items: ThemedImage[] }) {
  const [i, setI] = useState(0);
  const { open } = useLightbox();
  const strip = useRef<HTMLDivElement>(null);
  const n = items.length;
  const go = (d: number) => setI((v) => (v + d + n) % n);

  useEffect(() => {
    const el = strip.current?.children[i] as HTMLElement | undefined;
    if (!el || !strip.current) return;
    const s = strip.current;
    s.scrollTo({ left: el.offsetLeft - s.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' });
  }, [i]);

  if (!n) return null;
  const cur = items[i];

  return (
    <div
      className="ctru-garage ctru-glass ctru-corner"
      role="region"
      aria-roledescription="carousel"
      aria-label="Garage"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(-1);
        if (e.key === 'ArrowRight') go(1);
      }}
    >
      <div className="ctru-garage-view">
        <button
          type="button"
          className="ctru-garage-main"
          onClick={() => open(items, i)}
          aria-label={`Enlarge screenshot: ${cur.caption ?? cur.alt}`}
        >
          <img src={cur.light} alt={cur.alt} decoding="async" />
          <span className="ctru-garage-cap">
            <strong>{cur.caption ?? cur.alt}</strong>
            <span className="ctru-label">
              <i className="ctru-kb" aria-hidden="true">A</i> Inspect
            </span>
          </span>
        </button>
      </div>
      <div className="ctru-garage-nav">
        <button type="button" className="ctru-arrow" onClick={() => go(-1)} aria-label="Previous screen">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ChevronLeft size={16} aria-hidden="true" /> Prev
          </span>
        </button>
        <span className="ctru-garage-count" aria-live="polite">
          Bay <b>{String(i + 1).padStart(2, '0')}</b> / {String(n).padStart(2, '0')}
        </span>
        <button type="button" className="ctru-arrow" onClick={() => go(1)} aria-label="Next screen">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Next <ChevronRight size={16} aria-hidden="true" />
          </span>
        </button>
      </div>
      <div className="ctru-thumbs" ref={strip}>
        {items.map((it, j) => (
          <button
            key={`${it.light}-${j}`}
            type="button"
            className="ctru-thumb"
            aria-pressed={j === i}
            aria-label={`Show ${it.caption ?? it.alt}`}
            onClick={() => setI(j)}
          >
            <img src={it.light} alt="" loading="lazy" decoding="async" />
            <span>{it.caption ?? it.alt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Markdown blocks load their file on the client and render inside a glass panel. */
export function MarkdownScreen({ file }: { file: string }) {
  const [text, setText] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    fetch(file)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((t) => live && setText(t))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [file]);
  return (
    <div className="ctru-md ctru-glass ctru-corner">
      {text !== null ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      ) : (
        <p className="ctru-label">{failed ? 'Could not load this briefing.' : 'Loading briefing…'}</p>
      )}
    </div>
  );
}
