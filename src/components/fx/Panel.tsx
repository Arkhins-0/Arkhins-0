'use client';

import { useCallback } from 'react';
import { cn } from '@/lib/utils';

const CLIP = {
  diag: 'notch-diag',
  br: 'notch-br',
  tl: 'notch-tl',
  none: '',
} as const;

const EDGE_NEUTRAL =
  'linear-gradient(150deg, rgba(255,255,255,0.17), rgba(255,255,255,0.05) 44%, rgba(255,255,255,0.02))';
const EDGE_HOT =
  'linear-gradient(150deg, rgb(var(--accent-rgb) / 0.75), rgba(255,255,255,0.14) 40%, rgb(var(--accent-2-rgb) / 0.45))';

type PanelProps = {
  children: React.ReactNode;
  className?: string;
  notch?: keyof typeof CLIP;
  cut?: number;
  hot?: boolean;
  solid?: boolean;
  spotlight?: boolean;
  innerClassName?: string;
  as?: 'div' | 'article' | 'li' | 'section';
};

/** Chamfered surface: a 1px gradient edge with a frosted fill inset inside it. */
export function Panel({
  children,
  className,
  notch = 'diag',
  cut = 16,
  hot = false,
  solid = false,
  spotlight = false,
  innerClassName,
  as: Tag = 'div',
}: PanelProps) {
  const clip = CLIP[notch];

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!spotlight) return;
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
      e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
    },
    [spotlight]
  );

  return (
    <Tag
      className={cn('relative p-px', clip, className)}
      style={{
        ['--notch' as string]: `${cut}px`,
        backgroundImage: hot ? EDGE_HOT : EDGE_NEUTRAL,
      }}
      onPointerMove={onMove}
    >
      <div
        className={cn(
          'relative h-full w-full overflow-hidden',
          clip,
          solid ? 'glass-fill-solid' : 'glass-fill',
          spotlight && 'spotlight',
          innerClassName
        )}
      >
        {children}
      </div>
    </Tag>
  );
}
