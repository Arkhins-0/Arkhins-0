'use client';

import { useEffect, useRef } from 'react';
import { useUI } from '@/context/UIContext';

type Particle = {
  x: number;
  y: number;
  px: number;
  py: number;
  life: number;
  max: number;
  hue: 0 | 1;
  w: number;
};

/**
 * Signature background: particles advected through a layered-sine flow field,
 * leaving additive neon trails. Trails are erased with `destination-out` so the
 * canvas stays transparent and the aurora layers below keep showing through.
 */
export function FlowField({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { fx, accent, ready } = useUI();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !ready) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!fx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const styles = getComputedStyle(document.documentElement);
    const tone = [
      styles.getPropertyValue('--accent-rgb').trim() || '255 45 111',
      styles.getPropertyValue('--accent-2-rgb').trim() || '0 240 255',
    ];

    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let raf = 0;
    let t = 0;
    let running = true;

    const spawn = (p?: Particle): Particle => {
      const max = 140 + Math.random() * 260;
      const seed = {
        x: Math.random() * w,
        y: Math.random() * h,
        px: 0,
        py: 0,
        life: 0,
        max,
        hue: (Math.random() > 0.42 ? 0 : 1) as 0 | 1,
        w: Math.random() < 0.14 ? 1.5 : 0.6,
      };
      seed.px = seed.x;
      seed.py = seed.y;
      if (!p) return seed;
      Object.assign(p, seed);
      return p;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Scale the swarm to the viewport, but keep phones cheap.
      const target = Math.round(
        Math.min(260, Math.max(70, (w * h) / (w < 768 ? 14000 : 7200)))
      );
      particles = Array.from({ length: target }, () => spawn());
    };

    // Cheap smooth field: three sine octaves summed into an angle.
    const angleAt = (x: number, y: number) =>
      (Math.sin(x * 0.0016 + t) +
        Math.sin(y * 0.0021 - t * 0.72) +
        Math.sin((x + y) * 0.0009 + t * 1.35)) *
      Math.PI *
      0.62;

    const frame = () => {
      if (!running) return;
      t += 0.0016;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.052)';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      for (const p of particles) {
        const a = angleAt(p.x, p.y);
        p.px = p.x;
        p.py = p.y;
        p.x += Math.cos(a) * 1.25;
        p.y += Math.sin(a) * 1.25;
        p.life += 1;

        const fade =
          Math.min(p.life / 26, 1) * (1 - Math.max(0, p.life / p.max - 0.7) / 0.3);

        ctx.strokeStyle = `rgb(${tone[p.hue]} / ${0.3 * fade})`;
        ctx.lineWidth = p.w;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        if (
          p.life > p.max ||
          p.x < -40 ||
          p.x > w + 40 ||
          p.y < -40 ||
          p.y > h + 40
        ) {
          spawn(p);
        }
      }

      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running) {
        raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
      }
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 180);
    };

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fx, accent, ready]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
