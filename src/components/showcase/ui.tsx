'use client';
/* eslint-disable @next/next/no-img-element */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle,
  Cpu,
  Droplets,
  GraduationCap,
  Heart,
  Link2,
  Lock,
  Mail,
  MessageCircle,
  Monitor,
  Palette,
  Ribbon,
  Scan,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  BookOpen,
  Database,
  EyeOff,
  FileText,
  Fingerprint,
  Globe,
  KeyRound,
  Layers,
  RefreshCw,
  Smartphone,
  Timer,
  Upload,
  Wallet,
  WifiOff,
  Flag,
  Gauge,
  Image as ImageIcon,
  Map,
  Newspaper,
  Radio,
  Trophy,
  Video,
  CalendarDays,
  FileUp,
  ListChecks,
  Medal,
  ScrollText,
  Shield,
  Ticket,
  Tv,
  Vote,
  ClipboardList,
  GitBranch,
  Package,
  Scale,
  TestTube2,
  Warehouse,
  Wrench,
} from 'lucide-react';
import content from '@/data/content.json';
import { cn, fill } from '@/lib/utils';
import type { ScreenVariant, ThemedImage } from '@/types/content';

const COPY = content.projectPage;

// ------------------------------------------------------------------ icons

const ICONS: Record<string, React.ElementType> = {
  CheckCircle, Cpu, Droplets, GraduationCap, Heart, Link2, Lock, Mail, MessageCircle,
  Monitor, Palette, Ribbon, Scan, Server, ShieldCheck, Sparkles, Users,
  Bell, BookOpen, Database, EyeOff, FileText, Fingerprint, Globe, KeyRound, Layers, RefreshCw, Smartphone, Timer, Upload, Wallet, WifiOff,
  Flag, Gauge, Image: ImageIcon, Map, Newspaper, Radio, Trophy, Video,
  CalendarDays, FileUp, ListChecks, Medal, ScrollText, Shield, Ticket, Tv, Vote,
  ClipboardList, GitBranch, Package, Scale, TestTube2, Warehouse, Wrench,
};

export function Icon({ name, size = 17, className }: { name?: string; size?: number; className?: string }) {
  const C = (name && ICONS[name]) || Sparkles;
  return <C size={size} className={className} />;
}

// ---------------------------------------------------------------- screens

type Screens = { variant: ScreenVariant; setVariant: (v: ScreenVariant) => void; hasDark: boolean };
const ScreensCtx = createContext<Screens>({ variant: 'dark', setVariant: () => {}, hasDark: false });

export function ScreensProvider({
  initial,
  hasDark,
  children,
}: {
  initial: ScreenVariant;
  hasDark: boolean;
  children: React.ReactNode;
}) {
  const [variant, setVariant] = useState<ScreenVariant>(hasDark ? initial : 'light');
  return <ScreensCtx.Provider value={{ variant, setVariant, hasDark }}>{children}</ScreensCtx.Provider>;
}

export const useScreens = () => useContext(ScreensCtx);

/** Floating pill: switches every screenshot on the page between its light and dark capture. */
export function ScreensSwitch() {
  const { variant, setVariant, hasDark } = useScreens();
  if (!hasDark) return null;
  return (
    <div className="sc-screens glass" role="group" aria-label={COPY.screens.label}>
      <span className="hud text-ink-faint">{COPY.screens.label}</span>
      {(['light', 'dark'] as ScreenVariant[]).map((v) => (
        <button key={v} type="button" aria-pressed={variant === v} onClick={() => setVariant(v)}>
          {COPY.screens[v]}
        </button>
      ))}
    </div>
  );
}

/** Source for the current variant, falling back to light. */
export function pick(img: ThemedImage, variant: ScreenVariant) {
  return variant === 'dark' && img.dark ? img.dark : img.light;
}

/** Renders both variants stacked and crossfades to the active one (no reload on switch). */
export function ThemedImg({
  image,
  className,
  imgClassName,
  loading = 'lazy',
  onLoad,
}: {
  image: ThemedImage;
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: (el: HTMLImageElement) => void;
}) {
  const { variant } = useScreens();
  const active = pick(image, variant);
  const sources = image.dark && image.dark !== image.light ? [image.light, image.dark] : [image.light];
  return (
    <span className={cn('sc-img', className)}>
      {sources.map((src) => (
        <img
          key={src}
          src={src}
          alt={image.alt}
          loading={loading}
          data-hidden={src !== active}
          className={imgClassName}
          onLoad={(e) => src === active && onLoad?.(e.currentTarget)}
        />
      ))}
    </span>
  );
}

// ----------------------------------------------------------------- frame

/** Device-style frame with an optional browser bar; `tall` crops and scrolls on hover. */
export function Frame({
  image,
  url,
  tall,
  className,
  tilt,
}: {
  image: ThemedImage;
  url?: string;
  tall?: boolean;
  className?: string;
  tilt?: 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const base = tilt === 'left' ? 'rotateY(14deg) rotateX(4deg) rotateZ(-1deg)' : tilt === 'right' ? 'rotateY(-14deg) rotateX(4deg) rotateZ(1deg)' : '';

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1400px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.01)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = base ? `perspective(1400px) ${base}` : '';
  };

  return (
    <div
      ref={ref}
      className={cn('sc-frame', className)}
      data-tall={tall ? 'true' : undefined}
      style={base ? { transform: `perspective(1400px) ${base}` } : undefined}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {url && (
        <div className="sc-browser" aria-hidden="true">
          <i /><i /><i />
          <span>{url}</span>
        </div>
      )}
      <ThemedImg image={image} />
    </div>
  );
}

// --------------------------------------------------------------- compare

export function Compare({ image }: { image: ThemedImage }) {
  const [pos, setPos] = useState(50);
  const [idle, setIdle] = useState(true);

  useEffect(() => {
    if (!idle || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let t = 0;
    let raf = 0;
    const sweep = () => {
      t += 0.008;
      setPos(50 + Math.sin(t) * 22);
      raf = requestAnimationFrame(sweep);
    };
    raf = requestAnimationFrame(sweep);
    return () => cancelAnimationFrame(raf);
  }, [idle]);

  return (
    <div className="sc-compare sc-card" style={{ ['--pos' as string]: `${pos}%` }}>
      <img src={image.light} alt={`${image.alt}, light theme`} data-side="a" />
      <img src={image.dark ?? image.light} alt={`${image.alt}, dark theme`} data-side="b" />
      <div className="sc-compare-handle" aria-hidden="true"><span>⟷</span></div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        aria-label={COPY.compare.aria}
        onPointerDown={() => setIdle(false)}
        onFocus={() => setIdle(false)}
        onChange={(e) => { setIdle(false); setPos(Number(e.target.value)); }}
      />
      <span className="sc-tag" style={{ left: 14, background: '#fff', color: '#111' }}>{COPY.compare.light}</span>
      <span className="sc-tag" style={{ right: 14, background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }}>{COPY.compare.dark}</span>
    </div>
  );
}

// ---------------------------------------------------------------- phones

export function Phones({ items }: { items: ThemedImage[] }) {
  return (
    <div className="sc-phones">
      {items.slice(0, 5).map((img, i) => <PhoneFrame key={i} image={img} />)}
    </div>
  );
}

/** One phone bezel; the screenshot scrolls inside it on hover. */
export function PhoneFrame({ image, className }: { image: ThemedImage; className?: string }) {
  return (
    <figure className={cn('sc-phone', className)}>
      <div className="sc-phone-screen">
        <ThemedImg
          image={image}
          onLoad={(el) => {
            const screen = el.closest('.sc-phone-screen') as HTMLElement | null;
            if (screen) el.style.setProperty('--d', `${Math.max(0, el.offsetHeight - screen.clientHeight)}px`);
          }}
        />
      </div>
    </figure>
  );
}

// -------------------------------------------------------------- lightbox

type Lightbox = { open: (items: ThemedImage[], index: number) => void };
const LightboxCtx = createContext<Lightbox>({ open: () => {} });
export const useLightbox = () => useContext(LightboxCtx);

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const { variant } = useScreens();
  const [state, setState] = useState<{ items: ThemedImage[]; i: number } | null>(null);

  const open = useCallback((items: ThemedImage[], i: number) => setState({ items, i }), []);
  const close = useCallback(() => setState(null), []);
  const step = useCallback(
    (d: number) => setState((s) => (s ? { ...s, i: (s.i + d + s.items.length) % s.items.length } : s)),
    []
  );

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [state, close, step]);

  const current = state ? state.items[state.i] : null;

  return (
    <LightboxCtx.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {state && current && (
          <motion.div
            key="lb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/88 p-4 backdrop-blur-md md:p-10"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={current.alt}
          >
            <motion.figure
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between gap-4">
                <span className="hud text-accent">
                  {current.caption ?? current.alt}
                  <span className="text-ink-faint"> · {state.i + 1} / {state.items.length}</span>
                </span>
                <button onClick={close} aria-label={COPY.lightbox.close} className="grid h-9 w-9 place-items-center border border-white/15 text-ink transition-colors hover:border-accent hover:text-accent">
                  <X size={16} />
                </button>
              </div>
              <div className="relative max-h-[80vh] overflow-auto border border-white/12 bg-black/50">
                <img src={pick(current, variant)} alt={current.alt} className="mx-auto max-h-[80vh] w-auto object-contain" />
              </div>
              {state.items.length > 1 && (
                <>
                  <button onClick={() => step(-1)} aria-label={COPY.lightbox.prev} className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/60 text-ink hover:border-accent hover:text-accent"><ChevronLeft size={18} /></button>
                  <button onClick={() => step(1)} aria-label={COPY.lightbox.next} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/60 text-ink hover:border-accent hover:text-accent"><ChevronRight size={18} /></button>
                </>
              )}
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </LightboxCtx.Provider>
  );
}

export function Gallery({ items }: { items: ThemedImage[] }) {
  const { open } = useLightbox();
  return (
    <div className="sc-gallery">
      {items.map((img, i) => (
        <button key={i} type="button" className="sc-card" onClick={() => open(items, i)} aria-label={fill(COPY.lightbox.open, { title: img.caption ?? img.alt })}>
          <ThemedImg image={img} />
          {(img.caption ?? img.alt) && <figcaption>{img.caption ?? img.alt}</figcaption>}
        </button>
      ))}
    </div>
  );
}
