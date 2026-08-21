'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Anagram, type AnagramPhase } from '@/components/fx';
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

const HOLD = 780;
const GLITCH = 460;
const MOVE = 860;
/** how long the resolved name sits before the curtain tears */
const LOCK = 640;
const NOMINAL = HOLD + GLITCH + MOVE + LOCK;

export function Boot() {
  const [visible, setVisible] = useState(true);
  const [locked, setLocked] = useState(true);
  const [skip, setSkip] = useState(false);
  const [phase, setPhase] = useState<AnagramPhase>('hold');
  const [resolved, setResolved] = useState(false);

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
              <Anagram
                words={WORDS}
                once
                hold={HOLD}
                glitchMs={GLITCH}
                moveMs={MOVE}
                onChange={onChange}
                label={INTRO.ariaLabel}
                className={cn(!glitching && 'animate-flicker')}
                letterClass={cn(
                  'font-display text-[clamp(2.5rem,13vw,9rem)] font-extrabold leading-none tracking-tightest',
                  resolved ? 'neon-text' : 'text-[rgba(233,237,251,0.95)]'
                )}
                tail="."
                tailClass={resolved ? 'neon-text' : 'opacity-30'}
              />

              {/* readout */}
              <div className="mt-8 flex w-[min(80vw,30rem)] items-center gap-4">
                <span className="hazard h-3 w-8 opacity-70" />
                <span className="h-px flex-1 bg-white/12">
                  <motion.span
                    className="neon-line block h-full origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: NOMINAL / 1000, ease: 'easeInOut' }}
                  />
                </span>
                <span className="hud text-accent">
                  {resolved ? INTRO.readyLabel : INTRO.waitingLabel}
                </span>
              </div>

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
