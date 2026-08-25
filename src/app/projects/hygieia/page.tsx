'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  CheckCircle,
  Cpu,
  Droplets,
  Github,
  Heart,
  Link2,
  Lock,
  MessageCircle,
  Monitor,
  Palette,
  Ribbon,
  Scan,
  Server,
  Sparkles,
  X,
} from 'lucide-react';
import data from './hygieia.json';
import { ProjectBar } from '@/components/layout/ProjectBar';
import { Footer } from '@/components/layout';
import { NeonButton, Panel, Reveal, SectionHead, Stack, stackChild } from '@/components/fx';
import { cn, fill } from '@/lib/utils';

const {
  meta,
  stats,
  overview,
  models,
  features,
  screens,
  stack,
  security,
  pipelines,
  sections,
  labels,
} = data;

const ICONS: Record<string, React.ElementType> = {
  Heart,
  Droplets,
  Scan,
  Ribbon,
  Cpu,
  CheckCircle,
  Link2,
  MessageCircle,
  Palette,
  Monitor,
  Server,
};

type Screen = (typeof screens)[number];

export default function ProjectCaseStudy() {
  const [lightbox, setLightbox] = useState<Screen | null>(null);
  const [pipeline, setPipeline] = useState(models[0].name);

  const activeModel = models.find((m) => m.name === pipeline)!;
  const activePipeline = pipelines[pipeline as keyof typeof pipelines];

  return (
    <>
      <ProjectBar name={meta.name} />

      <main>
        {/* ============================================================ hero */}
        <section className="relative overflow-hidden pb-20 pt-32 md:pt-40">
          <div className="shell">
            <div className="grid items-end gap-10 lg:grid-cols-[1.25fr_1fr]">
              <div>
                <Reveal dir="none">
                  <div className="flex items-center gap-3">
                    <span className="hud border border-accent/40 px-2 py-1 text-accent">
                      {meta.year}
                    </span>
                    <span className="hazard h-3 w-10 opacity-70" />
                    <span className="eyebrow">{meta.role}</span>
                  </div>
                </Reveal>

                <Reveal delay={0.06}>
                  <div className="mt-7 flex flex-wrap items-center gap-5">
                    <Image
                      src={meta.logo}
                      alt=""
                      width={72}
                      height={72}
                      className="h-16 w-16 object-contain md:h-20 md:w-20"
                      priority
                    />
                    <h1 className="font-display text-[clamp(2.8rem,9vw,6.5rem)] font-extrabold leading-[0.86] tracking-tightest">
                      {meta.name}
                    </h1>
                  </div>
                </Reveal>

                <Reveal delay={0.12}>
                  <p className="mt-6 max-w-xl font-display text-[clamp(1.05rem,2.2vw,1.5rem)] font-semibold leading-snug text-ink-dim">
                    {meta.title}
                    <span className="neon-text"> — </span>
                    {meta.tagline}
                  </p>
                </Reveal>

                <Reveal delay={0.2}>
                  <ul className="mt-7 flex flex-wrap gap-2">
                    {meta.badges.map((b) => (
                      <li
                        key={b.label}
                        className={cn(
                          'border px-3 py-1.5 font-mono text-[0.68rem]',
                          b.tone === 'accent'
                            ? 'border-accent/45 bg-accent/10 text-accent'
                            : 'border-white/12 text-ink-dim'
                        )}
                      >
                        {b.label}
                      </li>
                    ))}
                  </ul>
                </Reveal>

                <Reveal delay={0.28}>
                  <div className="mt-9 flex flex-wrap gap-3">
                    <NeonButton
                      href={meta.repo}
                      external
                      icon={<Github size={15} />}
                    >
                      {labels.sourceAction}
                    </NeonButton>
                    <NeonButton
                      href={labels.backHref}
                      variant="ghost"
                      icon={<ArrowUpRight size={15} />}
                    >
                      {labels.otherProjectsAction}
                    </NeonButton>
                  </div>
                </Reveal>
              </div>

              {/* stat block */}
              <Reveal dir="left" delay={0.2}>
                <Panel hot cut={24}>
                  <dl className="grid grid-cols-2">
                    {stats.map((s, i) => (
                      <div
                        key={s.label}
                        className={cn(
                          'p-6',
                          i % 2 === 0 && 'border-r border-white/8',
                          i < 2 && 'border-b border-white/8'
                        )}
                      >
                        <dd className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-none neon-text">
                          {s.value}
                        </dd>
                        <dt className="hud mt-2 text-ink-faint">{s.label}</dt>
                      </div>
                    ))}
                  </dl>
                </Panel>
              </Reveal>
            </div>

            {/* cover */}
            <Reveal delay={0.34} className="mt-16">
              <Panel cut={32} className="group/cover overflow-hidden">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={meta.cover}
                    alt={`${meta.name} platform cover`}
                    fill
                    sizes="100vw"
                    priority
                    className="object-cover transition-transform duration-[1.4s] ease-swift group-hover/cover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[calc(0.3*var(--fx))] mix-blend-overlay"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(to bottom, rgba(255,255,255,0.35) 0 1px, transparent 1px 4px)',
                    }}
                  />
                </div>
              </Panel>
            </Reveal>
          </div>
        </section>

        {/* ======================================================== overview */}
        <section className="band pt-0">
          <div className="shell">
            <SectionHead {...sections.overview} />
            <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
              <div className="space-y-5">
                {overview.map((p, i) => (
                  <Reveal key={i} delay={i * 0.08}>
                    <p
                      className={cn(
                        'leading-relaxed',
                        i === 0
                          ? 'font-display text-[clamp(1.1rem,2.1vw,1.45rem)] font-semibold text-ink'
                          : 'text-[0.96rem] text-ink-dim'
                      )}
                    >
                      {p}
                    </p>
                  </Reveal>
                ))}
              </div>

              <Stack className="grid gap-3 sm:grid-cols-2">
                {features.map((f) => {
                  const Icon = ICONS[f.icon] ?? Sparkles;
                  return (
                    <motion.div key={f.title} variants={stackChild}>
                      <Panel cut={14} spotlight className="h-full">
                        <div className="p-5">
                          <Icon size={17} className="text-accent" />
                          <h3 className="mt-3 font-display text-sm font-bold">
                            {f.title}
                          </h3>
                          <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-dim">
                            {f.description}
                          </p>
                        </div>
                      </Panel>
                    </motion.div>
                  );
                })}
              </Stack>
            </div>
          </div>
        </section>

        {/* ========================================================== models */}
        <section className="band pt-0">
          <div className="shell">
            <SectionHead {...sections.models} />

            <Stack className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {models.map((m) => {
                const Icon = ICONS[m.icon] ?? Cpu;
                return (
                  <motion.div key={m.name} variants={stackChild}>
                    <Panel
                      cut={18}
                      spotlight
                      className="group/m h-full"
                    >
                      <div
                        className="relative h-full p-6"
                        style={{ ['--hue' as string]: m.hue }}
                      >
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/m:opacity-100"
                          style={{
                            background: `radial-gradient(120% 80% at 100% 0%, ${m.hue}22, transparent 60%)`,
                          }}
                        />
                        <div className="relative flex items-start justify-between gap-3">
                          <span
                            className="grid h-11 w-11 place-items-center border"
                            style={{
                              borderColor: `${m.hue}55`,
                              background: `${m.hue}14`,
                              color: m.hue,
                            }}
                          >
                            <Icon size={19} />
                          </span>
                          <span className="hud text-right text-ink-faint">
                            {labels.rocAuc}
                            <br />
                            <span className="text-ink">{m.rocAuc}</span>
                          </span>
                        </div>

                        <h3 className="relative mt-5 font-display text-lg font-bold">
                          {m.name}
                        </h3>
                        <p className="relative mt-1 text-[0.8rem] text-ink-dim">
                          {m.params}
                        </p>

                        <div className="relative mt-5 flex items-end justify-between border-t border-white/8 pt-4">
                          <span
                            className="font-display text-3xl font-extrabold leading-none"
                            style={{
                              color: m.hue,
                              textShadow: `0 0 22px ${m.hue}66`,
                            }}
                          >
                            {m.accuracy}
                          </span>
                          <span className="hud text-right text-ink-faint">
                            {m.architecture}
                          </span>
                        </div>
                      </div>
                    </Panel>
                  </motion.div>
                );
              })}
            </Stack>

            {/* comparison table */}
            <Reveal className="mt-8">
              <Panel cut={18} className="overflow-hidden">
                <div className="rail-scroll">
                  <table className="w-full min-w-[46rem] text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        {labels.tableHeaders.map((h) => (
                          <th
                            key={h}
                            className="hud px-5 py-4 font-medium text-ink-faint"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {models.map((m) => (
                        <tr
                          key={m.name}
                          className="border-b border-white/6 transition-colors last:border-0 hover:bg-white/[0.03]"
                        >
                          <td className="px-5 py-4 text-sm">
                            <span className="flex items-center gap-2.5">
                              <span
                                className="h-2 w-2 rotate-45"
                                style={{ background: m.hue }}
                              />
                              {m.name}
                            </span>
                          </td>
                          <td
                            className="px-5 py-4 font-mono text-sm font-semibold"
                            style={{ color: m.hue }}
                          >
                            {m.accuracy}
                          </td>
                          <td className="px-5 py-4 font-mono text-sm text-ink-dim">
                            {m.rocAuc}
                          </td>
                          <td className="px-5 py-4 font-mono text-sm text-ink-dim">
                            {m.samples}
                          </td>
                          <td className="px-5 py-4 text-sm text-ink-faint">
                            {m.architecture}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </Reveal>
          </div>
        </section>

        {/* ======================================================= pipelines */}
        <section className="band pt-0">
          <div className="shell">
            <SectionHead {...sections.pipelines} />

            {/* tabs */}
            <Reveal className="mt-10 flex flex-wrap gap-2">
              {models.map((m) => {
                const on = pipeline === m.name;
                return (
                  <button
                    key={m.name}
                    onClick={() => setPipeline(m.name)}
                    aria-pressed={on}
                    className={cn(
                      'border px-3.5 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-all duration-300',
                      on
                        ? 'text-bg'
                        : 'border-white/10 text-ink-faint hover:border-white/30 hover:text-ink'
                    )}
                    style={
                      on
                        ? {
                            background: m.hue,
                            borderColor: m.hue,
                            boxShadow: `0 0 24px ${m.hue}66`,
                          }
                        : undefined
                    }
                  >
                    {m.name}
                  </button>
                );
              })}
            </Reveal>

            <AnimatePresence mode="wait">
              <motion.div
                key={pipeline}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                <Panel cut={26}>
                  <div className="p-6 md:p-9">
                    <div className="flex flex-wrap items-center gap-4 border-b border-white/8 pb-6">
                      <h3 className="font-display text-xl font-bold">
                        {activeModel.name}
                      </h3>
                      <span className="hud text-ink-faint">
                        {activeModel.params} · {activeModel.architecture}
                      </span>
                      <span
                        className="hud ml-auto px-2.5 py-1"
                        style={{
                          background: `${activeModel.hue}18`,
                          color: activeModel.hue,
                        }}
                      >
                        {activeModel.samples} {labels.samplesSuffix}
                      </span>
                    </div>

                    <div className="mt-8 grid gap-10 lg:grid-cols-2">
                      {/* flow */}
                      <div>
                        <p className="eyebrow mb-5">{labels.pipelineFlow}</p>
                        <ol className="relative space-y-3">
                          <span
                            aria-hidden="true"
                            className="absolute bottom-4 left-[1.1rem] top-4 w-px"
                            style={{ background: `${activeModel.hue}44` }}
                          />
                          {activePipeline.steps.map((s, i) => (
                            <motion.li
                              key={s.title}
                              initial={{ opacity: 0, x: -14 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.07, duration: 0.4 }}
                              className="relative flex gap-4"
                            >
                              <span
                                className="relative z-10 grid h-9 w-9 shrink-0 place-items-center font-mono text-xs font-bold"
                                style={{
                                  background: `${activeModel.hue}1f`,
                                  border: `1px solid ${activeModel.hue}66`,
                                  color: activeModel.hue,
                                }}
                              >
                                {i + 1}
                              </span>
                              <div className="min-w-0 pt-1">
                                <p className="text-sm font-semibold">{s.title}</p>
                                <p className="mt-0.5 text-[0.8rem] leading-relaxed text-ink-dim">
                                  {s.description}
                                </p>
                              </div>
                            </motion.li>
                          ))}
                        </ol>
                      </div>

                      {/* details */}
                      <div>
                        <p className="eyebrow mb-5">
                          {activePipeline.detailsTitle}
                        </p>
                        <ul className="flex flex-wrap gap-2">
                          {activePipeline.details.map((d, i) => (
                            <motion.li
                              key={d}
                              initial={{ opacity: 0, scale: 0.94 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.025, duration: 0.3 }}
                              className={cn(
                                'border px-2.5 py-1.5 font-mono text-[0.7rem]',
                                d.includes('⚠')
                                  ? 'border-amber-400/40 text-amber-300'
                                  : 'border-white/10 text-ink-dim'
                              )}
                            >
                              {d}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Panel>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ========================================================= screens */}
        <section className="band pt-0">
          <div className="shell">
            <SectionHead {...sections.screens} />

            <div className="mt-14 space-y-20 md:space-y-28">
              {screens.map((s, i) => {
                const flip = i % 2 === 1;
                return (
                  <Reveal key={s.id} delay={0.04}>
                    <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
                      <button
                        onClick={() => setLightbox(s)}
                        className={cn(
                          'group/shot relative block w-full text-left',
                          flip && 'md:order-2'
                        )}
                        aria-label={fill(labels.lightboxAria, { title: s.title })}
                      >
                        <Panel cut={22} className="overflow-hidden">
                          <div className="relative aspect-[16/10] w-full bg-black/30">
                            <Image
                              src={s.src}
                              alt={s.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-contain transition-transform duration-700 ease-swift group-hover/shot:scale-[1.04]"
                            />
                          </div>
                        </Panel>
                        <span className="hud absolute bottom-4 right-4 border border-accent/40 bg-black/60 px-2 py-1 text-accent opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover/shot:opacity-100">
                          {labels.expandHint}
                        </span>
                      </button>

                      <div className={cn(flip && 'md:order-1')}>
                        <span className="hud text-accent">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <h3 className="mt-3 font-display text-[clamp(1.4rem,3vw,2.1rem)] font-bold leading-tight tracking-tight">
                          {s.title}
                        </h3>
                        <p className="mt-4 max-w-md leading-relaxed text-ink-dim">
                          {s.description}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================================================== architecture */}
        <section className="band pt-0">
          <div className="shell">
            <SectionHead {...sections.architecture} />

            <div className="mt-12 grid gap-4 lg:grid-cols-2">
              {stack.map((layer, i) => {
                const Icon = ICONS[layer.icon] ?? Server;
                return (
                  <Reveal key={layer.layer} dir={i === 0 ? 'right' : 'left'}>
                    <Panel cut={22} spotlight className="h-full">
                      <div className="p-7">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center border border-accent/35 text-accent">
                            <Icon size={17} />
                          </span>
                          <div>
                            <h3 className="font-display text-lg font-bold">
                              {layer.layer}
                            </h3>
                            <p className="hud text-ink-faint">{layer.runtime}</p>
                          </div>
                        </div>
                        <ul className="mt-6 flex flex-wrap gap-2">
                          {layer.items.map((t) => (
                            <li
                              key={t}
                              className="border border-white/10 px-2.5 py-1.5 font-mono text-[0.7rem] text-ink-dim transition-colors hover:border-accent/40 hover:text-accent"
                            >
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Panel>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ======================================================== security */}
        <section className="band pt-0">
          <div className="shell">
            <SectionHead {...sections.security} />

            <Stack className="mt-12 grid gap-4 md:grid-cols-2">
              {security.map((layer, i) => (
                <motion.div key={layer.title} variants={stackChild}>
                  <Panel cut={18} spotlight className="h-full">
                    <div className="relative h-full p-6">
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-1 -top-4 font-display text-[5rem] font-extrabold leading-none text-white/[0.035]"
                      >
                        {i + 1}
                      </span>
                      <div className="relative flex items-center gap-3">
                        <Lock size={15} className="text-accent" />
                        <h3 className="font-display text-base font-bold">
                          {layer.title}
                        </h3>
                      </div>
                      <ul className="relative mt-4 space-y-2">
                        {layer.items.map((it) => (
                          <li
                            key={it}
                            className="flex items-start gap-2.5 text-[0.85rem] text-ink-dim"
                          >
                            <CheckCircle
                              size={13}
                              className="mt-0.5 shrink-0 text-accent/70"
                            />
                            {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Panel>
                </motion.div>
              ))}
            </Stack>
          </div>
        </section>

        {/* =========================================================== outro */}
        <section className="band pt-0">
          <div className="shell">
            <Reveal>
              <Panel hot cut={30}>
                <div className="flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center md:p-12">
                  <div>
                    <p className="eyebrow">{labels.outroEyebrow}</p>
                    <h2 className="mt-3 font-display text-[clamp(1.6rem,4vw,2.6rem)] font-extrabold leading-tight tracking-tightest">
                      {labels.outroTitle}{' '}
                      <span className="neon-text">{labels.outroAccent}</span>
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <NeonButton
                      href={meta.repo}
                      external
                      icon={<Github size={15} />}
                    >
                      {labels.outroRepoAction}
                    </NeonButton>
                    <NeonButton
                      href={labels.backHref}
                      variant="ghost"
                      icon={<ArrowUpRight size={15} />}
                    >
                      {labels.outroBackAction}
                    </NeonButton>
                  </div>
                </div>
              </Panel>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />

      {/* ========================================================= lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md md:p-10"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label={lightbox.title}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between gap-4">
                <span className="hud text-accent">{lightbox.title}</span>
                <button
                  onClick={() => setLightbox(null)}
                  aria-label={labels.closeLabel}
                  className="grid h-9 w-9 place-items-center border border-white/15 text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="relative h-[76vh] w-full border border-white/12 bg-black/50">
                <Image
                  src={lightbox.src}
                  alt={lightbox.title}
                  fill
                  sizes="100vw"
                  quality={100}
                  className="object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
