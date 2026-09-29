'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, MapPin, MoveDown } from 'lucide-react';
import { FaGithub, FaInstagram, FaLinkedin, FaTelegram } from 'react-icons/fa6';
import { FaDiscord } from 'react-icons/fa';
import { SiGoogle } from 'react-icons/si';
import portfolioData from '@/data/portfolio.json';
import content from '@/data/content.json';
import { NeonButton, Ticker } from '@/components/fx';
import { cn, fill } from '@/lib/utils';

const { basics, socialLinks } = portfolioData;
const COPY = content.hero;
const BRAND = content.brand;
const [FIRST, ...REST] = basics.name.split(' ');
const SURNAME = REST.join(' ');

const SOCIAL_ICON: Record<string, React.ReactNode> = {
  github: <FaGithub />,
  linkedin: <FaLinkedin />,
  instagram: <FaInstagram />,
  google: <SiGoogle />,
  discord: <FaDiscord />,
  telegram: <FaTelegram />,
};

const MARQUEE = [
  basics.availability,
  `${basics.location.city} · ${basics.location.country}`,
  ...COPY.marquee,
];

/** Placement for each HUD chip, in content-file order. */
const CHIP_ANCHORS = [
  'right-2 top-0 hidden sm:flex lg:right-16 xl:right-24',
  'right-6 top-[48%] hidden sm:flex lg:right-24 xl:right-32',
  'bottom-[14%] left-8 hidden md:flex lg:left-28',
];

/** Bottom dissolve mask shared by the photo and its echoes. */
const FADE =
  'linear-gradient(to bottom, #000 66%, rgba(0,0,0,0.45) 86%, transparent 99%)';

/** Portrait: transparent PNG with duotone echoes, rim glow and bottom fade. */
function Portrait({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  const maskProps = {
    WebkitMaskImage: `url(${src}), ${FADE}`,
    maskImage: `url(${src}), ${FADE}`,
    WebkitMaskSize: 'contain, 100% 100%',
    maskSize: 'contain, 100% 100%',
    WebkitMaskRepeat: 'no-repeat, no-repeat',
    maskRepeat: 'no-repeat, no-repeat',
    WebkitMaskPosition: 'bottom center, bottom center',
    maskPosition: 'bottom center, bottom center',
    WebkitMaskComposite: 'source-in',
    maskComposite: 'intersect',
  } as React.CSSProperties;

  if (failed) {
    return (
      <div className="relative mx-auto flex aspect-[3/4] w-full max-w-[26rem] items-end justify-center">
        <div
          className="notch-diag absolute inset-0 border border-dashed border-accent/35"
          style={{ ['--notch' as string]: '28px' }}
        />
        <div className="relative z-10 mb-10 px-6 text-center">
          <p className="hud text-accent">{COPY.portraitSlot.title}</p>
          <p className="mt-2 font-mono text-[0.7rem] leading-relaxed text-ink-faint">
            {COPY.portraitSlot.hint}
            <br />
            <span className="text-ink">
              {COPY.portraitSlot.pathPrefix}
              {src}
            </span>
          </p>
        </div>
        <div
          className="absolute inset-x-8 bottom-6 h-24 rounded-[50%] blur-2xl"
          style={{
            background:
              'radial-gradient(ellipse at center, rgb(var(--accent-rgb) / 0.4), transparent 70%)',
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[36rem] lg:ml-auto lg:mr-[-3rem] lg:max-w-[42rem] xl:mr-[-4.5rem]">
      <div
        aria-hidden="true"
        className="absolute inset-x-2 bottom-[6%] h-40 rounded-[50%] opacity-[calc(0.75*var(--fx))] blur-[46px]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgb(var(--accent-rgb) / 0.45), transparent 72%)',
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-4 translate-y-1 opacity-[calc(0.75*var(--fx))] blur-[3px]"
        style={{
          ...maskProps,
          background:
            'linear-gradient(170deg, rgb(var(--accent-rgb) / 0.95), rgb(var(--accent-2-rgb) / 0.55) 65%, transparent)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -translate-x-3 opacity-[calc(0.5*var(--fx))] blur-[5px]"
        style={{
          ...maskProps,
          background: 'rgb(var(--accent-2-rgb) / 0.8)',
        }}
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={fill(COPY.portraitAlt, {
          name: basics.name,
          headline: basics.headline,
        })}
        onError={() => setFailed(true)}
        className="relative z-10 w-full select-none object-contain"
        style={{
          filter:
            'drop-shadow(0 0 34px rgb(var(--accent-rgb) / calc(0.45 * var(--fx)))) drop-shadow(0 22px 44px rgba(0,0,0,0.65))',
          WebkitMaskImage: FADE,
          maskImage: FADE,
        }}
        draggable={false}
      />
    </div>
  );
}

/** RoleRoller: cycles through roles with a vertical slot animation. */
function RoleRoller({ roles }: { roles: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % roles.length), 2600);
    return () => clearInterval(t);
  }, [roles.length]);

  const widest = roles.reduce((a, b) => (b.length > a.length ? b : a), '');

  return (
    <span className="relative inline-flex h-[1.5em] items-center overflow-hidden align-bottom">
      <span aria-hidden="true" className="invisible whitespace-nowrap">
        {widest}
      </span>
      <AnimatePresence initial={false}>
        <motion.span
          key={roles[i]}
          initial={{ y: '105%' }}
          animate={{ y: '0%' }}
          exit={{ y: '-105%' }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center whitespace-nowrap text-accent"
        >
          {roles[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** HudChip: small key/value glass chip floated over the portrait. */
function HudChip({
  k,
  v,
  className,
  delay,
}: {
  k: string;
  v: string;
  className?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className={cn(
        'glass notch-br absolute z-20 items-center gap-2 px-3 py-2',
        className
      )}
      style={{ ['--notch' as string]: '8px' }}
    >
      <span className="hud text-ink-faint">{k}</span>
      <span className="h-3 w-px bg-accent/50" />
      <span className="hud text-ink">{v}</span>
    </motion.div>
  );
}

/** Hero: full-viewport intro with portrait, role roller and marquee. */
export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pb-0 pt-28 md:pt-36"
    >
      <div className="shell relative z-10 flex-1">
        <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_1.12fr] lg:gap-4">
          <div className="relative z-10 order-1 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="inline-flex items-center gap-2.5 border border-accent/35 bg-accent/8 px-3 py-1.5 notch-br"
              style={{ ['--notch' as string]: '9px' }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent animate-pulse-ring" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <span className="hud text-accent">{basics.availability}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 font-display text-[clamp(2.9rem,9.5vw,7.2rem)] font-extrabold leading-[0.86] tracking-tightest"
            >
              <span className="block">{FIRST.toUpperCase()}</span>
              <span className="stroke-text block whitespace-nowrap">
                {SURNAME.toUpperCase()}
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-6 flex items-center gap-3 font-mono text-sm tracking-tight sm:text-base"
            >
              <span className="text-ink-faint">{'{'}</span>
              <RoleRoller roles={basics.roles} />
              <span className="text-ink-faint">{'}'}</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.6 }}
              className="mt-5 max-w-md text-[0.98rem] leading-relaxed text-ink-dim"
            >
              {fill(COPY.blurb, {
                tagline: basics.tagline,
                city: basics.location.city,
              })}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.56, duration: 0.6 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <NeonButton
                href={COPY.primaryHref}
                icon={<ArrowUpRight size={15} />}
              >
                {COPY.primaryAction}
              </NeonButton>
              <NeonButton
                href={basics.resumeUrl}
                external
                variant="ghost"
                icon={<ArrowUpRight size={15} />}
              >
                {COPY.secondaryAction}
              </NeonButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/8 pt-5"
            >
              <span className="hud flex items-center gap-2 text-ink-faint">
                <MapPin size={12} className="text-accent" />
                {basics.location.city}, {basics.location.state}
              </span>
              <span className="hud text-ink-faint">
                {COPY.qualification}
                <span className="text-accent"> · </span>
                {COPY.qualificationDetail}
              </span>
              <div className="flex items-center gap-1">
                {socialLinks.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="grid h-8 w-8 place-items-center text-ink-faint transition-all duration-300 hover:-translate-y-0.5 hover:text-accent"
                  >
                    {SOCIAL_ICON[s.icon] ?? null}
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 order-2 mx-auto w-[80%] max-w-[20rem] sm:max-w-[24rem] lg:mx-0 lg:w-auto lg:max-w-none"
          >
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, x: '-50%', y: '-50%' }}
              transition={{ delay: 0.45, duration: 0.8 }}
              className="pointer-events-none absolute left-[97%] top-[36%] -z-10 aspect-[473/512] w-[62%] opacity-[calc(0.3*var(--fx))]"
            >
              <div
                className="h-full w-full"
                style={{
                  WebkitMaskImage: `url(${BRAND.emblem})`,
                  maskImage: `url(${BRAND.emblem})`,
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  background:
                    'linear-gradient(160deg, rgb(var(--accent-rgb) / 0.95), rgb(var(--accent-2-rgb) / 0.6) 70%, transparent)',
                  filter:
                    'blur(0.4px) drop-shadow(0 0 26px rgb(var(--accent-rgb) / 0.5))',
                }}
              />
            </motion.div>

            <Portrait src={basics.portrait} />

            {COPY.chips.map((chip, i) => (
              <HudChip
                key={chip.key}
                className={CHIP_ANCHORS[i]}
                delay={0.9 + i * 0.15}
                k={chip.key}
                v={chip.value}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 mt-12">
        <div className="border-y border-white/8 bg-black/25 py-3 backdrop-blur-sm">
          <Ticker duration={44} fade>
            {MARQUEE.map((item, i) => (
              <span key={i} className="flex items-center">
                <span className="hud px-6 text-ink-dim">{item}</span>
                <span className="text-accent">{COPY.marqueeSeparator}</span>
              </span>
            ))}
          </Ticker>
        </div>

        <a
          href={COPY.scrollHref}
          className="group mx-auto flex w-fit items-center gap-2 py-5 text-ink-faint transition-colors hover:text-accent"
        >
          <span className="hud">{COPY.scrollLabel}</span>
          <MoveDown
            size={13}
            className="transition-transform duration-500 group-hover:translate-y-1"
          />
        </a>
      </div>
    </section>
  );
}
