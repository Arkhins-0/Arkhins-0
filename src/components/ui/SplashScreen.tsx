'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Critical small assets — prefetched in background on first load
const CRITICAL_ASSETS = [
  '/images/profile.jpg',
  '/images/education/Bharath.png',
  '/images/education/SSV.png',
  '/images/companies/gdsc.png',
  '/images/companies/tt.png',
  '/images/companies/teachnook.png',
  '/images/projects/hygieia.png',
  '/images/projects/BidNest.png',
  '/images/projects/ctr.png',
  '/images/projects/stock-prediction.png',
];

// Large video assets — kicked off in background so SW starts caching them immediately
const VIDEO_ASSETS = [
  '/images/hero/hero_dark.mp4',
  '/images/hero/hero_light.mp4',
  '/images/hero/hero_dark_mobile.mp4',
  '/images/hero/hero_light_mobile.mp4',
];

export function SplashScreen() {
  // true = splash visible on first render (SSR HTML includes it so no flash of content)
  const [visible, setVisible] = useState(true);
  // scroll lock stays on until the exit animation finishes (exit duration = 1s)
  const [scrollLocked, setScrollLocked] = useState(true);

  useEffect(() => {
    // Register the service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => null);
    }

    // Kick off all asset prefetch in background — SW intercepts and caches, no await
    [...VIDEO_ASSETS, ...CRITICAL_ASSETS].forEach((url) => {
      fetch(url).catch(() => null);
    });

    // Start exit animation after 1500ms; keep scroll locked for the full animation duration
    const exitTimer = setTimeout(() => setVisible(false), 1500);
    const unlockTimer = setTimeout(() => setScrollLocked(false), 1500 + 1100); // 1s anim + buffer
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(unlockTimer);
    };
  }, []);

  return (
    <>
      {/* Inject overflow:hidden via a <style> tag so it takes effect in SSR HTML
          (before JS runs), not just after useEffect. Keep locked until exit anim finishes. */}
      {scrollLocked && (
        <style>{`html, body { overflow: hidden !important; }`}</style>
      )}
      <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex items-center gap-2 relative"
          >
            {/* Accent glow blob behind the name */}
            <span
              className="absolute inset-0 -z-10 blur-[80px] opacity-60"
              style={{ background: 'radial-gradient(ellipse at center, var(--accent) 0%, var(--accent-light) 60%, transparent 100%)' }}
              aria-hidden="true"
            />
          <div className="relative z-10 font-display text-9xl font-bold tracking-tight">
            <span className="text-gradient text-bold">Krishna</span>
            <span className="text-white">.</span>
          </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
