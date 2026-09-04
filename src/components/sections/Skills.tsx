'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import portfolioData from '@/data/portfolio.json';
import content from '@/data/content.json';
import { Panel, Reveal, SectionHead, Ticker } from '@/components/fx';
import { cn, fill } from '@/lib/utils';

const COPY = content.stack;

const { categories, techStack } = portfolioData.skills as unknown as {
  categories: {
    name: string;
    description: string;
    skills: { name: string; icon: string; level: number }[];
  }[];
  techStack: { name: string; icon: string }[];
};

/** Ticker lanes running opposite directions; split so neither repeats the other. */
const LANE_A = techStack.filter((_, i) => i % 2 === 0);
const LANE_B = techStack.filter((_, i) => i % 2 === 1);

/** Meter: circular skill meter drawn as a stroked arc, animating on mount. */
function Meter({ level, icon, name }: { level: number; icon: string; name: string }) {
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.6"
        />
        <motion.circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: level / 100 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          style={{
            filter: 'drop-shadow(0 0 5px rgb(var(--accent-rgb) / 0.8))',
          }}
        />
      </svg>
      <span className="absolute inset-[26%]">
        <Image
          src={fill(COPY.iconPathTemplate, { icon })}
          alt={name}
          fill
          sizes="34px"
          className="object-contain"
        />
      </span>
    </div>
  );
}

/** TechChip: bordered icon-plus-name chip for the tech tickers. */
function TechChip({ name, icon }: { name: string; icon: string }) {
  return (
    <span className="group mx-2 inline-flex items-center gap-2.5 border border-white/8 px-4 py-2.5 transition-colors duration-300 hover:border-accent/45">
      <span className="relative h-5 w-5 shrink-0">
        <Image
          src={icon}
          alt=""
          fill
          sizes="20px"
          className="object-contain opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        />
      </span>
      <span className="hud whitespace-nowrap text-ink-faint transition-colors duration-300 group-hover:text-ink">
        {name}
      </span>
    </span>
  );
}

/** Skills: category selector, animated skill tiles and dual tech tickers. */
export function Skills() {
  const [active, setActive] = useState(0);
  const category = categories[active];

  return (
    <section id="stack" className="band">
      <div className="shell">
        <SectionHead {...COPY.head} />

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
          <Reveal dir="right">
            <ul className="flex flex-col gap-1">
              {categories.map((c, i) => {
                const on = i === active;
                return (
                  <li key={c.name}>
                    <button
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={() => setActive(i)}
                      aria-pressed={on}
                      className="group flex w-full items-center gap-3 py-2 text-left"
                    >
                      <span
                        className={cn(
                          'hud shrink-0 transition-colors',
                          on ? 'text-accent' : 'text-ink-faint'
                        )}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={cn(
                          'font-display text-[clamp(1.25rem,2.6vw,1.9rem)] font-bold leading-tight tracking-tight transition-all duration-400',
                          on
                            ? 'neon-text translate-x-1'
                            : 'stroke-text opacity-70 group-hover:opacity-100'
                        )}
                      >
                        {c.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <AnimatePresence mode="wait">
              <motion.p
                key={category.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="mt-6 max-w-sm border-l border-accent/40 pl-4 text-sm leading-relaxed text-ink-dim"
              >
                {category.description}
              </motion.p>
            </AnimatePresence>
          </Reveal>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.ul
                key={category.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid gap-4 sm:grid-cols-2"
              >
                {category.skills.map((s, i) => (
                  <motion.li
                    key={s.name}
                    initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      delay: i * 0.07,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Panel cut={18} spotlight className="h-full">
                      <div className="flex h-full items-center gap-4 p-5">
                        <Meter level={s.level} icon={s.icon} name={s.name} />
                        <div className="min-w-0">
                          <p className="font-display text-lg font-bold leading-tight">
                            {s.name}
                          </p>
                          <p className="hud mt-1 text-ink-faint">
                            <span className="text-accent">{s.level}</span>{' '}
                            {COPY.levelSuffix}
                          </p>
                        </div>
                      </div>
                    </Panel>
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="relative mt-20 space-y-3 border-y border-white/8 bg-black/20 py-8">
        <Ticker duration={52}>
          {LANE_A.map((t, i) => (
            <TechChip key={`${t.name}-${i}`} {...t} />
          ))}
        </Ticker>
        <Ticker duration={46} reverse>
          {LANE_B.map((t, i) => (
            <TechChip key={`${t.name}-${i}`} {...t} />
          ))}
        </Ticker>
      </div>
    </section>
  );
}
