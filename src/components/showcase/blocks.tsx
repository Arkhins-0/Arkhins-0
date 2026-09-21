'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowUpRight, Github } from 'lucide-react';
import content from '@/data/content.json';
import { NeonButton, Panel, Reveal, SectionHead, Stack, stackChild } from '@/components/fx';
import { cn } from '@/lib/utils';
import type { Action, Block, Head } from '@/types/content';
import { Compare, Frame, Gallery, Icon, Phones } from './ui';

const COPY = content.projectPage;

/** Anchor id so hero buttons can deep-link to a section (e.g. "#s-pipelines"). */
const anchor = (head: Head | undefined, type: string, i: number) =>
  `s-${(head?.label ?? type).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || i}`;

export function ActionButton({ action }: { action: Action }) {
  const ext = action.external ?? /^https?:/i.test(action.href);
  const icon = ext && /github\.com/.test(action.href) ? <Github size={15} /> : <ArrowUpRight size={15} />;
  return (
    <NeonButton href={action.href} external={ext || undefined} variant={action.kind ?? 'solid'} icon={icon}>
      {action.label}
    </NeonButton>
  );
}

export function BlockView({ block, index }: { block: Block; index: number }) {
  const head = 'head' in block ? block.head : undefined;
  const id = anchor(head, block.type, index);

  switch (block.type) {
    case 'stats':
      return (
        <section className="shell mt-14" id={id}>
          <Reveal>
            <dl className="sc-card grid grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
              {block.items.map((s) => (
                <div key={s.label} className="p-6" style={{ background: 'var(--sc-surface-2)' }}>
                  <dd className="neon-text font-display text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-none">{s.value}</dd>
                  <dt className="hud mt-2 text-ink-faint">{s.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>
      );

    case 'overview':
      return (
        <section className="band pt-0" id={id}>
          <div className="shell">
            <SectionHead {...block.head} />
            <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
              <div className="space-y-5">
                {block.paragraphs.map((p, i) => (
                  <Reveal key={i} delay={i * 0.08}>
                    <p className={cn('leading-relaxed', i === 0 ? 'font-display text-[clamp(1.1rem,2.1vw,1.45rem)] font-semibold text-ink' : 'text-[0.96rem] text-ink-dim')}>{p}</p>
                  </Reveal>
                ))}
              </div>
              {block.features && (
                <Stack className="grid gap-3 sm:grid-cols-2">
                  {block.features.map((f) => (
                    <motion.div key={f.title} variants={stackChild} className="sc-card h-full p-5">
                      <Icon name={f.icon} className="text-accent" />
                      <h3 className="mt-3 font-display text-sm font-bold">{f.title}</h3>
                      <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-dim">{f.description}</p>
                    </motion.div>
                  ))}
                </Stack>
              )}
            </div>
          </div>
        </section>
      );

    case 'cards':
      return (
        <section className="band pt-0" id={id}>
          <div className="shell">
            <SectionHead {...block.head} />
            <Stack className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {block.items.map((m) => {
                const hue = m.hue ?? 'var(--accent)';
                return (
                  <motion.div key={m.title} variants={stackChild} className="sc-card group/m h-full p-6" style={{ ['--hue' as string]: hue }}>
                    <span aria-hidden className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-500 group-hover/m:opacity-100" style={{ background: `radial-gradient(120% 80% at 100% 0%, ${hue}22, transparent 60%)` }} />
                    <div className="relative flex items-start justify-between gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-[calc(var(--sc-radius)*0.5)] border" style={{ borderColor: `${hue}55`, background: `${hue}14`, color: hue }}>
                        <Icon name={m.icon} size={19} />
                      </span>
                      {m.valueLabel && <span className="hud text-right text-ink-faint">{m.valueLabel}</span>}
                    </div>
                    <h3 className="relative mt-5 font-display text-lg font-bold">{m.title}</h3>
                    {m.subtitle && <p className="relative mt-1 text-[0.8rem] text-ink-dim">{m.subtitle}</p>}
                    {(m.value || m.meta) && (
                      <div className="relative mt-5 flex items-end justify-between gap-3 border-t border-white/8 pt-4">
                        {m.value && <span className="font-display text-3xl font-extrabold leading-none" style={{ color: hue, textShadow: `0 0 22px ${hue}66` }}>{m.value}</span>}
                        {m.meta && <span className="hud text-right text-ink-faint">{m.meta}</span>}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </Stack>
          </div>
        </section>
      );

    case 'table':
      return (
        <section className={cn('shell', block.head ? 'band pt-0' : '-mt-10 mb-20')} id={id}>
          {block.head && <SectionHead {...block.head} className="mb-8" />}
          <Reveal>
            <div className="sc-card overflow-x-auto">
              <table className="w-full min-w-[44rem] text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    {block.columns.map((c) => <th key={c} className="hud px-5 py-4 font-medium text-ink-faint">{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((r, i) => (
                    <tr key={i} className="border-b border-white/6 transition-colors last:border-0 hover:bg-white/[0.03]">
                      {r.map((cell, j) => (
                        <td key={j} className={cn('px-5 py-4 text-sm', j === 0 ? '' : 'font-mono text-ink-dim')} style={j === 1 && block.hues?.[i] ? { color: block.hues[i], fontWeight: 600 } : undefined}>
                          {j === 0 ? (
                            <span className="flex items-center gap-2.5">
                              {block.hues?.[i] && <span className="h-2 w-2 rotate-45" style={{ background: block.hues[i] }} />}
                              {cell}
                            </span>
                          ) : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>
      );

    case 'tabs':
      return <Tabs block={block} id={id} />;

    case 'steps':
      return (
        <section className="band pt-0" id={id}>
          <div className="shell">
            <SectionHead {...block.head} />
            <div className="mt-6 divide-y divide-white/8">
              {block.items.map((s, i) => {
                const flip = i % 2 === 1;
                return (
                  <Reveal key={s.title} className="grid items-center gap-8 py-12 md:grid-cols-[5fr_7fr] md:gap-14">
                    <div className={cn(flip && 'md:order-2')}>
                      <span className="hud text-accent">{String(i + 1).padStart(2, '0')}</span>
                      <h3 className="mt-3 font-display text-[clamp(1.4rem,3vw,2.1rem)] font-bold leading-tight tracking-tight">{s.title}</h3>
                      <p className="mt-4 max-w-md leading-relaxed text-ink-dim">{s.body}</p>
                      {s.ticks && (
                        <ul className="sc-ticks mt-5 space-y-2 text-sm text-ink">
                          {s.ticks.map((t) => <li key={t}>{t}</li>)}
                        </ul>
                      )}
                    </div>
                    <Frame image={s.image} tall={s.tall} tilt={flip ? 'left' : 'right'} className={cn(flip && 'md:order-1')} />
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      );

    case 'compare':
      return (
        <section className="band pt-0" id={id}>
          <div className="shell">
            <SectionHead {...block.head} />
            <Reveal className="mt-12"><Compare image={block.image} /></Reveal>
          </div>
        </section>
      );

    case 'phones':
      return (
        <section className="band pt-0" id={id}>
          <div className="shell">
            <SectionHead {...block.head} />
            <Reveal className="mt-8"><Phones items={block.items} /></Reveal>
          </div>
        </section>
      );

    case 'gallery':
      return (
        <section className="band pt-0" id={id}>
          <div className="shell">
            <SectionHead {...block.head} />
            <Reveal className="mt-12"><Gallery items={block.items} /></Reveal>
          </div>
        </section>
      );

    case 'columns':
      return (
        <section className="band pt-0" id={id}>
          <div className="shell">
            <SectionHead {...block.head} />
            <Stack className="mt-12 grid gap-4 md:grid-cols-2">
              {block.columns.map((c) => (
                <motion.div key={c.title} variants={stackChild} className="sc-card h-full p-6">
                  <h3 className="hud mb-4 text-ink-faint">{c.title}</h3>
                  {c.style === 'chips' ? (
                    <ul className="flex flex-wrap gap-2">
                      {c.items.map((t) => <li key={t} className="border border-white/10 px-2.5 py-1.5 font-mono text-[0.7rem] text-ink-dim transition-colors hover:border-accent/40 hover:text-accent">{t}</li>)}
                    </ul>
                  ) : (
                    <ul className="sc-ticks space-y-2 text-[0.85rem] text-ink-dim">
                      {c.items.map((t) => <li key={t}>{t}</li>)}
                    </ul>
                  )}
                </motion.div>
              ))}
            </Stack>
          </div>
        </section>
      );

    case 'markdown':
      return <MarkdownBlock head={block.head} file={block.file} id={id} />;

    case 'outro':
      return (
        <section className="band pt-0">
          <div className="shell">
            <Reveal>
              <Panel hot cut={30}>
                <div className="flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center md:p-12">
                  <div>
                    <p className="eyebrow">End of case study</p>
                    <h2 className="mt-3 font-display text-[clamp(1.6rem,4vw,2.6rem)] font-extrabold leading-tight tracking-tightest">
                      {block.title} {block.accentWord && <span className="neon-text">{block.accentWord}</span>}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {block.actions.map((a) => <ActionButton key={a.href + a.label} action={a} />)}
                  </div>
                </div>
              </Panel>
            </Reveal>
          </div>
        </section>
      );
  }
}

function Tabs({ block, id }: { block: Extract<Block, { type: 'tabs' }>; id: string }) {
  const [active, setActive] = useState(block.tabs[0].id);
  const tab = block.tabs.find((t) => t.id === active) ?? block.tabs[0];
  const hue = tab.hue ?? 'var(--accent)';

  return (
    <section className="band pt-0" id={id}>
      <div className="shell">
        <SectionHead {...block.head} />
        <Reveal className="mt-10 flex flex-wrap gap-2">
          {block.tabs.map((t) => {
            const on = t.id === active;
            return (
              <button key={t.id} onClick={() => setActive(t.id)} aria-pressed={on}
                className={cn('rounded-full border px-3.5 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-all duration-300', on ? 'text-bg' : 'border-white/10 text-ink-faint hover:border-white/30 hover:text-ink')}
                style={on ? { background: t.hue ?? 'var(--accent)', borderColor: t.hue ?? 'var(--accent)', boxShadow: `0 0 24px ${t.hue ?? 'var(--accent)'}66` } : undefined}>
                {t.label}
              </button>
            );
          })}
        </Reveal>
        <AnimatePresence mode="wait">
          <motion.div key={tab.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="sc-card mt-6 p-6 md:p-9">
            <div className="flex flex-wrap items-center gap-4 border-b border-white/8 pb-6">
              <h3 className="font-display text-xl font-bold">{tab.label}</h3>
              {tab.subtitle && <span className="hud text-ink-faint">{tab.subtitle}</span>}
            </div>
            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              <ol className="relative space-y-3">
                <span aria-hidden className="absolute bottom-4 left-[1.1rem] top-4 w-px" style={{ background: `${hue}44` }} />
                {tab.steps.map((s, i) => (
                  <motion.li key={s.title} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07, duration: 0.4 }} className="relative flex gap-4">
                    <span className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-xs font-bold" style={{ background: `${hue}1f`, border: `1px solid ${hue}66`, color: hue }}>{i + 1}</span>
                    <div className="min-w-0 pt-1">
                      <p className="text-sm font-semibold">{s.title}</p>
                      <p className="mt-0.5 text-[0.8rem] leading-relaxed text-ink-dim">{s.description}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
              {tab.details && (
                <div>
                  {tab.detailsTitle && <p className="eyebrow mb-5">{tab.detailsTitle}</p>}
                  <ul className="flex flex-wrap gap-2">
                    {tab.details.map((d, i) => (
                      <motion.li key={d} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.025, duration: 0.3 }}
                        className={cn('border px-2.5 py-1.5 font-mono text-[0.7rem]', d.includes('⚠') ? 'border-amber-400/40 text-amber-300' : 'border-white/10 text-ink-dim')}>
                        {d}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function MarkdownBlock({ head, file, id }: { head: Head; file: string; id: string }) {
  const [state, setState] = useState<{ status: 'loading' | 'ready' | 'error'; md: string }>({ status: 'loading', md: '' });

  useEffect(() => {
    let cancelled = false;
    fetch(file)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((md) => !cancelled && setState({ status: 'ready', md }))
      .catch(() => !cancelled && setState({ status: 'error', md: '' }));
    return () => { cancelled = true; };
  }, [file]);

  return (
    <section className="band pt-0" id={id}>
      <div className="shell">
        <SectionHead {...head} />
        <Reveal className="mt-12">
          <div className="sc-card markdown-content p-6 md:p-10">
            {state.status === 'loading' && <p className="hud animate-pulse text-ink-faint">{COPY.markdown.loading}</p>}
            {state.status === 'error' && <p className="hud text-rose">{COPY.markdown.error}</p>}
            {state.status === 'ready' && (
              <article className="prose-neon max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{state.md}</ReactMarkdown>
              </article>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
