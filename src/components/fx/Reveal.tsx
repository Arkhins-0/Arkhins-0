'use client';

import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

type Dir = 'up' | 'down' | 'left' | 'right' | 'none';

const offset: Record<Dir, { x: number; y: number }> = {
  up: { x: 0, y: 34 },
  down: { x: 0, y: -34 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  none: { x: 0, y: 0 },
};

/** Fades/slides its children in once when they scroll into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  dir = 'up',
  amount = 0.25,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  dir?: Dir;
  amount?: number;
  as?: 'div' | 'section' | 'li' | 'article' | 'header';
}) {
  const M = motion[Tag] as typeof motion.div;
  const { x, y } = offset[dir];
  return (
    <M
      className={className}
      initial={{ opacity: 0, x, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </M>
  );
}

/** Parent variants for a staggered in-view reveal. */
export const stackParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/** Child variants paired with stackParent. */
export const stackChild: Variants = {
  hidden: { opacity: 0, y: 26, filter: 'blur(5px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: EASE },
  },
};

/** Wraps a list so children animate in sequence as the group enters view. */
export function Stack({
  children,
  className,
  amount = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  amount?: number;
}) {
  return (
    <motion.div
      className={cn(className)}
      variants={stackParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}
