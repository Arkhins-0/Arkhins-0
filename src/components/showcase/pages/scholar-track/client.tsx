'use client';
/* eslint-disable @next/next/no-img-element */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ThemedImage } from '@/types/content';

// ------------------------------------------------------------------ plates (lightbox)

type Desk = { open: (items: ThemedImage[], index: number) => void };
const DeskCtx = createContext<Desk>({ open: () => {} });

/** Holds the enlarged-plate viewer: a native <dialog>, so focus trapping and Escape come for free. */
export function PlateDesk({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<{ items: ThemedImage[]; i: number } | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const open = useCallback((items: ThemedImage[], i: number) => {
    opener.current = document.activeElement as HTMLElement | null;
    setState({ items, i });
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (state && d && !d.open) d.showModal();
  }, [state]);

  const close = () => ref.current?.close();
  const step = (dir: number) =>
    setState((s) => (s ? { ...s, i: (s.i + dir + s.items.length) % s.items.length } : s));

  const cur = state ? state.items[state.i] : null;

  return (
    <DeskCtx.Provider value={{ open }}>
      {children}
      <dialog
        ref={ref}
        className="st-dialog"
        aria-label={cur ? cur.caption ?? cur.alt : 'Plate'}
        onClose={() => {
          setState(null);
          opener.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onKeyDown={(e) => {
          if (!state || state.items.length < 2) return;
          if (e.key === 'ArrowRight') step(1);
          if (e.key === 'ArrowLeft') step(-1);
        }}
      >
        {cur && state && (
          <figure className="st-dialog-fig">
            <div className="st-dialog-bar">
              <span className="st-mono">
                Plate {state.i + 1} / {state.items.length}
              </span>
              <span className="st-dialog-btns">
                {state.items.length > 1 && (
                  <>
                    <button type="button" onClick={() => step(-1)} aria-label="Previous plate">←</button>
                    <button type="button" onClick={() => step(1)} aria-label="Next plate">→</button>
                  </>
                )}
                <button type="button" onClick={close} aria-label="Close" autoFocus>
                  ✕
                </button>
              </span>
            </div>
            <div className="st-dialog-img">
              <img src={cur.light} alt={cur.alt} />
            </div>
            <figcaption>{cur.caption ?? cur.alt}</figcaption>
          </figure>
        )}
      </dialog>
    </DeskCtx.Provider>
  );
}

/** A figure that opens the plate viewer; server-rendered children stay visible without JS. */
export function Plate({
  items,
  index,
  className,
  children,
}: {
  items: ThemedImage[];
  index: number;
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useContext(DeskCtx);
  const img = items[index];
  return (
    <button
      type="button"
      className={className}
      onClick={() => open(items, index)}
      aria-label={`Enlarge: ${img?.caption ?? img?.alt ?? 'figure'}`}
    >
      {children}
    </button>
  );
}

// ------------------------------------------------------------------ compare

/** Two-panel figure: (a) light and (b) dark, split by a draggable rule. */
export function CompareFigure({ image }: { image: ThemedImage }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="st-compare" style={{ ['--pos' as string]: `${pos}%` }}>
      <img src={image.light} alt={`${image.alt}, light theme`} className="st-cmp-a" loading="lazy" />
      <img src={image.dark ?? image.light} alt={`${image.alt}, dark theme`} className="st-cmp-b" loading="lazy" />
      <span className="st-cmp-rule" aria-hidden="true">
        <span className="st-mono">⟷</span>
      </span>
      <span className="st-cmp-tag st-cmp-tag-a st-mono" aria-hidden="true">(a) light</span>
      <span className="st-cmp-tag st-cmp-tag-b st-mono" aria-hidden="true">(b) dark</span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        aria-label="Compare light and dark themes"
        aria-valuetext={`${pos}% light`}
        onChange={(e) => setPos(Number(e.target.value))}
      />
    </div>
  );
}

// ------------------------------------------------------------------ markdown

/** The case study, fetched on the client and typeset as two-column body text. */
export function Manuscript({ file }: { file: string }) {
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

  if (text === null) {
    return (
      <p className="st-note">
        {failed ? 'The manuscript could not be loaded. ' : 'Typesetting the manuscript… '}
        <a href={file} className="st-url st-mono">
          Read the source
        </a>
        .
      </p>
    );
  }

  // The first H1 duplicates the paper title; drop it.
  const body = text.replace(/^\s*#\s+[^\n]*\n/, '');
  return (
    <div className="st-md st-cols">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} {...(href && /^https?:/.test(href) ? { target: '_blank', rel: 'noreferrer noopener' } : {})}>
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="st-tablewrap">
              <table className="st-booktabs">{children}</table>
            </div>
          ),
          img: ({ src, alt }) => <img src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} loading="lazy" />,
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
