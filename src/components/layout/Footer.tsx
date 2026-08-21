'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { FaGithub, FaInstagram, FaLinkedin, FaTelegram } from 'react-icons/fa6';
import { FaDiscord } from 'react-icons/fa';
import { SiGoogle } from 'react-icons/si';
import portfolioData from '@/data/portfolio.json';
import content from '@/data/content.json';
import { Anagram } from '@/components/fx';
import { fill } from '@/lib/utils';
import { SECTIONS } from './Navigation';

const { basics, socialLinks } = portfolioData;
const { footer, brand } = content;
const MARK = brand.footerMark;

const SOCIAL_ICON: Record<string, React.ReactNode> = {
  github: <FaGithub size={16} />,
  linkedin: <FaLinkedin size={16} />,
  instagram: <FaInstagram size={16} />,
  google: <SiGoogle size={16} />,
  discord: <FaDiscord size={16} />,
  telegram: <FaTelegram size={16} />,
};

export function Footer() {
  const year = new Date().getFullYear();
  const [mark, setMark] = useState(0);

  return (
    <footer className="relative overflow-hidden border-t border-white/8 pt-16">
      <div className="shell">
        {/* --------------------------------------------- columns */}
        <div className="grid gap-10 pb-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="eyebrow">{footer.currentlyLabel}</p>
            <p className="mt-4 max-w-sm font-display text-xl font-bold leading-snug">
              {fill(footer.currentlyCopy, {
                availability: basics.availability,
              })}
            </p>
            <a
              href={`mailto:${basics.email}`}
              className="mt-4 inline-block break-all text-sm text-ink-dim underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent"
            >
              {basics.email}
            </a>
          </div>

          <nav aria-label={content.nav.footerNavLabel}>
            <p className="eyebrow">{footer.sectionsLabel}</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <Link
                    href={`/#${s.id}`}
                    className="group inline-flex items-baseline gap-2 text-sm text-ink-dim transition-colors hover:text-accent"
                  >
                    <span className="hud text-ink-faint transition-colors group-hover:text-accent">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow">{footer.elsewhereLabel}</p>
            <ul className="mt-4 space-y-2">
              {socialLinks.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 text-sm text-ink-dim transition-colors hover:text-accent"
                  >
                    <span className="text-ink-faint transition-colors group-hover:text-accent">
                      {SOCIAL_ICON[s.icon]}
                    </span>
                    {s.name}
                    <span className="hud ml-auto text-ink-faint">
                      {footer.usernamePrefix}
                      {s.username}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --------------------------------------------- wordmark
            The two words are rearrangements of one another, cycling on the same
            beat as the intro. `fit` sizes it to the column, so it never
            overruns the shell however wide the viewport gets. */}
        <div className="relative select-none">
          <Anagram
            words={MARK.words}
            hold={3000}
            fit
            label={MARK.ariaLabel}
            letterClass={(i) =>
              i === 0
                ? 'font-display font-extrabold leading-[0.82] tracking-tightest text-white/[0.07]'
                : 'stroke-text font-display font-extrabold leading-[0.82] tracking-tightest opacity-[0.28]'
            }
            onChange={({ index }) => setMark(index)}
          />

          <div className="relative mt-1 h-4 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={mark}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="eyebrow text-center"
              >
                {MARK.captions[mark] ?? MARK.captions[0]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* --------------------------------------------- bottom bar */}
        <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 border-t border-white/8 py-6 sm:flex-row">
          <p className="hud text-ink-faint">
            {fill(footer.copyright, {
              year,
              name: basics.name,
              domain: brand.domain,
            })}
          </p>

          <div className="flex items-center gap-5">
            <p className="hud text-ink-faint">
              {footer.colophon}
              <span className="text-accent"> · </span>
              {footer.colophonDetail}
            </p>
            <Link
              href={`/#${SECTIONS[0].id}`}
              aria-label={footer.backToTop}
              className="group flex h-9 w-9 items-center justify-center border border-white/12 transition-colors hover:border-accent hover:text-accent"
            >
              <ArrowUp
                size={15}
                className="transition-transform duration-300 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
