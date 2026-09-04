'use client';

import { useEffect, useRef, useState } from 'react';
import { useUI } from '@/context/UIContext';

/** Two-part custom cursor: a 1:1 dot plus a lagging neon ring that swells over interactive elements; mouse-only. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const { fx, ready } = useUI();

  useEffect(() => {
    if (!ready) return;
    const fine =
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(fine && fx);
  }, [fx, ready]);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let tx = -100;
    let ty = -100;
    let rx = -100;
    let ry = -100;
    let scale = 1;
    let targetScale = 1;

    const INTERACTIVE =
      'a, button, input, textarea, select, summary, [role="button"], [data-cursor="grow"]';

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const el = e.target as Element | null;
      targetScale = el?.closest?.(INTERACTIVE) ? 2.15 : 1;
    };

    const tick = () => {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      scale += (targetScale - scale) * 0.16;
      if (dot.current)
        dot.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
      if (ring.current)
        ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    document.documentElement.classList.add('cursor-hidden');

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('cursor-hidden');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9998]">
      <div
        ref={ring}
        className="absolute left-0 top-0 h-8 w-8 rounded-full border border-accent/70"
        style={{
          boxShadow:
            '0 0 18px rgb(var(--accent-rgb) / 0.5), inset 0 0 12px rgb(var(--accent-rgb) / 0.22)',
        }}
      />
      <div
        ref={dot}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-accent"
        style={{ boxShadow: '0 0 12px rgb(var(--accent-rgb) / 0.9)' }}
      />
    </div>
  );
}
