'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import NextImage from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Anagram, type AnagramPhase } from '@/components/fx';
import { useUI } from '@/context/UIContext';
import { cn } from '@/lib/utils';
import content from '@/data/content.json';
import portfolioData from '@/data/portfolio.json';

/** Small above-the-fold art, warmed while the curtain is up. */
const PREFETCH = [
  portfolioData.basics.profilePicture,
  portfolioData.basics.portrait,
  ...portfolioData.projects
    .filter((p) => !p.id.includes('placeholder'))
    .map((p) => p.thumbnail),
];

const INTRO = content.brand.boot;
const WORDS = INTRO.words;
const BRAND = content.brand;

const HOLD = 560;
const GLITCH = 460;
const MOVE = 860;
/** how long the resolved name sits before the curtain tears */
const LOCK = 640;
const NOMINAL = HOLD + GLITCH + MOVE + LOCK;

/* ------------------------------------------------------------- overture
   The emblem lands first, splits in two, and the halves carry the handle
   out to either side while it types itself into the gap they leave. */

/** how long the emblem stands alone before it becomes a pair and parts */
const SPLIT_AT = 1100;
/** how long the halves take to reach their flanking marks */
const SPLIT_MS = 1050;
/** when the first letter lands in the gap */
const TYPE_AT = 1320;
const STAGGER = 62;
const OVERTURE = 2450;

/** typography shared by the typed handle and the anagram that replaces it */
const LETTER_TYPE =
  'font-display text-[clamp(2.5rem,13vw,9rem)] font-extrabold leading-none tracking-tightest';
const RESTING_INK = 'text-[rgba(233,237,251,0.95)]';

const EASE = [0.22, 1, 0.36, 1] as const;

export function Boot() {
  const { fx } = useUI();

  const [visible, setVisible] = useState(true);
  const [locked, setLocked] = useState(true);
  const [skip, setSkip] = useState(false);
  const [phase, setPhase] = useState<AnagramPhase>('hold');
  const [resolved, setResolved] = useState(false);
  const [split, setSplit] = useState(false);
  const [overture, setOverture] = useState(true);
  const [spread, setSpread] = useState(0);

  const wordRef = useRef<HTMLDivElement>(null);
  const emblemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Replay on every refresh while developing; once per tab for real visitors.
    const seen =
      process.env.NODE_ENV === 'production' &&
      sessionStorage.getItem(content.storage.introSeen) === '1';

    if (seen) {
      setSkip(true);
      setVisible(false);
      setLocked(false);
      return;
    }

    PREFETCH.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  // With effects off there is no overture to play — the handle is simply there.
  useEffect(() => {
    if (fx) return;
    setSplit(true);
    setOverture(false);
  }, [fx]);

  useEffect(() => {
    if (skip || !fx) return;
    const toSplit = setTimeout(() => setSplit(true), SPLIT_AT);
    const toRun = setTimeout(() => setOverture(false), OVERTURE);
    return () => {
      clearTimeout(toSplit);
      clearTimeout(toRun);
    };
  }, [skip, fx]);

  // How far each half travels: clear of the wordmark, but never off-screen on
  // a narrow viewport — there they ride behind the ends of the letters.
  useEffect(() => {
    const measure = () => {
      const word = wordRef.current?.offsetWidth ?? 0;
      const emblem = emblemRef.current?.offsetWidth ?? 0;
      if (!word || !emblem) return;
      const gap = Math.min(44, Math.max(14, word * 0.06));
      const room = (window.innerWidth - emblem) / 2 - 12;
      setSpread(Math.min(word / 2 + emblem / 2 + gap, room));
    };

    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Dismiss off the animation itself rather than a parallel clock, so the
  // curtain can never tear while letters are still in the air.
  useEffect(() => {
    if (!resolved || skip) return;
    const out = setTimeout(() => {
      sessionStorage.setItem(content.storage.introSeen, '1');
      setVisible(false);
    }, LOCK);
    const unlock = setTimeout(() => setLocked(false), LOCK + 950);
    return () => {
      clearTimeout(out);
      clearTimeout(unlock);
    };
  }, [resolved, skip]);

  const onChange = useCallback(
    (state: { phase: AnagramPhase; index: number; settled: boolean }) => {
      setPhase(state.phase);
      if (state.index === WORDS.length - 1 && state.settled) setResolved(true);
    },
    []
  );

  const glitching = phase === 'glitch';
  const letterClass = cn(
    LETTER_TYPE,
    resolved ? 'neon-text' : RESTING_INK
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
              animate={{ opacity: resolved ? 1 : 0.3 }}
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
              {/* wordmark stage: the emblem pair rides on a layer of its own,
                  centred on the handle it flanks */}
              <div className="relative flex items-center justify-center">
                {[-1, 1].map((dir) => (
                  <BootEmblem
                    key={dir}
                    dir={dir as -1 | 1}
                    lead={dir === -1}
                    split={split}
                    spread={spread}
                    hostRef={dir === -1 ? emblemRef : undefined}
                  />
                ))}

                <div ref={wordRef} className="relative z-10">
                  {overture ? (
                    <div
                      className="flex items-baseline justify-center"
                      role="img"
                      aria-label={INTRO.ariaLabel}
                    >
                      {WORDS[0].split('').map((ch, i) => (
                        <motion.span
                          key={`${ch}-${i}`}
                          aria-hidden="true"
                          className={cn('inline-block', letterClass)}
                          initial={{ opacity: 0, y: '0.42em', filter: 'blur(12px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          transition={{
                            duration: 0.34,
                            delay: (TYPE_AT + i * STAGGER) / 1000,
                            ease: EASE,
                          }}
                        >
                          {ch}
                        </motion.span>
                      ))}
                      <motion.span
                        aria-hidden="true"
                        className={cn('inline-block opacity-30', letterClass)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        transition={{
                          duration: 0.25,
                          delay: (TYPE_AT + WORDS[0].length * STAGGER) / 1000,
                        }}
                      >
                        .
                      </motion.span>
                    </div>
                  ) : (
                    <Anagram
                      words={WORDS}
                      once
                      hold={HOLD}
                      glitchMs={GLITCH}
                      moveMs={MOVE}
                      onChange={onChange}
                      label={INTRO.ariaLabel}
                      className={cn(!glitching && 'animate-flicker')}
                      letterClass={letterClass}
                      tail="."
                      tailClass={resolved ? 'neon-text' : 'opacity-30'}
                    />
                  )}
                </div>
              </div>

              {/* readout */}
              <motion.div
                className="mt-8 flex w-[min(80vw,30rem)] items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <span className="hazard h-3 w-8 opacity-70" />
                <span className="h-px flex-1 bg-white/12">
                  <motion.span
                    className="neon-line block h-full origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: (OVERTURE + NOMINAL) / 1000,
                      ease: 'easeInOut',
                    }}
                  />
                </span>
                <span className="hud text-accent">
                  {resolved ? INTRO.readyLabel : INTRO.waitingLabel}
                </span>
              </motion.div>

              {/* the reveal, spelled out */}
              <div className="relative mt-6 h-4 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={resolved ? 'name' : 'handle'}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -15, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="eyebrow whitespace-nowrap"
                  >
                    {resolved ? INTRO.captions[1] : INTRO.captions[0]}
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

/**
 * One half of the pair. The lead copy pops in alone; its twin is stacked
 * underneath at dead centre and only shows itself as the two part, so the
 * split reads as the emblem cleaving in two rather than a second one arriving.
 */
function BootEmblem({
  dir,
  lead,
  split,
  spread,
  hostRef,
}: {
  dir: -1 | 1;
  lead: boolean;
  split: boolean;
  spread: number;
  hostRef?: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ perspective: '900px' }}
    >
      <motion.div
        ref={hostRef}
        initial={{ opacity: 0, scale: 0.28, x: 0 }}
        animate={{
          opacity: split || lead ? 1 : 0,
          scale: 1,
          x: split ? dir * spread : 0,
        }}
        transition={{
          opacity: { duration: lead ? 0.6 : 0.18 },
          scale: { type: 'spring', stiffness: 165, damping: 14 },
          x: { duration: SPLIT_MS / 1000, ease: EASE },
        }}
      >
        <div
          className="h-[clamp(4.2rem,15vw,9.5rem)]"
          style={{
            animation: 'spin-y 3.2s linear infinite',
            transformStyle: 'preserve-3d',
            filter: `drop-shadow(0 0 18px rgb(var(--${
              dir === -1 ? 'accent' : 'accent-2'
            }-rgb) / calc(0.6 * var(--fx))))`,
          }}
        >
          <NextImage
            src={BRAND.emblem}
            alt=""
            width={473}
            height={512}
            priority
            className="h-full w-auto"
          />
        </div>
      </motion.div>
    </div>
  );
}
