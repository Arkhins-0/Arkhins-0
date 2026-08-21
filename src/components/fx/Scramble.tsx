'use client';

import { useEffect, useRef, useState } from 'react';
import { useUI } from '@/context/UIContext';

// Slim glyphs only — block characters read as solid slabs at display sizes.
const GLYPHS = '/\\<>()[]{}#*+=~^:;.,·ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Decodes its text once, the first time it scrolls into view. Characters
 * resolve left-to-right while the not-yet-resolved tail churns through glyphs.
 */
export function Scramble({
  text,
  className,
  speed = 2,
  as: Tag = 'span',
}: {
  text: string;
  className?: string;
  /** frames each character waits before locking in */
  speed?: number;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'div' | 'p';
}) {
  const ref = useRef<HTMLElement>(null);
  const [out, setOut] = useState(text);
  const { fx } = useUI();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!fx) {
      setOut(text);
      return;
    }

    let raf = 0;
    let frame = 0;
    let done = false;

    const run = () => {
      const resolved = Math.floor(frame / speed);
      if (resolved >= text.length) {
        setOut(text);
        done = true;
        return;
      }
      let next = '';
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (i < resolved || ch === ' ') next += ch;
        else next += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOut(next);
      frame += 1;
      raf = requestAnimationFrame(run);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !done) {
          io.disconnect();
          raf = requestAnimationFrame(run);
        }
      },
      { threshold: 0.4 }
    );

    // Start hidden-ish so the pop-in reads as a decode, not a text swap.
    setOut(text.replace(/[^\s]/g, '·'));
    io.observe(node);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [text, speed, fx]);

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      className={className}
      aria-label={text}
    >
      <span aria-hidden="true">{out}</span>
    </Tag>
  );
}
