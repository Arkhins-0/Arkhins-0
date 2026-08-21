'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Slim chrome for a case-study page: back to the index, project name, scroll
 *  state. Deliberately lighter than the site nav so the case study leads. */
export function ProjectBar({
  name,
  kind = 'case study',
  backHref = '/#work',
  backLabel = 'All work',
}: {
  name: string;
  kind?: string;
  backHref?: string;
  backLabel?: string;
}) {
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-[60] px-4 pt-4 md:px-8 md:pt-6">
      <nav
        className={cn(
          'mx-auto flex max-w-[84rem] items-center justify-between transition-all duration-500 ease-swift',
          condensed ? 'glass notch-diag px-4 py-2.5 md:px-6' : 'px-0 py-2'
        )}
        style={{ ['--notch' as string]: '14px' }}
      >
        <Link
          href={backHref}
          className="group flex items-center gap-2.5 text-ink-dim transition-colors hover:text-accent"
        >
          <ArrowLeft
            size={15}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
          <span className="hud">{backLabel}</span>
        </Link>

        <span className="hud text-ink-faint">
          {kind}<span className="text-accent"> / </span>
          <span className="text-ink">{name}</span>
        </span>
      </nav>
    </header>
  );
}
