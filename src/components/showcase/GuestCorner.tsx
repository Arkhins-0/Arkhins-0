'use client';

/* eslint-disable @next/next/no-img-element -- guest art may be a bucket URL of unknown size, or a GIF */
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Guest } from '@/types/guest';

/**
 * The project's guest character in the bottom corner of its showcase page, with a one-line bubble.
 * On wide screens the full figure stands in the margin. On phones there is no margin, so the
 * figure would cover the text; there it shrinks to a round face badge that opens the bubble on tap.
 * The × sends the guest away.
 */
export function GuestCorner({ guest, label, closeLabel }: { guest: Guest; label: string; closeLabel: string }) {
  const [shown, setShown] = useState(false);
  const [talking, setTalking] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // The guest arrives talking on every screen size.
    const t = setTimeout(() => {
      setShown(true);
      setTalking(true);
    }, 900);
    // On phones the bubble sits over the text, so it tucks away once the reader starts scrolling.
    // Tapping the badge brings it back.
    const wide = window.matchMedia('(min-width: 1024px)').matches;
    const start = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - start) > 240) {
        setTalking(false);
        window.removeEventListener('scroll', onScroll);
      }
    };
    if (!wide) window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  if (gone) return null;

  const bubble = (
    <div className="pointer-events-auto relative max-w-[220px] rounded-2xl border-[3px] border-[#1c1633] bg-white px-4 py-3 text-[#1c1633] shadow-[3px_3px_0_#1c1633] [font-family:var(--font-ak-body),system-ui]">
      <button
        type="button"
        onClick={() => setGone(true)}
        aria-label={closeLabel}
        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#1c1633] bg-[#ffcc29]"
      >
        <X size={12} />
      </button>
      <p className="text-[0.65rem] font-extrabold uppercase tracking-widest text-[#ff4f8b]">{label}</p>
      <p className="text-lg leading-tight [font-family:var(--font-ak-display),system-ui]">{guest.name}</p>
      <p className="text-[0.7rem] font-bold text-[#4a4368]">{guest.series}</p>
      <p className="mt-1.5 text-sm font-bold leading-snug">{guest.line}</p>
    </div>
  );

  return (
    <aside
      aria-label={`${label}: ${guest.name}`}
      className={cn(
        'pointer-events-none fixed bottom-3 right-3 z-40 transition-all duration-700 ease-out lg:bottom-0 lg:right-6',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      )}
    >
      {/* Phones and tablets: a face badge; the bubble opens above it. */}
      <div className="flex flex-col items-end gap-3 lg:hidden">
        {talking && bubble}
        <button
          type="button"
          onClick={() => setTalking((v) => !v)}
          aria-expanded={talking}
          aria-label={`${guest.name}: ${guest.line}`}
          className="pointer-events-auto h-14 w-14 overflow-hidden rounded-full border-[3px] border-[#1c1633] bg-[#ffd3e2] shadow-[3px_3px_0_#1c1633]"
        >
          {guest.face ? (
            <img src={guest.face} alt="" className="h-full w-full object-cover" />
          ) : (
            <img src={guest.image} alt="" className="h-[260%] w-auto max-w-none -translate-x-[20%] object-cover object-top" />
          )}
        </button>
      </div>

      {/* Wide screens: the full figure in the margin, bubble beside it. */}
      <div className="hidden items-end lg:flex">
        {talking && <div className="mb-24 mr-[-12px]">{bubble}</div>}
        <button
          type="button"
          onClick={() => setTalking((v) => !v)}
          aria-expanded={talking}
          aria-label={`${guest.name}: ${guest.line}`}
          className="pointer-events-auto transition-transform duration-300 hover:-translate-y-1"
        >
          <img src={guest.image} alt="" className="h-[34vh] max-h-[320px] min-h-[180px] w-auto drop-shadow-[4px_6px_0_rgba(0,0,0,0.35)]" />
        </button>
      </div>
    </aside>
  );
}
