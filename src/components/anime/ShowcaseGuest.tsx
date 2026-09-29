'use client';

/* eslint-disable @next/next/no-img-element -- guest art may be a bucket URL of unknown size, or a GIF */
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Guest } from '@/types/anime';

/**
 * The project's guest character, standing in the bottom corner of its showcase page with a
 * one-line bubble. Sits outside each page's own look, so it reads the same on every theme.
 * Clicking the character toggles the bubble; the × sends the guest away.
 */
export function ShowcaseGuest({ guest, label, closeLabel }: { guest: Guest; label: string; closeLabel: string }) {
  const [shown, setShown] = useState(false);
  const [talking, setTalking] = useState(true);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), 900);
    return () => clearTimeout(t);
  }, []);

  if (gone) return null;

  return (
    <aside
      aria-label={`${label}: ${guest.name}`}
      className={cn(
        'pointer-events-none fixed bottom-0 right-2 z-40 flex items-end transition-all duration-700 ease-out md:right-6',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      )}
    >
      {talking && (
        <div className="pointer-events-auto relative mb-24 mr-[-12px] hidden max-w-[220px] rounded-2xl border-[3px] border-[#1c1633] bg-white px-4 py-3 text-[#1c1633] shadow-[3px_3px_0_#1c1633] [font-family:var(--font-ak-body),system-ui] sm:block">
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
          <span aria-hidden="true" className="absolute -right-[14px] bottom-5 h-0 w-0 border-y-[10px] border-l-[14px] border-y-transparent border-l-[#1c1633]" />
        </div>
      )}
      <button
        type="button"
        onClick={() => setTalking((v) => !v)}
        aria-label={`${guest.name}: ${guest.line}`}
        className="pointer-events-auto transition-transform duration-300 hover:-translate-y-1"
      >
        <img src={guest.image} alt="" className="h-[34vh] max-h-[320px] min-h-[180px] w-auto drop-shadow-[4px_6px_0_rgba(0,0,0,0.35)]" />
      </button>
    </aside>
  );
}
