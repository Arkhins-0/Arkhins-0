'use client';
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Block, ThemedImage } from '@/types/content';

type TabsBlock = Extract<Block, { type: 'tabs' }>;

/** "Select world": every panel is in the server HTML; only the active one is shown. */
export function WorldSelect({ tabs, uid }: { tabs: TabsBlock['tabs']; uid: string }) {
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
    <div className="sp-worlds">
      <div className="sp-worlds__tabs" role="tablist" aria-label="Select world">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${uid}-tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={active === i}
            aria-controls={`${uid}-panel-${t.id}`}
            tabIndex={active === i ? 0 : -1}
            className="sp-cart-tab"
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            <span className="sp-cart-tab__world">WORLD {i + 1}</span>
            <span className="sp-cart-tab__label">{t.label}</span>
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.id}
          id={`${uid}-panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${t.id}`}
          hidden={active !== i}
          className="sp-world"
        >
          {t.subtitle && <p className="sp-world__sub">&gt; {t.subtitle}</p>}
          <ol className="sp-track">
            {t.steps.map((s, j) => (
              <li key={j} className="sp-track__node">
                <span className="sp-track__num" aria-hidden="true">
                  {i + 1}-{j + 1}
                </span>
                <div className="sp-track__body">
                  <h4>{s.title}</h4>
                  <p>{s.description}</p>
                </div>
              </li>
            ))}
            <li className="sp-track__goal" aria-hidden="true">
              GOAL!
            </li>
          </ol>
          {t.details && t.details.length > 0 && (
            <div className="sp-loot">
              <h4 className="sp-loot__title">{t.detailsTitle ?? 'Loot'} · LOOT</h4>
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

/** Cartridge shelf: each screenshot is a game cart; activating one opens it in a pixel lightbox. */
export function CartridgeShelf({ items }: { items: ThemedImage[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(null);
    lastFocus.current?.focus();
  }, []);
  const step = useCallback(
    (d: number) => setOpen((o) => (o === null ? o : (o + d + items.length) % items.length)),
    [items.length]
  );

  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, step]);

  const cur = open === null ? null : items[open];

  return (
    <>
      <ul className="sp-shelf">
        {items.map((img, i) => (
          <li key={i}>
            <button
              type="button"
              className="sp-cart"
              onClick={(e) => {
                lastFocus.current = e.currentTarget;
                setOpen(i);
              }}
              aria-label={`Open screenshot: ${img.caption ?? img.alt}`}
            >
              <span className="sp-cart__notch" aria-hidden="true" />
              <span className="sp-cart__label">
                <img src={img.light} alt={img.alt} loading="lazy" />
              </span>
              <span className="sp-cart__name">{img.caption ?? img.alt}</span>
              <span className="sp-cart__no" aria-hidden="true">
                NO.{String(i + 1).padStart(2, '0')}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {cur && open !== null && (
        <div className="sp-lb" role="dialog" aria-modal="true" aria-label={cur.caption ?? cur.alt} onClick={close}>
          <figure className="sp-lb__box" onClick={(e) => e.stopPropagation()}>
            <div className="sp-lb__bar">
              <span>
                {cur.caption ?? cur.alt} · {open + 1}/{items.length}
              </span>
              <button ref={closeRef} type="button" className="sp-lb__btn" onClick={close} aria-label="Close">
                X
              </button>
            </div>
            <div className="sp-lb__screen">
              <img src={cur.light} alt={cur.alt} />
            </div>
            {items.length > 1 && (
              <div className="sp-lb__nav">
                <button type="button" className="sp-lb__btn" onClick={() => step(-1)} aria-label="Previous screenshot">
                  ◀ PREV
                </button>
                <button type="button" className="sp-lb__btn" onClick={() => step(1)} aria-label="Next screenshot">
                  NEXT ▶
                </button>
              </div>
            )}
          </figure>
        </div>
      )}
    </>
  );
}

/** Fallback for markdown blocks: fetched on the client, rendered inside a dialogue box. */
export function Scroll({ file }: { file: string }) {
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
  if (failed)
    return (
      <p className="sp-dim">
        SCROLL LOST. <a href={file}>Read the file directly</a>.
      </p>
    );
  if (text === null) return <p className="sp-dim sp-blink">NOW LOADING...</p>;
  return (
    <div className="sp-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}
