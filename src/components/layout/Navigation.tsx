'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Zap, ZapOff } from 'lucide-react';
import { ACCENTS, useUI } from '@/context/UIContext';
import { NeonButton } from '@/components/fx';
import { cn, fill } from '@/lib/utils';
import portfolioData from '@/data/portfolio.json';
import content from '@/data/content.json';

const { basics } = portfolioData;
const { nav, brand, theme } = content;

export const SECTIONS = nav.sections;

const FIRST = basics.name.split(' ')[0];

/** Watches every section and reports whichever owns the upper third. */
function useActiveSection() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean
    ) as HTMLElement[];
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.2, 0.6] }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return active;
}

function Controls({ compact = false }: { compact?: boolean }) {
  const { accent, setAccent, fx, toggleFx } = useUI();
  return (
    <div className={cn('flex items-center', compact ? 'gap-4' : 'gap-3')}>
      <div
        className="flex items-center gap-1.5"
        role="group"
        aria-label={theme.accentGroupLabel}
      >
        {ACCENTS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAccent(a.id)}
            aria-label={fill(theme.accentOptionLabel, { label: a.label })}
            aria-pressed={accent === a.id}
            className={cn(
              'h-2.5 w-2.5 rotate-45 transition-all duration-300',
              accent === a.id ? 'scale-[1.7]' : 'opacity-45 hover:opacity-90'
            )}
            style={{
              background: a.swatch,
              boxShadow: accent === a.id ? `0 0 12px ${a.swatch}` : undefined,
            }}
          />
        ))}
      </div>
      <span className="h-4 w-px bg-white/12" />
      <button
        onClick={toggleFx}
        aria-label={fx ? theme.effectsDisableLabel : theme.effectsEnableLabel}
        title={fx ? theme.effectsOn : theme.effectsOff}
        className="text-ink-faint transition-colors hover:text-accent"
      >
        {fx ? <Zap size={15} /> : <ZapOff size={15} />}
      </button>
    </div>
  );
}

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const active = useActiveSection();

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      {/* While the sheet is open the header has to outrank it, otherwise the
          close button is buried and the menu can only be dismissed by
          navigating. */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 px-4 pt-4 md:px-8 md:pt-6',
          open ? 'z-[90]' : 'z-[60]'
        )}
      >
        <nav
          className={cn(
            'mx-auto flex max-w-[84rem] items-center justify-between transition-all duration-500 ease-swift',
            condensed
              ? 'glass notch-diag px-4 py-2.5 md:px-6'
              : 'border border-transparent px-0 py-2'
          )}
          style={{ ['--notch' as string]: '14px' }}
        >
          {/* wordmark */}
          <Link
            href={`/#${SECTIONS[0].id}`}
            className="group flex items-center gap-3"
            aria-label={fill(nav.homeAria, { name: basics.name })}
          >
            {/* the emblem turns on its vertical axis, so it reads as a
                machined part rather than a flat sticker */}
            <span
              className="grid h-9 w-9 shrink-0 place-items-center"
              style={{ perspective: '520px' }}
            >
              <Image
                src={brand.emblem}
                alt={brand.emblemAlt}
                width={73}
                height={79}
                priority
                className="animate-spin-y h-9 w-auto"
                style={{
                  transformStyle: 'preserve-3d',
                  filter:
                    'drop-shadow(0 0 10px rgb(var(--accent-rgb) / calc(0.55 * var(--fx))))',
                }}
              />
            </span>
            <span className="hidden font-display text-base font-bold tracking-tight sm:block">
              {FIRST}
              <span className="neon-text">{brand.wordmarkSuffix}</span>
            </span>
          </Link>

          {/* desktop links */}
          <ul className="hidden items-center gap-0.5 lg:flex">
            {SECTIONS.map((s, i) => {
              const on = active === s.id;
              return (
                <li key={s.id}>
                  <Link
                    href={`/#${s.id}`}
                    className={cn(
                      'group relative flex items-baseline gap-1.5 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] transition-colors',
                      on ? 'text-accent' : 'text-ink-faint hover:text-ink'
                    )}
                  >
                    <span
                      className={cn(
                        'text-[0.58rem] transition-opacity',
                        on ? 'opacity-100' : 'opacity-40'
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {s.label}
                    <span
                      className={cn(
                        'absolute inset-x-3 bottom-1 h-px origin-left bg-accent transition-transform duration-300 ease-swift',
                        on ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* right cluster */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <Controls />
            </div>
            <div className="hidden lg:block">
              <NeonButton
                href={`/#${SECTIONS[SECTIONS.length - 1].id}`}
                variant="ghost"
                className="!px-4 !py-2.5"
                magnetic={false}
                icon={<Sparkles size={13} />}
              >
                {nav.cta}
              </NeonButton>
            </div>

            {/* burger */}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? nav.closeMenu : nav.openMenu}
              aria-expanded={open}
              className="relative flex h-9 w-9 flex-col items-center justify-center gap-[5px] lg:hidden"
            >
              <span
                className={cn(
                  'h-px w-6 bg-ink transition-all duration-300 ease-swift',
                  open && 'translate-y-[3px] rotate-45 bg-accent'
                )}
              />
              <span
                className={cn(
                  'h-px w-6 bg-ink transition-all duration-300 ease-swift',
                  open && '-translate-y-[3px] -rotate-45 bg-accent'
                )}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* ------------------------------------------------ scroll spine */}
      <div className="pointer-events-none fixed right-5 top-1/2 z-[55] hidden -translate-y-1/2 flex-col items-end gap-3 2xl:flex">
        {SECTIONS.map((s, i) => {
          const on = active === s.id;
          return (
            <Link
              key={s.id}
              href={`/#${s.id}`}
              className="pointer-events-auto group flex items-center justify-end gap-2"
              aria-label={s.label}
            >
              <span
                className={cn(
                  'hud translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100',
                  on ? 'text-accent' : 'text-ink-faint'
                )}
              >
                {String(i + 1).padStart(2, '0')} {s.label}
              </span>
              <span
                className={cn(
                  'block h-px transition-all duration-300 ease-swift',
                  on
                    ? 'w-8 bg-accent shadow-[0_0_10px_rgb(var(--accent-rgb)/0.9)]'
                    : 'w-4 bg-white/25 group-hover:w-6 group-hover:bg-white/60'
                )}
              />
            </Link>
          );
        })}
      </div>

      {/* ------------------------------------------------ mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[80] flex flex-col justify-between bg-[#04050acc] px-6 pb-10 pt-24 backdrop-blur-2xl lg:hidden"
          >
            <ul className="flex flex-col">
              {SECTIONS.map((s, i) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14 + i * 0.045, duration: 0.4 }}
                  className="border-b border-white/8"
                >
                  <Link
                    href={`/#${s.id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-baseline justify-between py-3.5 font-display text-3xl font-bold tracking-tight transition-colors',
                      active === s.id ? 'neon-text' : 'text-ink'
                    )}
                  >
                    {s.label}
                    <span className="hud text-ink-faint">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="flex items-center justify-between gap-4 pt-8"
            >
              <Controls compact />
              <a
                href={`mailto:${basics.email}`}
                className="hud text-accent underline underline-offset-4"
              >
                {nav.menuAction}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
