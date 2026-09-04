'use client';

import { FlowField } from './FlowField';
import { useUI } from '@/context/UIContext';
import { cn } from '@/lib/utils';

/** Fixed, pointer-transparent background stack (vignette, aurora, grid, flow field, halftone, grain), staged with the boot sequence. */
export function Backdrop() {
  const { bootStage } = useUI();
  const dressed = bootStage !== 'emblem';
  const live = bootStage === 'live';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% -10%, #0d1024 0%, #06070f 45%, #04050a 100%)',
        }}
      />

      {dressed && (
        <>
          <div
            className={cn(
              'absolute -left-[18vw] -top-[14vh] h-[70vh] w-[70vw] rounded-full opacity-[calc(0.5*var(--fx))] blur-[110px]',
              live && 'animate-drift-a'
            )}
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgb(var(--accent-rgb) / 0.55), transparent 66%)',
            }}
          />
          <div
            className={cn(
              'absolute -bottom-[22vh] -right-[16vw] h-[78vh] w-[66vw] rounded-full opacity-[calc(0.42*var(--fx))] blur-[130px]',
              live && 'animate-drift-b'
            )}
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgb(var(--accent-2-rgb) / 0.5), transparent 66%)',
            }}
          />
          <div
            className={cn(
              'absolute left-1/2 top-1/3 h-[46vh] w-[46vw] -translate-x-1/2 rounded-full opacity-[calc(0.22*var(--fx))] blur-[120px]',
              live && 'animate-drift-b'
            )}
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgb(var(--n-violet-rgb) / 0.5), transparent 70%)',
              animationDelay: '-12s',
            }}
          />

          <div
            className="absolute inset-0 opacity-[0.5]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '68px 68px',
              maskImage:
                'radial-gradient(115% 90% at 50% 30%, #000 20%, transparent 78%)',
              WebkitMaskImage:
                'radial-gradient(115% 90% at 50% 30%, #000 20%, transparent 78%)',
            }}
          />

          <FlowField
            active={live}
            className="absolute inset-0 h-full w-full opacity-[calc(0.9*var(--fx))]"
          />

          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                'radial-gradient(rgba(255,255,255,0.16) 0.5px, transparent 0.5px)',
              backgroundSize: '5px 5px',
              maskImage:
                'linear-gradient(to bottom, transparent, #000 30%, #000 70%, transparent)',
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent, #000 30%, #000 70%, transparent)',
            }}
          />

          <svg className="hidden h-0 w-0 md:block">
            <filter id="grain-filter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.82"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </svg>
          <div
            className="absolute inset-0 hidden opacity-[0.16] mix-blend-overlay md:block"
            style={{ filter: 'url(#grain-filter)' }}
          />
        </>
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(4,5,10,0.72) 0%, transparent 16%, transparent 84%, rgba(4,5,10,0.85) 100%)',
        }}
      />
    </div>
  );
}
