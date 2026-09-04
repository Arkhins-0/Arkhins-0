'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useUI } from '@/context/UIContext';

/** Pulls its child toward the cursor while hovered; inert on touch. */
export function Magnetic({
  children,
  strength = 0.34,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { fx } = useUI();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 260, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 260, damping: 18, mass: 0.4 });

  const handle = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!fx || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * strength);
    my.set((e.clientY - (r.top + r.height / 2)) * strength);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={handle}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
}
