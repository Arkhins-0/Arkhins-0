'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import content from '@/data/content.json';

/** Accent palette, declared in the content file. */
export const ACCENTS = content.theme.accents;
export type Accent = (typeof ACCENTS)[number]['id'];

const ACCENT_IDS = ACCENTS.map((a) => a.id);
const DEFAULT_ACCENT = ACCENT_IDS[0];

/** Swatch color for an accent id. */
export const swatchFor = (id: Accent) =>
  ACCENTS.find((a) => a.id === id)?.swatch ?? ACCENTS[0].swatch;

/** Boot stages: 'emblem' (curtain + emblem only), 'boot' (page lays out behind the curtain), 'live' (everything runs). */
export type BootStage = 'emblem' | 'boot' | 'live';
const STAGE_ORDER: BootStage[] = ['emblem', 'boot', 'live'];

type UIState = {
  accent: Accent;
  setAccent: (a: Accent) => void;
  cycleAccent: () => void;
  fx: boolean;
  toggleFx: () => void;
  ready: boolean;
  bootStage: BootStage;
  setBootStage: (s: BootStage) => void;
};

const Ctx = createContext<UIState | null>(null);

const { accent: KEY_ACCENT, effects: KEY_FX } = content.storage;

/** Provides accent, FX toggle, hydration readiness, and the forward-only boot stage. */
export function UIProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<Accent>(DEFAULT_ACCENT);
  const [fx, setFx] = useState(true);
  const [ready, setReady] = useState(false);
  const [bootStage, setBootStageState] = useState<BootStage>('emblem');

  const setBootStage = useCallback(
    (s: BootStage) =>
      setBootStageState((prev) =>
        STAGE_ORDER.indexOf(s) > STAGE_ORDER.indexOf(prev) ? s : prev
      ),
    []
  );

  useEffect(() => {
    document.documentElement.dataset.stage = bootStage;
  }, [bootStage]);

  useEffect(() => {
    const saved = localStorage.getItem(KEY_ACCENT);
    if (saved && ACCENT_IDS.includes(saved)) setAccentState(saved);

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
    if (meta) meta.setAttribute('content', swatchFor(accent));
  }, [accent, fx, ready]);

  const setAccent = useCallback((a: Accent) => setAccentState(a), []);
  const cycleAccent = useCallback(
    () =>
      setAccentState(
        (prev) => ACCENT_IDS[(ACCENT_IDS.indexOf(prev) + 1) % ACCENT_IDS.length]
      ),
    []
  );
  const toggleFx = useCallback(() => setFx((v) => !v), []);

  return (
    <Ctx.Provider
      value={{
        accent,
        setAccent,
        cycleAccent,
        fx,
        toggleFx,
        ready,
        bootStage,
        setBootStage,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

/** Access the UI context; throws outside <UIProvider>. */
export function useUI() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>');
  return ctx;
}
