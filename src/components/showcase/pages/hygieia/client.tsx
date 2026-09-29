'use client';
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Block, ThemedImage } from '@/types/content';

type TabsBlock = Extract<Block, { type: 'tabs' }>;

// ------------------------------------------------------------ folder tabs

/** Folder index tabs. Every panel is server-rendered; inactive ones are only hidden. */
export function ChartTabs({ tabs, uid }: { tabs: TabsBlock['tabs']; uid: string }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let n = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') n = 0;
    if (e.key === 'End') n = tabs.length - 1;
    if (n >= 0) {
      e.preventDefault();
      setActive(n);
      refs.current[n]?.focus();
    }
  };

  return (
    <div className="hy-folder">
      <div className="hy-folder-tabs" role="tablist" aria-label="Diagnostic models">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${uid}-tab-${t.id}`}
            aria-controls={`${uid}-panel-${t.id}`}
            aria-selected={active === i}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
            style={{ ['--hue' as string]: t.hue ?? '#0f766e' }}
          >
            <span className="hy-folder-dot" aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${uid}-panel-${t.id}`}
          aria-labelledby={`${uid}-tab-${t.id}`}
          hidden={active !== i}
          className="hy-folder-panel"
          style={{ ['--hue' as string]: t.hue ?? '#0f766e' }}
        >
          <div className="hy-pathway-head">
            <h3>{t.label}</h3>
            {t.subtitle && <p>{t.subtitle}</p>}
          </div>
          <ol className="hy-pathway">
            {t.steps.map((s, k) => (
              <li key={k}>
                <span className="hy-pathway-n" aria-hidden="true">
                  {k + 1}
                </span>
                <strong>{s.title}</strong>
                <span>{s.description}</span>
              </li>
            ))}
          </ol>
          {t.details && t.details.length > 0 && (
            <div className="hy-recorded">
              {t.detailsTitle && <p className="hy-field-label">{t.detailsTitle}</p>}
              <ul>
                {t.details.map((d, k) => (
                  <li key={k}>{d}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------- day / night

export function ShiftCompare({ image }: { image: ThemedImage }) {
  const [pos, setPos] = useState(50);
  const dark = image.dark ?? image.light;
  return (
    <figure className="hy-shift">
      <div className="hy-shift-frame" style={{ ['--pos' as string]: `${pos}%` }}>
        <img src={image.light} alt={`${image.alt}, light theme`} />
        <img src={dark} alt={`${image.alt}, dark theme`} className="hy-shift-dark" />
        <span className="hy-shift-handle" aria-hidden="true" />
        <span className="hy-shift-tag hy-shift-tag--l" aria-hidden="true">Night shift</span>
        <span className="hy-shift-tag hy-shift-tag--r" aria-hidden="true">Day shift</span>
      </div>
      <label className="hy-shift-range">
        <span className="sr-only">Reveal the dark theme</span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
        />
      </label>
      {image.caption && <figcaption>{image.caption}</figcaption>}
    </figure>
  );
}

// ------------------------------------------------------- x-ray light box

export function LightBox({ items }: { items: ThemedImage[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [i, setI] = useState<number | null>(null);

  const open = (k: number) => {
    setI(k);
    ref.current?.showModal();
  };
  const close = useCallback(() => ref.current?.close(), []);
  const step = useCallback(
    (d: number) => setI((c) => (c === null ? c : (c + d + items.length) % items.length)),
    [items.length]
  );

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    const onKey = (e: KeyboardEvent) => {
      if (!dlg.open) return;
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    const onClose = () => setI(null);
    window.addEventListener('keydown', onKey);
    dlg.addEventListener('close', onClose);
    return () => {
      window.removeEventListener('keydown', onKey);
      dlg.removeEventListener('close', onClose);
    };
  }, [step]);

  const cur = i === null ? null : items[i];

  return (
    <>
      <div className="hy-viewbox">
        <ul className="hy-viewbox-grid">
          {items.map((img, k) => (
            <li key={k}>
              <button type="button" onClick={() => open(k)} className="hy-xray">
                <img src={img.light} alt={img.alt} loading="lazy" />
                <span className="hy-xray-cap">
                  <span aria-hidden="true">{String(k + 1).padStart(2, '0')} &middot; </span>
                  {img.caption ?? img.alt}
                </span>
                <span className="sr-only"> (open full size)</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <dialog
        ref={ref}
        className="hy-dialog"
        aria-label={cur?.alt ?? 'Screen'}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {cur && i !== null && (
          <div className="hy-dialog-inner">
            <div className="hy-dialog-bar">
              <span>
                {cur.caption ?? cur.alt} &middot; {i + 1} / {items.length}
              </span>
              <div>
                <button type="button" onClick={() => step(-1)} aria-label="Previous screen">
                  &larr;
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next screen">
                  &rarr;
                </button>
                <button type="button" onClick={close} aria-label="Close">
                  &times;
                </button>
              </div>
            </div>
            <div className="hy-dialog-img">
              <img src={cur.light} alt={cur.alt} />
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

// ---------------------------------------------------------- doctor's notes

export function DoctorsNotes({ file }: { file: string }) {
  const [text, setText] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(file)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((t) => alive && setText(t))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [file]);

  return (
    <article className="hy-notes">
      <div className="hy-notes-margin" aria-hidden="true" />
      {text ? (
        <div className="hy-md">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
      ) : (
        <p className="hy-notes-wait" role="status">
          {failed ? 'These notes could not be loaded. ' : 'Pulling the notes from the file… '}
          <a href={file}>Read the report directly</a>.
        </p>
      )}
    </article>
  );
}
