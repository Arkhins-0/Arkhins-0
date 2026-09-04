'use client';

import { cn } from '@/lib/utils';

/** Seamless marquee: children render twice and the track slides -50%, so the loop has no seam. */
export function Ticker({
  children,
  duration = 38,
  reverse = false,
  pauseOnHover = true,
  className,
  fade = true,
}: {
  children: React.ReactNode;
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
  fade?: boolean;
}) {
  return (
    <div
      className={cn('group relative w-full overflow-hidden', className)}
      style={
        fade
          ? {
              maskImage:
                'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
              WebkitMaskImage:
                'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
            }
          : undefined
      }
    >
      <div
        className={cn(
          'flex w-max animate-ticker',
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
        style={{
          ['--ticker-dur' as string]: `${duration}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
