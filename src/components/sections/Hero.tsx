'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowUpRight, MapPin, MoveDown } from 'lucide-react';
import { FaGithub, FaInstagram, FaLinkedin, FaTelegram } from 'react-icons/fa6';
import { FaDiscord } from 'react-icons/fa';
import { SiGoogle } from 'react-icons/si';
import portfolioData from '@/data/portfolio.json';
import { NeonButton, Ticker } from '@/components/fx';
import { useUI } from '@/context/UIContext';
import { cn } from '@/lib/utils';

const { basics, socialLinks } = portfolioData;
const [FIRST, ...REST] = basics.name.split(' ');
const SURNAME = REST.join(' ');

const SOCIAL_ICON: Record<string, React.ReactNode> = {
  github: <FaGithub />,
  linkedin: <FaLinkedin />,
  instagram: <FaInstagram />,
  google: <SiGoogle />,
  discord: <FaDiscord />,
  telegram: <FaTelegram />,
};

const MARQUEE = [
  basics.availability,
  `${basics.location.city} · ${basics.location.country}`,
  'UI/UX Design',
  'AI / ML',
  'Full-Stack',
  'IoT Automation',
  'Generative AI',
];

/* -------------------------------------------------------------- portrait */

/**
 * The transparent PNG gets three passes: a blurred duotone echo offset behind
 * it (masked by the same file), the photo itself with an accent rim glow, and
 * a scan sweep clipped to the silhouette.
 */
function Portrait({ src, tilt }: { src: string; tilt: { rx: any; ry: any } }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // If the request already failed before hydration, onError will never fire.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  const maskProps = {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'bottom center',
    maskPosition: 'bottom center',
  } as React.CSSProperties;

  if (failed) {
    return (
      <div className="relative mx-auto flex aspect-[3/4] w-full max-w-[26rem] items-end justify-center">
        <div
          className="notch-diag absolute inset-0 border border-dashed border-accent/35"
          style={{ ['--notch' as string]: '28px' }}
        />
        <div className="relative z-10 mb-10 px-6 text-center">
          <p className="hud text-accent">Portrait slot</p>
          <p className="mt-2 font-mono text-[0.7rem] leading-relaxed text-ink-faint">
            drop a cut-out PNG at
            <br />
            <span className="text-ink">public{src}</span>
          </p>
        </div>
        <div
          className="absolute inset-x-8 bottom-6 h-24 rounded-[50%] blur-2xl"
          style={{
            background:
              'radial-gradient(ellipse at center, rgb(var(--accent-rgb) / 0.4), transparent 70%)',
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      style={{ rotateX: tilt.rx, rotateY: tilt.ry, transformPerspective: 1200 }}
      className="relative mx-auto w-full max-w-[30rem]"
    >
      {/* pedestal glow under the subject */}
      <div
        aria-hidden="true"
        className="absolute inset-x-4 bottom-2 h-28 rounded-[50%] opacity-[calc(0.9*var(--fx))] blur-[38px]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgb(var(--accent-rgb) / 0.55), transparent 72%)',
        }}
      />

      {/* duotone echo, offset and blurred */}
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-4 translate-y-1 opacity-[calc(0.75*var(--fx))] blur-[3px]"
        style={{
          ...maskProps,
          background:
            'linear-gradient(170deg, rgb(var(--accent-rgb) / 0.95), rgb(var(--accent-2-rgb) / 0.55) 65%, transparent)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -translate-x-3 opacity-[calc(0.5*var(--fx))] blur-[5px]"
        style={{
          ...maskProps,
          background: 'rgb(var(--accent-2-rgb) / 0.8)',
        }}
      />

      {/* the photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={`${basics.name}, ${basics.headline}`}
        onError={() => setFailed(true)}
        className="relative z-10 w-full select-none object-contain"
        style={{
          filter:
            'drop-shadow(0 0 34px rgb(var(--accent-rgb) / calc(0.45 * var(--fx)))) drop-shadow(0 22px 44px rgba(0,0,0,0.65))',
        }}
        draggable={false}
      />

      {/* scan sweep, clipped to the silhouette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-20 overflow-hidden opacity-[calc(1*var(--fx))]"
        style={maskProps}
      >
        <div
          className="h-1/4 w-full animate-sweep-y"
          style={{
            background:
              'linear-gradient(to bottom, transparent, rgb(var(--accent-rgb) / 0.55), transparent)',
            filter: 'blur(2px)',
          }}
        />
      </div>

      {/* fine horizontal scanlines over the subject */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-20 opacity-[calc(0.4*var(--fx))] mix-blend-overlay"
        style={{
          ...maskProps,
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(255,255,255,0.5) 0 1px, transparent 1px 4px)',
        }}
      />
    </motion.div>
  );
}

/* ---------------------------------------------------------------- roller */

function RoleRoller({ roles }: { roles: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % roles.length), 2600);
    return () => clearInterval(t);
  }, [roles.length]);

  // A hidden sizer holds the width of the longest role so the brackets never
  // jump, and the slots overlap instead of leaving a gap between them.
  const widest = roles.reduce((a, b) => (b.length > a.length ? b : a), '');

  return (
    <span className="relative inline-flex h-[1.5em] items-center overflow-hidden align-bottom">
      <span aria-hidden="true" className="invisible whitespace-nowrap">
        {widest}
      </span>
      <AnimatePresence initial={false}>
        <motion.span
          key={roles[i]}
          initial={{ y: '105%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-105%', opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center whitespace-nowrap text-accent"
        >
          {roles[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ------------------------------------------------------------------ hero */

export function Hero() {
  const { fx } = useUI();

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 90, damping: 20 });
  const sy = useSpring(py, { stiffness: 90, damping: 20 });

  const rx = useTransform(sy, [-0.5, 0.5], [7, -7]);
  const ry = useTransform(sx, [-0.5, 0.5], [-9, 9]);
  const haloX = useTransform(sx, [-0.5, 0.5], [26, -26]);
  const haloY = useTransform(sy, [-0.5, 0.5], [18, -18]);

  useEffect(() => {
    if (!fx) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [fx, px, py]);

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pb-0 pt-28 md:pt-36"
    >
      {/* ---------------------------------------------- local visuals */}

      {/* perspective grid floor */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42vh] opacity-[calc(0.8*var(--fx))]"
        style={{ perspective: '240px', perspectiveOrigin: '50% 0%' }}
      >
        <div
          className="absolute inset-0 origin-bottom animate-grid-slide"
          style={{
            transform: 'rotateX(74deg)',
            backgroundImage:
              'linear-gradient(rgb(var(--accent-rgb) / 0.38) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--accent-rgb) / 0.22) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'linear-gradient(to top, #000 5%, transparent 78%)',
            WebkitMaskImage:
              'linear-gradient(to top, #000 5%, transparent 78%)',
          }}
        />
      </div>

      {/* rotating halo behind the subject */}
      <motion.div
        aria-hidden="true"
        style={{ x: haloX, y: haloY }}
        className="pointer-events-none absolute right-[6%] top-[16%] hidden h-[34rem] w-[34rem] lg:block xl:right-[10%]"
      >
        <div
          className="absolute inset-0 animate-orbit-slow rounded-full opacity-[calc(0.4*var(--fx))] blur-[2px]"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgb(var(--accent-rgb) / 0.55) 40deg, transparent 120deg, rgb(var(--accent-2-rgb) / 0.4) 220deg, transparent 300deg)',
            maskImage:
              'radial-gradient(circle, transparent 61%, #000 62%, #000 66%, transparent 67%)',
            WebkitMaskImage:
              'radial-gradient(circle, transparent 61%, #000 62%, #000 66%, transparent 67%)',
          }}
        />
        <div className="absolute inset-[9%] rounded-full border border-white/8" />
        <div
          className="absolute inset-[16%] animate-orbit-rev rounded-full border border-dashed border-accent/25"
        />
      </motion.div>

      {/* ---------------------------------------------- content */}
      <div className="shell relative z-10 flex-1">
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
          {/* --- type stack --- */}
          <div className="relative z-10 order-1 lg:order-1">
            {/* availability chip */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="inline-flex items-center gap-2.5 border border-accent/35 bg-accent/8 px-3 py-1.5 notch-br"
              style={{ ['--notch' as string]: '9px' }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent animate-pulse-ring" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <span className="hud text-accent">{basics.availability}</span>
            </motion.div>

            {/* name */}
            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 font-display text-[clamp(2.9rem,9.5vw,7.2rem)] font-extrabold leading-[0.86] tracking-tightest"
            >
              <span className="block">{FIRST.toUpperCase()}</span>
              <span className="stroke-text block whitespace-nowrap animate-flicker">
                {SURNAME.toUpperCase()}
              </span>
            </motion.h1>

            {/* role roller */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-6 flex items-center gap-3 font-mono text-sm tracking-tight sm:text-base"
            >
              <span className="text-ink-faint">{'{'}</span>
              <RoleRoller roles={basics.roles} />
              <span className="text-ink-faint">{'}'}</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.6 }}
              className="mt-5 max-w-md text-[0.98rem] leading-relaxed text-ink-dim"
            >
              {basics.tagline}. Building things that sit at the seam of
              interface, intelligence and hardware — from Chennai, for anywhere.
            </motion.p>

            {/* actions */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.56, duration: 0.6 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <NeonButton href="/#work" icon={<ArrowUpRight size={15} />}>
                See the work
              </NeonButton>
              <NeonButton
                href={basics.resumeUrl}
                external
                variant="ghost"
                icon={<ArrowUpRight size={15} />}
              >
                Résumé
              </NeonButton>
            </motion.div>

            {/* meta strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/8 pt-5"
            >
              <span className="hud flex items-center gap-2 text-ink-faint">
                <MapPin size={12} className="text-accent" />
                {basics.location.city}, {basics.location.state}
              </span>
              <span className="hud text-ink-faint">
                B.Tech CSE<span className="text-accent"> · </span>AI
              </span>
              <div className="flex items-center gap-1">
                {socialLinks.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="grid h-8 w-8 place-items-center text-ink-faint transition-all duration-300 hover:-translate-y-0.5 hover:text-accent"
                  >
                    {SOCIAL_ICON[s.icon] ?? null}
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* --- portrait --- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-0 order-2 mx-auto w-[88%] max-w-sm lg:pointer-events-auto lg:relative lg:inset-auto lg:mx-0 lg:w-auto lg:max-w-none"
          >
            <div className="portrait-ghost">
              <Portrait src={basics.portrait} tilt={{ rx, ry }} />
            </div>

            {/* floating HUD chips */}
            <HudChip
              className="right-0 top-[6%] hidden sm:flex"
              delay={0.9}
              k="focus"
              v="Design × AI"
            />
            <HudChip
              className="-right-2 top-[46%] hidden sm:flex md:-right-8"
              delay={1.05}
              k="stack"
              v="Next · Python"
            />
            <HudChip
              className="bottom-[10%] -left-2 hidden md:flex md:-left-6"
              delay={1.2}
              k="status"
              v="Final year"
            />
          </motion.div>
        </div>
      </div>

      {/* ---------------------------------------------- bottom rail */}
      <div className="relative z-10 mt-12">
        <div className="border-y border-white/8 bg-black/25 py-3 backdrop-blur-sm">
          <Ticker duration={44} fade>
            {MARQUEE.map((item, i) => (
              <span key={i} className="flex items-center">
                <span className="hud px-6 text-ink-dim">{item}</span>
                <span className="text-accent">✦</span>
              </span>
            ))}
          </Ticker>
        </div>

        <a
          href="#about"
          className="group mx-auto flex w-fit items-center gap-2 py-5 text-ink-faint transition-colors hover:text-accent"
        >
          <span className="hud">Scroll</span>
          <MoveDown
            size={13}
            className="transition-transform duration-500 group-hover:translate-y-1"
          />
        </a>
      </div>
    </section>
  );
}

function HudChip({
  k,
  v,
  className,
  delay,
}: {
  k: string;
  v: string;
  className?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className={cn(
        'glass notch-br absolute z-20 items-center gap-2 px-3 py-2',
        className
      )}
      style={{ ['--notch' as string]: '8px' }}
    >
      <span className="hud text-ink-faint">{k}</span>
      <span className="h-3 w-px bg-accent/50" />
      <span className="hud text-ink">{v}</span>
    </motion.div>
  );
}
