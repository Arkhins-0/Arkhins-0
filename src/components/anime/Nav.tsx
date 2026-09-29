'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Item = { id: string; label: string };

/** Floating pill navigation; highlights the section in view and collapses to a sheet on phones. */
export function Nav({
  title,
  kana,
  items,
  cta,
  ctaHref,
  openMenu,
  closeMenu,
}: {
  title: string;
  kana: string;
  items: Item[];
  cta: string;
  ctaHref: string;
  openMenu: string;
  closeMenu: string;
}) {
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, [items]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
      <nav
        className={cn(
          'mx-auto flex max-w-[1240px] items-center gap-3 rounded-full border-[3px] border-[color:var(--ak-ink)] bg-white/95 py-2 pl-4 pr-2 backdrop-blur transition-shadow duration-300',
          scrolled ? 'shadow-[4px_4px_0_var(--ak-ink)]' : 'shadow-[2px_2px_0_var(--ak-ink)]'
        )}
      >
        <Link href="/" className="group flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="ak-display text-lg leading-none tracking-wide md:text-xl">
            {title}
            <span className="text-[color:var(--ak-sakura)]">.</span>
          </span>
          <span lang="ja" className="hidden text-[0.7rem] font-bold text-[color:var(--ak-ink-2)] sm:inline">
            {kana}
          </span>
        </Link>

        <ul className="ml-auto hidden items-center gap-1 lg:flex">
          {items.map((it) => (
            <li key={it.id}>
              <Link
                href={`/#${it.id}`}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-bold transition-colors',
                  active === it.id
                    ? 'bg-[color:var(--ak-ink)] text-white'
                    : 'text-[color:var(--ak-ink-2)] hover:bg-[color:var(--ak-sakura-soft)] hover:text-[color:var(--ak-ink)]'
                )}
              >
                {it.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link href={ctaHref} className="ak-btn ml-auto px-4 py-2 text-sm lg:ml-2">
          {cta}
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? closeMenu : openMenu}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[color:var(--ak-ink)] bg-[color:var(--ak-sun)] lg:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {open && (
        <div className="ak-cel mx-auto mt-3 max-w-[1240px] p-3 lg:hidden">
          <ul className="grid grid-cols-2 gap-2">
            {items.map((it, i) => (
              <li key={it.id}>
                <Link
                  href={`/#${it.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl border-2 border-[color:var(--ak-ink)] px-3 py-3 font-bold transition-colors hover:bg-[color:var(--ak-sakura-soft)]"
                >
                  <span className="text-xs text-[color:var(--ak-sakura)]">{String(i + 1).padStart(2, '0')}</span>
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
