'use client';
/* eslint-disable @next/next/no-img-element */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ThemedImage } from '@/types/content';

type Ctx = { open: (items: ThemedImage[], index: number) => void };
const LightboxCtx = createContext<Ctx>({ open: () => {} });

/** A print-shop light table: one plate at a time, full size, on a dark loupe board. */
export function PressLightbox({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ items: ThemedImage[]; i: number } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  const open = useCallback((items: ThemedImage[], i: number) => {
    returnTo.current = document.activeElement as HTMLElement | null;
    setState({ items, i });
  }, []);
  const close = useCallback(() => {
    setState(null);
    returnTo.current?.focus?.();
  }, []);
  const step = useCallback(
    (d: number) => setState((s) => (s ? { ...s, i: (s.i + d + s.items.length) % s.items.length } : s)),
    []
  );

  useEffect(() => {
    if (!state) return;
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
  }, [state, close, step]);

  const cur = state ? state.items[state.i] : null;

  return (
    <LightboxCtx.Provider value={{ open }}>
      {children}
      {state && cur && (
        <div className="ctr-lb" role="dialog" aria-modal="true" aria-label={cur.caption ?? cur.alt} onClick={close}>
          <figure className="ctr-lb__fig" onClick={(e) => e.stopPropagation()}>
            <div className="ctr-lb__bar">
              <span className="ctr-lb__cap">
                {cur.caption ?? cur.alt}
                <span aria-hidden="true"> · plate {state.i + 1}/{state.items.length}</span>
              </span>
              <button ref={closeRef} type="button" className="ctr-lb__btn" onClick={close} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="ctr-lb__img">
              <img src={cur.light} alt={cur.alt} />
            </div>
            {state.items.length > 1 && (
              <div className="ctr-lb__nav">
                <button type="button" className="ctr-lb__btn" onClick={() => step(-1)} aria-label="Previous image">
                  ←
                </button>
                <button type="button" className="ctr-lb__btn" onClick={() => step(1)} aria-label="Next image">
                  →
                </button>
              </div>
            )}
          </figure>
        </div>
      )}
    </LightboxCtx.Provider>
  );
}

/** Wraps a server-rendered plate so a click opens it on the light table. */
export function Zoom({
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
  const { open } = useContext(LightboxCtx);
  const img = items[index];
  return (
    <button
      type="button"
      className={className ? `ctr-zoom ${className}` : 'ctr-zoom'}
      onClick={() => open(items, index)}
      aria-label={`Enlarge: ${img?.caption ?? img?.alt ?? 'image'}`}
    >
      {children}
    </button>
  );
}
