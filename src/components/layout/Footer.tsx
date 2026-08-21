'use client';

import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import { FaGithub, FaInstagram, FaLinkedin, FaTelegram } from 'react-icons/fa6';
import { FaDiscord } from 'react-icons/fa';
import { SiGoogle } from 'react-icons/si';
import portfolioData from '@/data/portfolio.json';
import { SECTIONS } from './Navigation';

const { basics, socialLinks } = portfolioData;

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

  return (
    <footer className="relative overflow-hidden border-t border-white/8 pt-16">
      <div className="shell">
        {/* --------------------------------------------- columns */}
        <div className="grid gap-10 pb-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="eyebrow">Currently</p>
            <p className="mt-4 max-w-sm font-display text-xl font-bold leading-snug">
              {basics.availability} — for internships, junior roles and
              freelance builds.
            </p>
            <a
              href={`mailto:${basics.email}`}
              className="mt-4 inline-block break-all text-sm text-ink-dim underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent"
            >
              {basics.email}
            </a>
          </div>

          <nav aria-label="Footer">
            <p className="eyebrow">Sections</p>
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
            <p className="eyebrow">Elsewhere</p>
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
                      @{s.username}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --------------------------------------------- wordmark
            Hovering swaps the display name for the handle — the same seven
            letters, rearranged. Drawn as SVG with an explicit textLength so it
            fits the column exactly at every viewport width. */}
        <div className="group relative select-none">
          <svg
            viewBox="0 0 1000 150"
            className="w-full"
            role="img"
            aria-label="Krishna — also known as Arkhins"
          >
            <text
              x="500"
              y="122"
              textAnchor="middle"
              textLength="990"
              lengthAdjust="spacingAndGlyphs"
              fontSize="150"
              fontWeight="800"
              className="font-display transition-opacity duration-500 ease-swift group-hover:opacity-0"
              fill="rgba(255,255,255,0.07)"
            >
              KRISHNA
            </text>
            <text
              x="500"
              y="122"
              textAnchor="middle"
              textLength="990"
              lengthAdjust="spacingAndGlyphs"
              fontSize="150"
              fontWeight="800"
              className="font-display opacity-0 transition-opacity duration-500 ease-swift group-hover:opacity-100"
              fill="none"
              stroke="rgb(var(--accent-rgb) / 0.6)"
              strokeWidth="1.5"
            >
              ARKHINS
            </text>
          </svg>
          <p className="hud -mt-1 text-center text-ink-faint opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            same seven letters
          </p>
        </div>

        {/* --------------------------------------------- bottom bar */}
        <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 border-t border-white/8 py-6 sm:flex-row">
          <p className="hud text-ink-faint">
            © {year} {basics.name} · arkhins.com
          </p>

          <div className="flex items-center gap-5">
            <p className="hud text-ink-faint">
              Built with Next.js<span className="text-accent"> · </span>
              hand-rolled CSS
            </p>
            <Link
              href="/#home"
              aria-label="Back to top"
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
