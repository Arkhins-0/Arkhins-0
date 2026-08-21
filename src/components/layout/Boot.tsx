'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const PREFETCH = [
  '/images/profile.jpg',
  '/images/hero/portrait.png',
  '/projects/hygieia/thumbnail.png',
  '/images/projects/BidNest.png',
  '/images/projects/ctr.png',
  '/images/projects/stock-prediction.png',
];

/* ARKHINS is an exact anagram of KRISHNA. The boot screen proves it: the same
   seven letter elements are kept alive and physically flown into new slots,
   never cross-faded. ORDER[i] = index of the source letter that lands in
   target slot i.
       A R K H I N S            K R I S H N A
       0 1 2 3 4 5 6     ->     2 1 4 6 3 5 0                                 */
const SOURCE = 'ARKHINS';
const ORDER = [2, 1, 4, 6, 3, 5, 0];
const LETTERS = SOURCE.split('').map((ch, i) => ({ id: `l${i}`, ch }));

const NOISE = '#@%&$*/\\<>[]{}=+~ARKHINSKRISHNA';

/* Four beats: hold the handle, tear it apart, fly the letters, lock the name. */
const HOLD = 780;
const GLITCH = 460;
const MOVE = 860;
const LOCK = 640;
const TOTAL = HOLD + GLITCH + MOVE + LOCK;

type Phase = 'hold' | 'glitch' | 'move' | 'lock';

const TYPE =
  'font-display text-[clamp(2.5rem,13vw,9rem)] font-extrabold leading-none tracking-tightest';

export function Boot() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<Phase>('hold');
  const [noise, setNoise] = useState<string[] | null>(null);
  const [jitter, setJitter] = useState<number[]>(() => LETTERS.map(() => 0));
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    // Replay on every refresh while developing; once per tab for real visitors.
    const seen =
      process.env.NODE_ENV === 'production' &&
      sessionStorage.getItem('gkv:booted') === '1';

    if (seen) {
      setVisible(false);
      setLocked(false);
      return;
    }

    PREFETCH.forEach((url) => {
      const img = new Image();
      img.src = url;
    });

    const timers = [
      setTimeout(() => setPhase('glitch'), HOLD),
      setTimeout(() => setPhase('move'), HOLD + GLITCH),
      setTimeout(() => setPhase('lock'), HOLD + GLITCH + MOVE),
      setTimeout(() => {
        sessionStorage.setItem('gkv:booted', '1');
        setVisible(false);
      }, TOTAL),
      setTimeout(() => setLocked(false), TOTAL + 950),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  /* Glyph churn + vertical jitter, but ONLY during the glitch beat. Once the
     letters start travelling they show their real characters, otherwise the
     anagram is invisible under the noise. */
  useEffect(() => {
    if (phase !== 'glitch') {
      setNoise(null);
      setJitter(LETTERS.map(() => 0));
      return;
    }
    const id = setInterval(() => {
      setNoise(
        LETTERS.map(() =>
          Math.random() < 0.72
            ? NOISE[Math.floor(Math.random() * NOISE.length)]
            : ''
        )
      );
      setJitter(LETTERS.map(() => (Math.random() - 0.5) * 26));
    }, 52);
    return () => clearInterval(id);
  }, [phase]);

  const rearranged = phase === 'hold' || phase === 'glitch';
  const ordered = useMemo(
    () => (rearranged ? LETTERS : ORDER.map((i) => LETTERS[i])),
    [rearranged]
  );

  const settled = phase === 'lock';
  const glitching = phase === 'glitch';

  const row = (variant: 'main' | 'ghostA' | 'ghostB') => (
    <div
      className="flex items-baseline"
      aria-hidden={variant !== 'main' || undefined}
    >
      {ordered.map((letter, i) => (
        <motion.span
          key={letter.id}
          layout={variant === 'main'}
          className={`inline-block ${TYPE}`}
          animate={{
            y: glitching ? jitter[i] : 0,
            opacity: glitching && noise?.[i] === '' ? 0.25 : 1,
          }}
          transition={{
            layout: {
              type: 'spring',
              stiffness: 165,
              damping: 17,
              delay: phase === 'move' ? i * 0.04 : 0,
            },
            y: { duration: 0.05 },
            opacity: { duration: 0.05 },
          }}
          style={{
            color:
              variant === 'main'
                ? settled
                  ? 'var(--accent)'
                  : 'rgba(233,237,251,0.95)'
                : undefined,
            textShadow:
              variant === 'main' && settled
                ? '0 0 28px rgb(var(--accent-rgb) / 0.75), 0 0 78px rgb(var(--accent-rgb) / 0.4)'
                : undefined,
            transition: 'color 320ms ease, text-shadow 320ms ease',
          }}
        >
          {variant === 'main' && noise?.[i] ? noise[i] : letter.ch}
        </motion.span>
      ))}
      <span
        className={TYPE}
        style={{
          color: variant === 'main' ? 'var(--accent)' : undefined,
          opacity: settled ? 1 : 0.28,
          transition: 'opacity 320ms ease',
        }}
      >
        .
      </span>
    </div>
  );

  return (
    <>
      {locked && <style>{`html,body{overflow:hidden!important}`}</style>}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="boot"
            className="fixed inset-0 z-[9999] overflow-hidden"
            exit={{ transition: { duration: 0 } }}
          >
            {/* curtain: two halves that tear apart along a slanted seam */}
            {[0, 1].map((half) => (
              <motion.div
                key={half}
                aria-hidden="true"
                className="absolute inset-0 bg-[#04050a]"
                style={{
                  clipPath:
                    half === 0
                      ? 'polygon(0 0, 100% 0, 100% 42%, 0 58%)'
                      : 'polygon(0 58%, 100% 42%, 100% 100%, 0 100%)',
                }}
                exit={{
                  y: half === 0 ? '-105%' : '105%',
                  transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
                }}
              />
            ))}

            {/* glow that swells the moment the name resolves */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              animate={{ opacity: settled ? 1 : 0.3 }}
              transition={{ duration: 0.5 }}
              style={{
                background:
                  'radial-gradient(50vw 36vh at 50% 46%, rgb(var(--accent-rgb) / 0.24), transparent 70%)',
              }}
            />

            {/* scanline wash, hardest during the glitch */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 mix-blend-overlay"
              animate={{ opacity: glitching ? 0.55 : 0.14 }}
              transition={{ duration: 0.2 }}
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, rgba(255,255,255,0.55) 0 1px, transparent 1px 4px)',
              }}
            />

            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center px-6"
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
            >
              {/* wordmark stack: two chromatic ghosts behind the real letters */}
              <div
                className={`relative ${glitching ? '' : 'animate-flicker'}`}
                role="img"
                aria-label="Arkhins, an anagram of Krishna"
              >
                <motion.div
                  className="absolute inset-0 mix-blend-screen"
                  animate={{
                    x: glitching ? -7 : 0,
                    opacity: glitching ? 0.85 : 0,
                  }}
                  transition={{ duration: 0.08 }}
                  style={{ color: 'var(--accent)' }}
                >
                  {row('ghostA')}
                </motion.div>
                <motion.div
                  className="absolute inset-0 mix-blend-screen"
                  animate={{
                    x: glitching ? 7 : 0,
                    opacity: glitching ? 0.85 : 0,
                  }}
                  transition={{ duration: 0.08 }}
                  style={{ color: 'var(--accent-2)' }}
                >
                  {row('ghostB')}
                </motion.div>
                <div className="relative">{row('main')}</div>
              </div>

              {/* readout */}
              <div className="mt-8 flex w-[min(80vw,30rem)] items-center gap-4">
                <span className="hazard h-3 w-8 opacity-70" />
                <span className="h-px flex-1 bg-white/12">
                  <motion.span
                    className="neon-line block h-full origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: TOTAL / 1000, ease: 'easeInOut' }}
                  />
                </span>
                <span className="hud text-accent">
                  {settled ? 'OK' : '···'}
                </span>
              </div>

              {/* the reveal, spelled out */}
              <div className="relative mt-6 h-4 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={settled ? 'name' : 'handle'}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -15, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="eyebrow whitespace-nowrap"
                  >
                    {settled ? 'Krishna Vijay G' : 'arkhins.com'}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
