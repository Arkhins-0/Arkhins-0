/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Chakra_Petch, Inter, Orbitron } from 'next/font/google';
import { Check, Trophy } from 'lucide-react';
import type { Action, Block, Head, ThemedImage } from '@/types/content';
import type { PageGuest, ShowcasePageProps } from '../types';
import { CastSprite, castSpots } from '../cast';
import { Icon, LightboxProvider } from '../../ui';
import { Garage, MarkdownScreen, SettingsScreen, Shot } from './client';
import './ctru.css';
import './cast.css';

/**
 * CTR Sports, site and CMS, as a modern racing game's menus: the hero is the main menu, and each
 * block is one of the game's screens (live feed, career stats, briefing, side select, standings,
 * settings, loading tips, photo mode, tuning, garage, event results). Every word comes from props.
 */

const display = Orbitron({ subsets: ['latin'], weight: ['700', '800', '900'], variable: '--ctru-display', display: 'swap' });
const ui = Chakra_Petch({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--ctru-ui', display: 'swap' });
const body = Inter({ subsets: ['latin'], variable: '--ctru-body', display: 'swap' });

/** Decorative screen names shown behind each section heading. */
const SCREEN: Partial<Record<Block['type'], string>> = {
  overview: 'Briefing',
  duo: 'Select',
  table: 'Standings',
  tabs: 'Settings',
  steps: 'Loading',
  phones: 'Photo',
  columns: 'Tuning',
  gallery: 'Garage',
  cards: 'Modes',
  compare: 'Replay',
  markdown: 'Manual',
};

/** Fixed pseudo-random streak positions so the server and client render the same markup. */
const STREAKS = [
  [12, 38, 0, 2.6],
  [24, 22, 1.1, 3.4],
  [37, 46, 0.5, 2.9],
  [49, 30, 2.2, 3.8],
  [58, 52, 1.6, 2.4],
  [68, 26, 0.2, 3.1],
  [77, 40, 2.8, 2.7],
  [86, 34, 1.3, 3.6],
  [93, 48, 0.8, 2.2],
];

function Streaks() {
  return (
    <div className="ctru-streaks" aria-hidden="true">
      {STREAKS.map(([top, w, delay, dur], i) => (
        <i key={i} style={{ top: `${top}%`, width: `${w}%`, animationDelay: `${delay}s`, animationDuration: `${dur}s` }} />
      ))}
    </div>
  );
}

function Prompts({ items }: { items: [string, string][] }) {
  return (
    <div className="ctru-prompts" aria-hidden="true">
      {items.map(([k, label]) => (
        <span key={k + label}>
          <i className={`ctru-kb ctru-kb--${k.toLowerCase()}`}>{k}</i> {label}
        </span>
      ))}
    </div>
  );
}

function ActionLink({ action, className, children }: { action: Action; className: string; children: React.ReactNode }) {
  if (action.external || /^https?:\/\//.test(action.href)) {
    return (
      <a href={action.href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
        <span className="ctru-sr"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={action.href} className={className}>
      {children}
    </Link>
  );
}

function hostOf(href: string) {
  try {
    return new URL(href).host.replace(/^www\./, '');
  } catch {
    return href.startsWith('/') ? 'portfolio' : href;
  }
}

/** Actions as skewed menu tiles; the first solid one is the big "start" tile. */
function MenuTiles({ actions, label }: { actions: Action[]; label: string }) {
  const primary = actions.findIndex((a) => a.kind !== 'ghost');
  return (
    <nav className="ctru-menu" aria-label={label}>
      {actions.map((a, i) => {
        const isPrimary = i === primary;
        return (
          <ActionLink
            key={a.href + a.label}
            action={a}
            className={`ctru-tile ${isPrimary ? 'ctru-tile--primary' : a.kind === 'ghost' ? 'ctru-tile--ghost' : ''}`}
          >
            <span className="ctru-tile-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <span className="ctru-tile-body">
              <span className="ctru-tile-label">{a.label}</span>
              <span className="ctru-tile-sub">{hostOf(a.href)}</span>
            </span>
            <i className={`ctru-kb ${isPrimary ? '' : 'ctru-kb--x'}`} aria-hidden="true">{isPrimary ? 'A' : 'X'}</i>
          </ActionLink>
        );
      })}
    </nav>
  );
}

function SectionHead({ head, screen, prompts }: { head: Head; screen?: string; prompts?: [string, string][] }) {
  return (
    <div className="ctru-head">
      {screen && <span className="ctru-head-screen" aria-hidden="true">{screen}</span>}
      <p className="ctru-head-tag">
        <span>{head.index}</span>
        <span>{head.label}</span>
      </p>
      <h2 className="ctru-h2">
        {head.title} {head.accentWord && <em>{head.accentWord}</em>}
      </h2>
      {head.lede && <p className="ctru-head-lede">{head.lede}</p>}
      {prompts && <Prompts items={prompts} />}
    </div>
  );
}

// ------------------------------------------------------------------ guest sprites

/**
 * Sprite spots in page order. Each is tied to a screen of the game menu; a spot whose screen is not
 * in the document hands its pose to the pit-crew row so every pose still shows.
 */
const SPOTS = ['hero', 'stats', 'overview', 'duo:0', 'duo:1', 'table', 'tabs', 'steps', 'gallery', 'outro'] as const;
type SpotKey = (typeof SPOTS)[number];
type SpotFn = (key: SpotKey) => string | undefined;

/** One pose standing on a glowing pad, with a decorative nameplate. Space is reserved by the layout. */
function Driver({
  src,
  guest,
  tag,
  size = 'm',
  flip,
  className,
}: {
  src?: string;
  guest?: PageGuest;
  tag?: string;
  size?: 's' | 'm' | 'l';
  flip?: boolean;
  className?: string;
}) {
  if (!src) return null;
  return (
    <figure className={`ctru-drv ctru-drv--${size}${flip ? ' ctru-drv--flip' : ''}${className ? ` ${className}` : ''}`}>
      <CastSprite src={src} guest={guest} className="ctru-drv-img" />
      <span className="ctru-drv-pad" aria-hidden="true" />
      {tag && (
        <figcaption className="ctru-drv-tag" aria-hidden="true">
          <span>{tag}</span>
        </figcaption>
      )}
    </figure>
  );
}

/** Content with a driver beside it: the sprite sits in its own grid column, never over the content. */
function WithDriver({
  src,
  guest,
  tag,
  size,
  side = 'right',
  keep,
  className,
  children,
}: {
  src?: string;
  guest?: PageGuest;
  tag?: string;
  size?: 's' | 'm' | 'l';
  side?: 'left' | 'right';
  keep?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  if (!src) return <>{children}</>;
  const cls = `ctru-row ctru-row--${side}${keep ? ' ctru-row--keep' : ''}${className ? ` ${className}` : ''}`;
  return (
    <div className={cls}>
      <div className="ctru-row-main">{children}</div>
      <Driver src={src} guest={guest} tag={tag} size={size} />
    </div>
  );
}

/** Poses beyond the page's spots line up as the team on the results screen. */
function PitCrew({ poses, guest }: { poses: string[]; guest?: PageGuest }) {
  if (!poses.length) return null;
  return (
    <div className="ctru-crew">
      <p className="ctru-label">Pit crew</p>
      <ul>
        {poses.map((src, i) => (
          <li key={`${src}-${i}`}>
            <Driver src={src} guest={guest} size="s" />
          </li>
        ))}
      </ul>
    </div>
  );
}

const num = (v: string) => {
  const n = parseFloat(v.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

// ------------------------------------------------------------------ blocks

function BlockView({
  block,
  doc,
  project,
  guest,
  spot,
  crew,
}: { block: Block; spot: SpotFn; crew: string[] } & ShowcasePageProps) {
  const screen = SCREEN[block.type];

  switch (block.type) {
    case 'marquee':
      return (
        <div className="ctru-feed">
          <span className="ctru-feed-tag ctru-ui">Live feed</span>
          <div className="ctru-feed-track">
            <div className="ctru-feed-run">
              <ul>
                {block.items.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
              <ul aria-hidden="true">
                {block.items.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          </div>
        </div>
      );

    case 'stats': {
      const max = Math.max(1, ...block.items.map((s) => num(s.value)));
      return (
        <div className="ctru-wrap">
          <p className="ctru-label" style={{ marginBottom: 14, color: 'var(--cyan)' }}>Career stats</p>
          <WithDriver src={spot('stats')} guest={guest} tag="Career" size="m">
          <ul className="ctru-stats">
            {block.items.map((s, i) => {
              const on = Math.max(3, Math.round((num(s.value) / max) * 20));
              return (
                <li key={i} className="ctru-stat ctru-glass">
                  <div className="ctru-stat-top">
                    <span className="ctru-label">Stat {String(i + 1).padStart(2, '0')}</span>
                    <Trophy size={15} aria-hidden="true" color="var(--gold)" />
                  </div>
                  <p className="ctru-stat-val">{s.value}</p>
                  <p className="ctru-stat-lbl">{s.label}</p>
                  <div className="ctru-gauge" aria-hidden="true">
                    {Array.from({ length: 20 }, (_, j) => (
                      <i key={j} className={j < on ? (j >= on - 2 ? 'on hot' : 'on') : undefined} />
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
          </WithDriver>
        </div>
      );
    }

    case 'overview':
      return (
        <div className="ctru-wrap">
          <SectionHead head={block.head} screen={screen} prompts={[['A', 'Accept briefing']]} />
          <div className="ctru-brief">
            <WithDriver src={spot('overview')} guest={guest} tag="Briefing" size="m" side="left">
              <div className="ctru-brief-text ctru-glass ctru-corner">
                <p className="ctru-label">Mission briefing</p>
                {block.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </WithDriver>
            {block.features && block.features.length > 0 && (
              <ul className="ctru-modes">
                {block.features.map((f, i) => (
                  <li key={i} className="ctru-mode">
                    <span className="ctru-mode-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <span className="ctru-mode-icon" aria-hidden="true"><span><Icon name={f.icon} size={19} /></span></span>
                    <h3>{f.title}</h3>
                    <p>{f.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      );

    case 'duo': {
      const shots = block.sides.map((s) => s.image);
      return (
        <div className="ctru-wrap">
          <SectionHead head={block.head} screen={screen} prompts={[['LB', 'Player 1'], ['RB', 'Player 2']]} />
          <div className="ctru-duo">
            {block.sides.map((s, i) => (
              <article key={i} className={`ctru-side ctru-glass ctru-corner ${i % 2 ? 'ctru-side--p2' : ''}`}>
                <WithDriver
                  src={i < 2 ? spot(i === 0 ? 'duo:0' : 'duo:1') : undefined}
                  guest={guest}
                  tag={`P${i + 1}`}
                  size="s"
                  keep
                >
                  <div className="ctru-side-head">
                    <span className="ctru-player"><span style={{ display: 'inline-block', transform: 'skewX(var(--unskew))' }}>P{i + 1}</span></span>
                    <div style={{ minWidth: 0 }}>
                      <p className="ctru-label ctru-side-eyebrow">{s.eyebrow}</p>
                      <h3>{s.title}</h3>
                    </div>
                  </div>
                  <p style={{ marginTop: 16 }}>{s.body}</p>
                </WithDriver>
                <div className="ctru-browser">
                  <div className="ctru-browser-bar" aria-hidden="true">
                    <i /><i /><i />
                    <span className="ctru-browser-url">{s.url ?? s.eyebrow}</span>
                  </div>
                  <Shot items={shots} index={i} />
                </div>
                {s.points.length > 0 && (
                  <ul className="ctru-specs" aria-label={`${s.title}: specs`}>
                    {s.points.map((p, j) => <li key={j}>{p}</li>)}
                  </ul>
                )}
              </article>
            ))}
            {block.sides.length === 2 && <span className="ctru-vs" aria-hidden="true">VS</span>}
          </div>
          {block.shared && block.shared.items.length > 0 && (
            <div className="ctru-shared ctru-glass">
              <span className="ctru-label">{block.shared.title}</span>
              {block.shared.items.map((t) => <span key={t} className="ctru-chip">{t}</span>)}
            </div>
          )}
        </div>
      );
    }

    case 'table': {
      const podium = block.rows.length >= 3 ? [1, 0, 2] : [];
      return (
        <div className="ctru-wrap">
          {block.head && <SectionHead head={block.head} screen={screen} prompts={[['Y', 'Filter class'], ['B', 'Back']]} />}
          <WithDriver src={spot('table')} guest={guest} tag="Podium" size="m" side="left" className="ctru-row--podium">
            {podium.length > 0 && (
              <div className="ctru-podium" aria-hidden="true">
                {podium.map((r) => (
                  <div key={r} className={`ctru-step ctru-step--${r + 1}`}>
                    <p className="ctru-step-name">{block.rows[r][0]}</p>
                    {block.rows[r][1] && <p className="ctru-step-sub">{block.rows[r][1]}</p>}
                    <div className="ctru-step-block">{r + 1}</div>
                  </div>
                ))}
              </div>
            )}
          </WithDriver>
          <div className="ctru-board" tabIndex={0} role="region" aria-label={block.head ? `${block.head.label} table` : 'Table'}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Pos</th>
                  {block.columns.map((c) => <th key={c} scope="col">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, i) => (
                  <tr key={i} className={i < 3 ? `p${i + 1}` : undefined}>
                    <td className="ctru-pos"><span>{i + 1}</span></td>
                    {row.map((cell, j) => (
                      <td key={j} className={j === 0 ? 'ctru-name' : undefined}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    case 'tabs':
      return (
        <div className="ctru-wrap">
          <SectionHead head={block.head} screen={screen} />
          <WithDriver src={spot('tabs')} guest={guest} tag="Setup" size="l" side="left" className="ctru-row--top">
            <SettingsScreen tabs={block.tabs} />
          </WithDriver>
        </div>
      );

    case 'steps': {
      const shots = block.items.map((s) => s.image);
      const n = block.items.length;
      return (
        <div className="ctru-wrap">
          <WithDriver src={spot('steps')} guest={guest} tag="Tip" size="m" className="ctru-row--head">
            <SectionHead head={block.head} screen={screen} prompts={[['A', 'Inspect screen']]} />
          </WithDriver>
          <ol className="ctru-tips">
            {block.items.map((s, i) => {
              const pct = Math.round(((i + 1) / n) * 100);
              return (
                <li key={i} className={`ctru-tip ctru-glass ${s.tall ? 'ctru-tip--tall' : ''}`}>
                  <Shot items={shots} index={i} className="ctru-tip-shot">
                    <span className="ctru-tip-flag" aria-hidden="true">
                      <span>Tip</span>
                      <span>{String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
                    </span>
                  </Shot>
                  <div className="ctru-tip-body">
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                    {s.ticks && s.ticks.length > 0 && (
                      <ul className="ctru-ticks">
                        {s.ticks.map((t, j) => (
                          <li key={j}><Check size={15} aria-hidden="true" />{t}</li>
                        ))}
                      </ul>
                    )}
                    <div className="ctru-load" aria-hidden="true">
                      <span className="ctru-load-bar"><i style={{ width: `${pct}%` }} /></span>
                      <span className="ctru-label">Loading {pct}%</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      );
    }

    case 'phones':
      return (
        <div className="ctru-wrap">
          <SectionHead head={block.head} screen={screen} />
          <div className="ctru-photo ctru-glass ctru-corner">
            <div className="ctru-photo-hud ctru-label" aria-hidden="true">
              <span><b>●</b> Photo mode</span>
              <span>{block.items.length} shots · FOV 35</span>
            </div>
            <ul className="ctru-phones">
              {block.items.map((img, i) => (
                <li key={i} className="ctru-phone">
                  <figure>
                    <Shot items={block.items} index={i} className="ctru-phone-frame" />
                    <figcaption>{img.caption ?? img.alt}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

    case 'columns':
      return (
        <div className="ctru-wrap">
          <SectionHead head={block.head} screen={screen} prompts={[['A', 'Install'], ['Y', 'Compare']]} />
          <div className="ctru-tune">
            {block.columns.map((c, i) => (
              <section key={i} className="ctru-part ctru-glass" aria-label={c.title}>
                <div className="ctru-part-head">
                  <h3>{c.title}</h3>
                  <span className="ctru-lvl" aria-hidden="true">
                    {Array.from({ length: Math.min(5, Math.max(1, c.items.length)) }, (_, j) => <i key={j} />)}
                  </span>
                </div>
                {c.style === 'chips' ? (
                  <ul className="ctru-inv">
                    {c.items.map((t) => <li key={t} className="ctru-chip">{t}</li>)}
                  </ul>
                ) : (
                  <ul className="ctru-part-list">
                    {c.items.map((t, j) => <li key={j}>{t}</li>)}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      );

    case 'gallery':
      return (
        <div className="ctru-wrap">
          <WithDriver src={spot('gallery')} guest={guest} tag="Garage" size="m" className="ctru-row--head">
            <SectionHead head={block.head} screen={screen} />
          </WithDriver>
          <Garage items={block.items} />
        </div>
      );

    case 'outro': {
      const stats = doc.sections.find((b): b is Extract<Block, { type: 'stats' }> => b.type === 'stats');
      return (
        <div className="ctru-wrap">
          <div className={`ctru-results ctru-glass ctru-corner${spot('outro') ? ' ctru-results--drv' : ''}`}>
            <Driver src={spot('outro')} guest={guest} tag="Driver of the day" size="l" className="ctru-results-drv" />
            <div className="ctru-results-main">
            <p className="ctru-banner"><span>Event complete</span></p>
            <h2>
              {block.title} {block.accentWord && <em>{block.accentWord}</em>}
            </h2>
            {stats && stats.items.length > 0 && (
              <ul className="ctru-rewards" aria-label="Rewards">
                {stats.items.map((s, i) => (
                  <li key={i} className="ctru-reward">
                    <span className="ctru-reward-ico" aria-hidden="true"><span><Trophy size={14} /></span></span>
                    <span>{s.label}</span>
                    <b>+{s.value}</b>
                  </li>
                ))}
              </ul>
            )}
            <div className="ctru-xp" aria-hidden="true">
              <div className="ctru-xp-row">
                <span className="ctru-label">{project.status}{project.year ? ` · Season ${project.year}` : ''}</span>
                <span className="ctru-label" style={{ color: 'var(--cyan)' }}>Level up</span>
              </div>
              <div className="ctru-xp-bar"><i /></div>
            </div>
            <PitCrew poses={crew} guest={guest} />
            {block.actions.length > 0 && <MenuTiles actions={block.actions} label="Continue" />}
            <Prompts items={[['A', 'Continue'], ['B', 'Main menu']]} />
            </div>
          </div>
        </div>
      );
    }

    case 'markdown':
      return (
        <div className="ctru-wrap">
          <SectionHead head={block.head} screen={screen} />
          <MarkdownScreen file={block.file} />
        </div>
      );

    case 'cards':
      return (
        <div className="ctru-wrap">
          <SectionHead head={block.head} screen={screen} />
          <ul className="ctru-modes">
            {block.items.map((c, i) => (
              <li key={i} className="ctru-mode">
                <span className="ctru-mode-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="ctru-mode-icon" aria-hidden="true"><span><Icon name={c.icon} size={19} /></span></span>
                <h3>{c.title}</h3>
                {c.subtitle && <p>{c.subtitle}</p>}
                {c.value && <p className="ctru-card-val">{c.value}</p>}
                {c.valueLabel && <p className="ctru-label">{c.valueLabel}</p>}
                {c.meta && <p>{c.meta}</p>}
              </li>
            ))}
          </ul>
        </div>
      );

    case 'compare':
      return (
        <div className="ctru-wrap">
          <SectionHead head={block.head} screen={screen} />
          <div className="ctru-compare ctru-glass ctru-corner">
            <Shot items={[block.image]} index={0} />
          </div>
        </div>
      );

    default:
      return null;
  }
}

// -------------------------------------------------------------------- page

function StageCard({ items, index, pos, tag }: { items: ThemedImage[]; index: number; pos: string; tag: string }) {
  const img = items[index];
  return (
    <Shot items={items} index={index} className={`ctru-stage-card ctru-stage-card--${pos}`}>
      <span className={`ctru-stage-tag ${pos === 'right' ? 'ctru-stage-tag--m' : ''}`} aria-hidden="true">{tag}</span>
      <span className="ctru-stage-cap" aria-hidden="true">
        <i className={`ctru-kb ${pos === 'center' ? '' : 'ctru-kb--x'}`}>{pos === 'center' ? 'A' : 'X'}</i>
        <span>{img.caption ?? img.alt}</span>
      </span>
    </Shot>
  );
}

export default function Page({ project, doc, guest }: ShowcasePageProps) {
  const { hero } = doc;

  // Hand the poses out: a spot shows only if its screen is in the document; the rest join the crew.
  const cast = castSpots(guest, SPOTS.length);
  const has = (t: Block['type']) => doc.sections.some((b) => b.type === t);
  const present = (key: SpotKey) => {
    if (key === 'hero') return true;
    if (key === 'duo:0' || key === 'duo:1') {
      const duo = doc.sections.find((b): b is Extract<Block, { type: 'duo' }> => b.type === 'duo');
      return !!duo && duo.sides.length > (key === 'duo:1' ? 1 : 0);
    }
    return has(key as Block['type']);
  };
  const spot: SpotFn = (key) => (present(key) ? cast.at(SPOTS.indexOf(key)) : undefined);
  const crew = [
    ...SPOTS.flatMap((k, i) => {
      const src = cast.at(i);
      return !present(k) && src ? [src] : [];
    }),
    ...cast.rest,
  ];
  const hasOutro = has('outro');
  const spotFor = (block: Block, i: number): SpotFn =>
    doc.sections.findIndex((b) => b.type === block.type) === i ? spot : () => undefined;
  const stage = hero.stage;
  const stageItems: { img: ThemedImage; pos: 'left' | 'center' | 'right'; tag: string }[] = [];
  if (stage) {
    stageItems.push({ img: stage.center, pos: 'center', tag: 'Mode 1' });
    if (stage.left) stageItems.push({ img: stage.left, pos: 'left', tag: 'Mode 2' });
    if (stage.right) stageItems.push({ img: stage.right, pos: 'right', tag: 'Mode 3' });
  }
  const stageImgs = stageItems.map((s) => s.img);

  return (
    <div className={`pg-ctru ${display.variable} ${ui.variable} ${body.variable}`}>
      <LightboxProvider>
        <div className="ctru-top">
          <Link href="/#work" className="ctru-back">
            <i className="ctru-kb ctru-kb--b" aria-hidden="true">B</i>
            Back<span className="ctru-sr"> to all projects</span>
          </Link>
          <span className="ctru-top-title">{project.title}</span>
          <span className="ctru-top-meta">
            {project.year && <span className="ctru-top-season">Season {project.year}</span>}
            <span className="ctru-online">{project.status}</span>
          </span>
        </div>

        <main>
          <header className="ctru-hero" data-tour="hero">
            <Streaks />
            <div className="ctru-hero-grid">
              <div>
                {hero.eyebrow && <p className="ctru-eyebrow">{hero.eyebrow}</p>}
                <h1 className="ctru-title">
                  <span>{hero.title}</span>
                  {hero.accent && <span className="ctru-title-accent">{hero.accent}</span>}
                </h1>
                <p className="ctru-lede">{hero.lede}</p>
                {hero.badges && hero.badges.length > 0 && (
                  <ul className="ctru-badges" aria-label="Highlights">
                    {hero.badges.map((b) => (
                      <li key={b.label} className={`ctru-badge ${b.tone === 'accent' ? 'ctru-badge--accent' : ''}`}>
                        <small aria-hidden="true">{b.tone === 'accent' ? '★' : '◆'}</small>
                        {b.label}
                      </li>
                    ))}
                  </ul>
                )}
                <WithDriver src={spot('hero')} guest={guest} tag="Selected driver" size="l" className="ctru-row--hero">
                  {hero.actions && hero.actions.length > 0 && <MenuTiles actions={hero.actions} label="Main menu" />}
                </WithDriver>
              </div>

              {stageItems.length > 0 && (
                <div className="ctru-stage">
                  {stageItems.map((s, i) => (
                    <StageCard key={s.pos} items={stageImgs} index={i} pos={s.pos} tag={s.tag} />
                  ))}
                  <p className="ctru-stage-server">
                    <span>Server <b>{stage?.url ?? hostOf(project.liveUrl ?? '')}</b></span>
                    <span>{project.category}</span>
                  </p>
                </div>
              )}
            </div>

            {hero.facts && hero.facts.length > 0 && (
              <dl className="ctru-profile">
                {hero.facts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="ctru-hero-prompts">
              <Prompts items={[['A', 'Select'], ['B', 'Back'], ['Y', 'Details']]} />
            </div>
          </header>

          {doc.sections.map((block, i) => (
            <section
              key={i}
              data-tour={`section-${i}`}
              className={block.type === 'marquee' ? 'ctru-sec-feed' : `ctru-sec ctru-sec--${block.type}`}
              aria-label={'head' in block && block.head ? block.head.label : block.type === 'outro' ? block.title : undefined}
            >
              <BlockView
                block={block}
                doc={doc}
                project={project}
                guest={guest}
                spot={spotFor(block, i)}
                crew={block.type === 'outro' && spotFor(block, i) === spot ? crew : []}
              />
            </section>
          ))}
          {!hasOutro && crew.length > 0 && (
            <section className="ctru-sec" aria-label="Pit crew">
              <div className="ctru-wrap">
                <PitCrew poses={crew} guest={guest} />
              </div>
            </section>
          )}
        </main>
      </LightboxProvider>
    </div>
  );
}
