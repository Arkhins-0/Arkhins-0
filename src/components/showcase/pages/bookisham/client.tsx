'use client';
/* eslint-disable @next/next/no-img-element */

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Block, ThemedImage } from '@/types/content';

// ------------------------------------------------------------ night reading

const NIGHT_KEY = 'bookisham:night';

/** Swaps the paper for a dim page. The choice is remembered per reader; the page renders fine without it. */
export function NightToggle() {
  const [night, setNight] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(NIGHT_KEY) === 'on') setNight(true);
    } catch {
      /* storage unavailable: stay on paper */
    }
  }, []);

  useEffect(() => {
    const root = document.getElementById('bk-root');
    if (root) root.dataset.night = night ? 'on' : 'off';
  }, [night]);

  const toggle = () => {
    setNight((n) => {
      const next = !n;
      try {
        window.localStorage.setItem(NIGHT_KEY, next ? 'on' : 'off');
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <button type="button" className="bk-night" aria-pressed={night} onClick={toggle}>
      <span aria-hidden="true" className="bk-night-glyph">{night ? '☾' : '☼'}</span>
      <span>Night reading</span>
    </button>
  );
}

// ------------------------------------------------------------ plate viewer

type Viewer = { open: (items: ThemedImage[], index: number, labels: string[]) => void };
const ViewerCtx = createContext<Viewer>({ open: () => {} });

/** One <dialog> for the whole book: any plate opens in it at full size, with its neighbours a keypress away. */
export function PlateRoom({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<{ items: ThemedImage[]; labels: string[]; i: number } | null>(null);

  const open = useCallback((items: ThemedImage[], i: number, labels: string[]) => {
    setState({ items, labels, i });
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (state && !d.open) d.showModal();
    if (!state && d.open) d.close();
  }, [state]);

  const step = useCallback(
    (delta: number) =>
      setState((s) => (s ? { ...s, i: (s.i + delta + s.items.length) % s.items.length } : s)),
    []
  );

  const current = state ? state.items[state.i] : null;

  return (
    <ViewerCtx.Provider value={{ open }}>
      {children}
      <dialog
        ref={ref}
        className="bk-viewer"
        aria-label={current ? current.alt : 'Plate'}
        onClose={() => setState(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setState(null);
        }}
        onKeyDown={(e) => {
          if (!state || state.items.length < 2) return;
          if (e.key === 'ArrowRight') step(1);
          if (e.key === 'ArrowLeft') step(-1);
        }}
      >
        {state && current && (
          <div className="bk-viewer-sheet">
            <div className="bk-viewer-bar">
              <p>
                <span className="sc">{state.labels[state.i]}</span>{' '}
                <em>{current.caption ?? current.alt}</em>
              </p>
              <button type="button" className="bk-viewer-btn" onClick={() => setState(null)} autoFocus>
                Close <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="bk-viewer-img">
              <img src={current.light} alt={current.alt} />
            </div>
            {state.items.length > 1 && (
              <div className="bk-viewer-nav">
                <button type="button" className="bk-viewer-btn" onClick={() => step(-1)}>
                  <span aria-hidden="true">←</span> Previous plate
                </button>
                <span className="bk-viewer-count">
                  {state.i + 1} of {state.items.length}
                </span>
                <button type="button" className="bk-viewer-btn" onClick={() => step(1)}>
                  Next plate <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </ViewerCtx.Provider>
  );
}

/** A tipped-in illustration: photo corners, an optional drawn device, a numbered caption. Opens in the viewer. */
export function Plate({
  image,
  label,
  group,
  labels,
  index = 0,
  frame = 'none',
  url,
  crop = true,
  eager = false,
  className,
}: {
  image: ThemedImage;
  label: string;
  group?: ThemedImage[];
  labels?: string[];
  index?: number;
  frame?: 'none' | 'browser' | 'phone';
  url?: string;
  crop?: boolean;
  eager?: boolean;
  className?: string;
}) {
  const { open } = useContext(ViewerCtx);
  const items = group ?? [image];
  const names = labels ?? [label];
  const img = (
    <img
      src={image.light}
      alt={image.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={crop ? 'bk-crop' : undefined}
    />
  );
  return (
    <figure className={`bk-plate bk-plate-${frame}${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className="bk-plate-btn"
        onClick={() => open(items, index, names)}
        aria-label={`Enlarge ${label}: ${image.alt}`}
      >
        {frame === 'browser' ? (
          <span className="bk-browser">
            <span className="bk-browser-bar" aria-hidden="true">
              <i />
              <i />
              <i />
              {url && <span className="bk-browser-url">{url}</span>}
            </span>
            {img}
          </span>
        ) : frame === 'phone' ? (
          <span className="bk-phone">{img}</span>
        ) : (
          <span className="bk-mount">{img}</span>
        )}
        <span className="bk-corners" aria-hidden="true" />
      </button>
      <figcaption>
        <span className="sc">{label}</span> <span className="bk-cap">{image.caption ?? image.alt}</span>
      </figcaption>
    </figure>
  );
}

// ------------------------------------------------------------ ribbon tabs

type Tab = Extract<Block, { type: 'tabs' }>['tabs'][number];
const RIBBONS = ['#7a1d26', '#2f4a3a', '#23324a', '#6b4a1c'];

/** Silk ribbons hang from the top of the page; pulling one opens its part. Every part is in the HTML. */
export function RibbonTabs({ tabs, label }: { tabs: Tab[]; label: string }) {
  const [active, setActive] = useState(0);
  const base = useId().replace(/:/g, '');
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, k: number) => {
    let next = -1;
    if (e.key === 'ArrowRight') next = (k + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (k - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <div className="bk-ribbon-tabs">
      <div role="tablist" aria-label={label} className="bk-ribbons">
        {tabs.map((t, k) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[k] = el;
            }}
            role="tab"
            type="button"
            id={`${base}-t-${k}`}
            aria-selected={k === active}
            aria-controls={`${base}-p-${k}`}
            tabIndex={k === active ? 0 : -1}
            className="bk-ribbon"
            style={{ '--rb': RIBBONS[k % RIBBONS.length] } as React.CSSProperties}
            onClick={() => setActive(k)}
            onKeyDown={(e) => onKey(e, k)}
          >
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      {tabs.map((t, k) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-p-${k}`}
          aria-labelledby={`${base}-t-${k}`}
          hidden={k !== active}
          className="bk-part"
          tabIndex={0}
        >
          <p className="bk-part-no sc">Part the {ORDINALS[k] ?? k + 1}</p>
          <h3 className="bk-part-title">
            {t.label}
            {t.subtitle && <em>{t.subtitle}</em>}
          </h3>
          <ol className="bk-roman">
            {t.steps.map((s, j) => (
              <li key={j}>
                <strong>{s.title}.</strong> {s.description}
              </li>
            ))}
          </ol>
          {t.details && t.details.length > 0 && (
            <div className="bk-foot">
              <p>
                <sup>*</sup> <em>{t.detailsTitle ?? 'Notes'}:</em>{' '}
                {t.details.map((d, j) => (
                  <span key={j} className="bk-foot-item">
                    {d}
                    {j < t.details!.length - 1 ? ' · ' : '.'}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth'];

// ------------------------------------------------------------ manuscript (markdown)

/** A markdown chapter, fetched from its file and typeset in two columns like a spread. */
export function Manuscript({ file }: { file: string }) {
  const [text, setText] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(file)
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((t) => live && setText(t))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [file]);

  if (failed) return <p className="bk-quiet">This chapter could not be fetched from the archive.</p>;
  if (text === null) return <p className="bk-quiet">Fetching the manuscript…</p>;
  return (
    <div className="bk-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}
