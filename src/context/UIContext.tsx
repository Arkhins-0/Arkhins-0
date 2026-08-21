'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

export const ACCENTS = ['rose', 'cyan', 'lime', 'violet'] as const;
export type Accent = (typeof ACCENTS)[number];

export const ACCENT_SWATCH: Record<Accent, string> = {
  rose: '#ff2d6f',
  cyan: '#00f0ff',
  lime: '#c6ff3d',
  violet: '#a855f7',
};

type UIState = {
  accent: Accent;
  setAccent: (a: Accent) => void;
  cycleAccent: () => void;
  fx: boolean;
  toggleFx: () => void;
  /** true once the client has hydrated — gate anything non-deterministic on it */
  ready: boolean;
};

const Ctx = createContext<UIState | null>(null);

const KEY_ACCENT = 'gkv:accent';
const KEY_FX = 'gkv:fx';

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<Accent>('rose');
  const [fx, setFx] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedAccent = localStorage.getItem(KEY_ACCENT) as Accent | null;
    if (savedAccent && ACCENTS.includes(savedAccent)) setAccentState(savedAccent);

    const savedFx = localStorage.getItem(KEY_FX);
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    setFx(savedFx === null ? !prefersReduced : savedFx === 'on');

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.dataset.accent = accent;
    root.dataset.fx = fx ? 'on' : 'off';
    localStorage.setItem(KEY_ACCENT, accent);
    localStorage.setItem(KEY_FX, fx ? 'on' : 'off');

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', ACCENT_SWATCH[accent]);
  }, [accent, fx, ready]);

  const setAccent = useCallback((a: Accent) => setAccentState(a), []);
  const cycleAccent = useCallback(
    () =>
      setAccentState((prev) => ACCENTS[(ACCENTS.indexOf(prev) + 1) % ACCENTS.length]),
    []
  );
  const toggleFx = useCallback(() => setFx((v) => !v), []);

  return (
    <Ctx.Provider
      value={{ accent, setAccent, cycleAccent, fx, toggleFx, ready }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useUI() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>');
  return ctx;
}
