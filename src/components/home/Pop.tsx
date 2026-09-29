'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/** Adds .ak-in once the element scrolls into view; .ak-pop animates it, and nested .ak-bar fills. */
export function Pop({
  as: Tag = 'div',
  delay = 0,
  className,
  children,
  style,
  ...rest
}: {
  as?: 'div' | 'li' | 'section' | 'article' | 'span';
  delay?: number;
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, 'className' | 'children'>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Anything already on screen or scrolled past (anchor jumps, late hydration) shows at once.
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add('ak-in');
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('ak-in');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn('ak-pop', className)}
      {...rest}
      style={{ '--d': `${delay}s`, ...style } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
