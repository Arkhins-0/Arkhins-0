'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useUI } from '@/context/UIContext';
import { cn } from '@/lib/utils';
import content from '@/data/content.json';

export type AnagramPhase = 'hold' | 'glitch' | 'move';

const NOISE = content.fx.anagramNoiseGlyphs;
/** font-size the hidden sizer is measured at, before fit scales it up */
const REF_PX = 100;

type Letter = { id: string; ch: string };

/**
 * Build one stable set of letter objects from the first word, then an ordering
 * of those same objects for every other word. Returns null unless every word is
 * an anagram of the first — the whole effect depends on reusing the elements
 * rather than swapping text.
 */
function buildOrders(words: string[]): Letter[][] | null {
  if (words.length === 0) return null;
  const base: Letter[] = words[0].split('').map((ch, i) => ({ id: `l${i}`, ch }));
  const orders: Letter[][] = [base];

  for (let w = 1; w < words.length; w++) {
    const pool = new Map<string, Letter[]>();
    for (const letter of base) {
      const bucket = pool.get(letter.ch);
      if (bucket) bucket.push(letter);
      else pool.set(letter.ch, [letter]);
    }
    const order: Letter[] = [];
    for (const ch of words[w]) {
      const next = pool.get(ch)?.shift();
      if (!next) return null;
      order.push(next);
    }
    if (order.length !== base.length) return null;
    orders.push(order);
  }
  return orders;
}

type LetterClass = string | ((wordIndex: number) => string);

export interface AnagramProps {
  /** every entry must be an anagram of the first */
  words: string[];
  /** ms a word rests before it comes apart */
  hold?: number;
  glitchMs?: number;
  moveMs?: number;
  /** stop on the last word instead of cycling forever */
  once?: boolean;
  /** scale the wordmark to exactly fill its parent's width */
  fit?: boolean;
  /** chromatic ghost layers during the glitch beat */
  chroma?: boolean;
  /**
   * Fly the letters into their new slots. Off, the swap happens behind the
   * static instead: the noise clears and the next word is simply standing
   * there — right for small settings where travel reads as jitter.
   */
  travel?: boolean;
  /** typography for the letters; may vary per word */
  letterClass?: LetterClass;
  /** trailing character, e.g. the brand full stop */
  tail?: string;
  tailClass?: string;
  className?: string;
  /** read out instead of the letters, which churn through glyphs mid-swap */
  label?: string;
  onChange?: (state: {
    phase: AnagramPhase;
    index: number;
    word: string;
    settled: boolean;
  }) => void;
}

/**
 * Holds a word, tears it apart with glyph noise and a chromatic split, then
 * flies the same letter elements into their slots in the next word. The letters
 * travel; they are never re-typeset, which is what sells the rearrangement.
 */
export function Anagram({
  words,
  hold = 3000,
  glitchMs = 440,
  moveMs = 840,
  once = false,
  fit = false,
  chroma = true,
  travel = true,
  letterClass,
  tail,
  tailClass,
  className,
  label,
  onChange,
}: AnagramProps) {
  const { fx } = useUI();

  // Memoise on content, not array identity — a new Letter[] every render would
  // change the keys and break the layout animation entirely.
  const signature = words.join('|');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const orders = useMemo(() => buildOrders(words), [signature]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<AnagramPhase>('hold');
  const [noise, setNoise] = useState<string[] | null>(null);
  const [jitter, setJitter] = useState<number[]>([]);
  const [inView, setInView] = useState(false);
  const [fitSize, setFitSize] = useState<number | null>(null);

  const host = useRef<HTMLDivElement>(null);
  const sizer = useRef<HTMLSpanElement>(null);

  const canAnimate = Boolean(orders) && words.length > 1 && fx;
  // With effects off the loop just rests on its first word, and a one-shot run
  // shows the word it would have resolved to.
  const shownIndex = canAnimate ? index : once ? words.length - 1 : 0;
  const glitching = canAnimate && phase === 'glitch';
  const finished = once && shownIndex === words.length - 1 && phase === 'hold';

  /* ------------------------------------------------------------- observer */

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* -------------------------------------------------------- phase machine */

  useEffect(() => {
    if (!canAnimate || !inView || finished) return;
    const duration =
      phase === 'hold' ? hold : phase === 'glitch' ? glitchMs : moveMs;

    const timer = setTimeout(() => {
      if (phase === 'hold') {
        setPhase('glitch');
      } else if (phase === 'glitch') {
        setIndex((i) => (i + 1) % words.length);
        setPhase(travel ? 'move' : 'hold');
      } else {
        setPhase('hold');
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [
    canAnimate,
    inView,
    finished,
    phase,
    hold,
    glitchMs,
    moveMs,
    travel,
    words.length,
  ]);

  /* ----------------------------------------------------------- the churn */

  useEffect(() => {
    if (!glitching || !orders) {
      setNoise(null);
      setJitter([]);
      return;
    }
    const count = orders[0].length;
    const id = setInterval(() => {
      setNoise(
        Array.from({ length: count }, () =>
          Math.random() < 0.72
            ? NOISE[Math.floor(Math.random() * NOISE.length)]
            : ''
        )
      );
      setJitter(
        Array.from({ length: count }, () => (Math.random() - 0.5) * 26)
      );
    }, 52);
    return () => clearInterval(id);
  }, [glitching, orders]);

  /* ------------------------------------------------------------ reporting */

  const report = useRef(onChange);
  report.current = onChange;
  useEffect(() => {
    report.current?.({
      phase,
      index: shownIndex,
      word: words[shownIndex] ?? '',
      settled: phase === 'hold',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, shownIndex, signature]);

  /* ----------------------------------------------------------------- fit
     Measured as a real font-size rather than a transform, so the wordmark
     rasterises crisply at whatever size the column happens to be. */

  useEffect(() => {
    if (!fit) return;
    const measure = () => {
      const width = sizer.current?.getBoundingClientRect().width ?? 0;
      const available = host.current?.clientWidth ?? 0;
      if (!width || !available) return;
      setFitSize((available / width) * REF_PX);
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (host.current) ro.observe(host.current);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [fit, signature]);

  if (!orders) return <span className={className}>{words[0]}</span>;

  const classFor = (i: number) =>
    typeof letterClass === 'function' ? letterClass(i) : letterClass;

  const ready = !fit || fitSize !== null;
  const current = orders[shownIndex] ?? orders[0];
  const lettersClass = classFor(shownIndex);

  const row = (variant: 'main' | 'ghost') => (
    <div className="flex items-baseline justify-center" aria-hidden="true">
      {current.map((letter, i) => (
        <motion.span
          key={letter.id}
          layout={variant === 'main' && canAnimate && ready && travel}
          className={cn(
            'inline-block transition-[color,text-shadow] duration-300',
            lettersClass
          )}
          animate={{
            y: glitching ? jitter[i] ?? 0 : 0,
            opacity: glitching && noise?.[i] === '' ? 0.25 : 1,
          }}
          transition={{
            layout: {
              type: 'spring',
              stiffness: 170,
              damping: 18,
              delay: phase === 'move' ? i * 0.04 : 0,
            },
            y: { duration: 0.05 },
            opacity: { duration: 0.05 },
          }}
        >
          {variant === 'main' && noise?.[i] ? noise[i] : letter.ch}
        </motion.span>
      ))}
      {tail && (
        <span className={cn('inline-block', lettersClass, tailClass)}>
          {tail}
        </span>
      )}
    </div>
  );

  return (
    <div
      ref={host}
      className={cn('relative', className)}
      style={{
        fontSize: fit && fitSize !== null ? `${fitSize}px` : undefined,
        opacity: ready ? undefined : 0,
      }}
      {...(label ? { role: 'img', 'aria-label': label } : {})}
    >
      {fit && (
        <span
          ref={sizer}
          aria-hidden="true"
          className={cn(
            'pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap',
            classFor(0)
          )}
          style={{ fontSize: `${REF_PX}px` }}
        >
          {words[0]}
          {tail}
        </span>
      )}

      {chroma && canAnimate && (
        <>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 mix-blend-screen"
            style={{ color: 'var(--accent)' }}
            animate={{ x: glitching ? -7 : 0, opacity: glitching ? 0.85 : 0 }}
            transition={{ duration: 0.08 }}
          >
            {row('ghost')}
          </motion.div>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 mix-blend-screen"
            style={{ color: 'var(--accent-2)' }}
            animate={{ x: glitching ? 7 : 0, opacity: glitching ? 0.85 : 0 }}
            transition={{ duration: 0.08 }}
          >
            {row('ghost')}
          </motion.div>
        </>
      )}

      <div className="relative">{row('main')}</div>
    </div>
  );
}
