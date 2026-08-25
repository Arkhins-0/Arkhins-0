'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/** Hairline progress bar pinned to the very top of the viewport. */
export function ScrollRail() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: width }}
      className="fixed left-0 top-0 z-[70] h-[2px] w-full origin-left neon-line"
    />
  );
}
