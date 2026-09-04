'use client';

import { useEffect, useRef, useState } from 'react';
import { useUI } from '@/context/UIContext';

import content from '@/data/content.json';

const GLYPHS = content.fx.scrambleGlyphs;

/** Decodes its text left-to-right the first time it scrolls into view, churning the unresolved tail through glyphs. */
export function Scramble({
  text,
  className,
  speed = 2,
  as: Tag = 'span',
}: {
  text: string;
  className?: string;
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
