/* eslint-disable @next/next/no-img-element */
import { Press_Start_2P, VT323 } from 'next/font/google';
import type { Action, Block, Head, ThemedImage } from '@/types/content';
import { Icon } from '../../primitives';
import { CastSprite, castSpots } from '../cast';
import type { PageGuest, ShowcasePageProps } from '../types';
import { CartridgeShelf, Scroll, WorldSelect } from './Client';
import { CAR, FLAG, ICONS, Pix } from './Pixel';
import './spartan.css';

const pixel = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--sp-pixel', display: 'swap' });
const crt = VT323({ weight: '400', subsets: ['latin'], variable: '--sp-crt', display: 'swap' });

const HUD = ['HP', 'XP', 'COIN', 'GEM'];
const RANKS = ['1ST', '2ND', '3RD'];
const rank = (i: number) => RANKS[i] ?? `${i + 1}TH`;
const pad = (n: number) => String(n).padStart(2, '0');

/** Sprite spots in page order: 0 hero, 1 level map, 2 stats, 3 overview, 4 table, 5 tabs, 6 columns, 7 outro. */
const SPOTS = 8;
const SPOT_BY_TYPE: Partial<Record<Block['type'], number>> = {
  stats: 2,
  overview: 3,
  table: 4,
  tabs: 5,
  columns: 6,
};

type Cast = { src?: string; guest?: PageGuest };

/** One pose standing on a pixel platform, lit from behind so the dark uniform reads on indigo. */
function Char({
  src,
  guest,
  tag,
  flip,
  size,
  className,
}: Cast & { tag?: string; flip?: boolean; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  if (!src) return null;
  return (
    <figure className={`sp-char sp-char--${size ?? 'md'} ${flip ? 'sp-char--flip' : ''} ${className ?? ''}`}>
      <span className="sp-char__stage">
        <CastSprite src={src} guest={guest} className="sp-char__img" />
      </span>
      <span className="sp-char__platform" aria-hidden="true" />
      {tag && (
        <figcaption className="sp-char__tag" aria-hidden="true">
          {tag}
        </figcaption>
      )}
    </figure>
  );
}

/** Content with a character standing beside it; without a pose it is just the content. */
function WithChar({
  cast,
  side = 'right',
  flip,
  tag,
  size,
  children,
}: {
  cast: Cast;
  side?: 'left' | 'right';
  flip?: boolean;
  tag?: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}) {
  if (!cast.src) return <>{children}</>;
  const who = <Char {...cast} flip={flip} tag={tag} size={size} />;
  return (
    <div className={`sp-with sp-with--${side}`}>
      {side === 'left' && who}
      <div className="sp-with__main">{children}</div>
      {side === 'right' && who}
    </div>
  );
}

// ------------------------------------------------------------------ pieces

function ArcadeLink({ action, big }: { action: Action; big?: boolean }) {
  const ext = action.external || /^https?:/.test(action.href);
  return (
    <a
      href={action.href}
      className={`sp-btn ${action.kind === 'ghost' ? 'sp-btn--ghost' : ''} ${big ? 'sp-btn--big' : ''}`}
      {...(ext ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
    >
      <span aria-hidden="true">{action.kind === 'ghost' ? '▷' : '▶'}</span> {action.label}
      {ext && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}

function StageHead({ head, n }: { head: Head; n: number }) {
  return (
    <header className="sp-head">
      <p className="sp-head__tag">
        <span className="sp-head__stage">STAGE {head.index || pad(n)}</span>
        <span className="sp-head__label">{head.label}</span>
      </p>
      <h2 className="sp-h2">
        {head.title} {head.accentWord && <em>{head.accentWord}</em>}
      </h2>
      {head.lede && <p className="sp-lede">{head.lede}</p>}
    </header>
  );
}

function Screen({ image, className, tall }: { image: ThemedImage; className?: string; tall?: boolean }) {
  return (
    <figure className={`sp-screen ${tall ? 'sp-screen--tall' : ''} ${className ?? ''}`}>
      <div
        className="sp-screen__glass"
        {...(tall ? { tabIndex: 0, role: 'region', 'aria-label': `${image.alt} (scrollable)` } : {})}
      >
        <img src={image.light} alt={image.alt} loading="lazy" />
      </div>
      {image.caption && <figcaption>{image.caption}</figcaption>}
    </figure>
  );
}

// ------------------------------------------------------------------ blocks

function BlockBody({ block, i, cast }: { block: Block; i: number; cast: Cast }) {
  switch (block.type) {
    case 'marquee': {
      const run = (hidden?: boolean) => (
        <ul className="sp-ticker__run" aria-hidden={hidden || undefined}>
          {block.items.map((t, k) => (
            <li key={k}>
              <span aria-hidden="true">★</span> {t}
            </li>
          ))}
        </ul>
      );
      return (
        <div className="sp-ticker" aria-label="Attract mode ticker">
          <span className="sp-ticker__tag" aria-hidden="true">
            NEWS
          </span>
          <div className="sp-ticker__track">
            {run()}
            {run(true)}
          </div>
        </div>
      );
    }

    case 'stats':
      return (
        <WithChar cast={cast} side="right" tag="HP MAX" size="md">
        <div className="sp-hud">
          <p className="sp-hud__title" aria-hidden="true">
            ── PLAYER STATUS ──
          </p>
          <ul className="sp-hud__grid">
            {block.items.map((s, k) => (
              <li key={k} className="sp-hud__cell" style={{ ['--d' as string]: `${k * 0.15}s` }}>
                <div className="sp-hud__top">
                  <Pix map={ICONS[k % ICONS.length]} className="sp-hud__icon" />
                  <span className="sp-hud__kind" aria-hidden="true">
                    {HUD[k % HUD.length]}
                  </span>
                </div>
                <strong className="sp-hud__value">
                  <span aria-hidden="true">×</span>
                  {s.value}
                </strong>
                <span className="sp-hud__label">{s.label}</span>
                <span className="sp-hud__bar" aria-hidden="true">
                  <i />
                </span>
              </li>
            ))}
          </ul>
        </div>
        </WithChar>
      );

    case 'overview':
      return (
        <>
          <StageHead head={block.head} n={i + 1} />
          <WithChar cast={cast} side="left" flip tag="TALK" size="md">
          <div className="sp-dialog">
            <span className="sp-dialog__name">NARRATOR</span>
            {block.paragraphs.map((p, k) => (
              <p key={k}>{p}</p>
            ))}
            <span className="sp-dialog__next sp-blink" aria-hidden="true">
              ▼
            </span>
          </div>
          </WithChar>
          {block.features && block.features.length > 0 && (
            <>
              <p className="sp-sub" aria-hidden="true">
                ITEMS UNLOCKED · {block.features.length}
              </p>
              <ul className="sp-items">
                {block.features.map((f, k) => (
                  <li key={k} className="sp-item">
                    <span className="sp-item__box" aria-hidden="true">
                      <Icon name={f.icon} size={26} />
                    </span>
                    <span className="sp-item__no" aria-hidden="true">
                      ITEM {pad(k + 1)}
                    </span>
                    <h3>{f.title}</h3>
                    <p>{f.description}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      );

    case 'cards':
      return (
        <>
          <StageHead head={block.head} n={i + 1} />
          <ul className="sp-items">
            {block.items.map((c, k) => (
              <li key={k} className="sp-item" style={c.hue ? { ['--hue' as string]: c.hue } : undefined}>
                <span className="sp-item__box" aria-hidden="true">
                  {c.icon ? <Icon name={c.icon} size={26} /> : '?'}
                </span>
                {c.value && (
                  <span className="sp-item__no">
                    {c.value} {c.valueLabel}
                  </span>
                )}
                <h3>{c.title}</h3>
                {c.subtitle && <p>{c.subtitle}</p>}
                {c.meta && <p className="sp-dim">{c.meta}</p>}
              </li>
            ))}
          </ul>
        </>
      );

    case 'table':
      return (
        <>
          {block.head && <StageHead head={block.head} n={i + 1} />}
          <WithChar cast={cast} side="left" tag="1ST" size="lg">
          <div className="sp-scores">
            <p className="sp-scores__title" aria-hidden="true">
              <span className="sp-blink">★</span> HIGH SCORES <span className="sp-blink">★</span>
            </p>
            <table>
              <thead>
                <tr>
                  <th scope="col">RANK</th>
                  {block.columns.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r} className={`sp-row-${r % 4}`}>
                    <td data-label="RANK" className="sp-scores__rank">
                      {rank(r)}
                    </td>
                    {row.map((cell, c) => (
                      <td key={c} data-label={block.columns[c] ?? ''}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </WithChar>
        </>
      );

    case 'tabs':
      return (
        <>
          <WithChar cast={cast} side="right" tag="READY?" size="sm">
            <StageHead head={block.head} n={i + 1} />
          </WithChar>
          <WorldSelect tabs={block.tabs} uid={`sp-w${i}`} />
        </>
      );

    case 'steps':
      return (
        <>
          <StageHead head={block.head} n={i + 1} />
          <ol className="sp-run">
            {block.items.map((s, k) => (
              <li key={k} className="sp-cp">
                <div className="sp-cp__marker" aria-hidden="true">
                  <Pix map={FLAG} className="sp-cp__flag" />
                  <span>CP {pad(k + 1)}</span>
                </div>
                <div className="sp-cp__text">
                  <p className="sp-cp__eyebrow" aria-hidden="true">
                    CHECKPOINT {k + 1}/{block.items.length}
                  </p>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  {s.ticks && s.ticks.length > 0 && (
                    <ul className="sp-quests">
                      {s.ticks.map((t, j) => (
                        <li key={j}>{t}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <Screen image={s.image} tall={s.tall} className="sp-cp__shot" />
              </li>
            ))}
          </ol>
        </>
      );

    case 'phones':
      return (
        <>
          <StageHead head={block.head} n={i + 1} />
          <ul className="sp-handhelds" aria-label="Screens on a phone">
            {block.items.map((img, k) => (
              <li key={k} className="sp-handheld">
                <div className="sp-handheld__bezel">
                  <span className="sp-handheld__led" aria-hidden="true" />
                  <div className="sp-handheld__screen">
                    <img src={img.light} alt={img.alt} loading="lazy" />
                  </div>
                  <span className="sp-handheld__brand" aria-hidden="true">
                    SPARTAN BOY
                  </span>
                </div>
                <div className="sp-handheld__pad" aria-hidden="true">
                  <span className="sp-dpad" />
                  <span className="sp-ab">
                    <i>B</i>
                    <i>A</i>
                  </span>
                </div>
                <p className="sp-handheld__cap">{img.caption ?? img.alt}</p>
              </li>
            ))}
          </ul>
        </>
      );

    case 'columns':
      return (
        <>
          <StageHead head={block.head} n={i + 1} />
          <WithChar cast={cast} side="right" tag="BAG" size="lg">
          <div className="sp-bags">
            {block.columns.map((col, k) => (
              <div key={k} className={`sp-bag sp-bag--${col.style}`}>
                <h3 className="sp-bag__title">
                  <span aria-hidden="true">■</span> {col.title}
                  <span className="sp-bag__count">
                    {col.items.length}/{col.style === 'chips' ? 99 : col.items.length}
                  </span>
                </h3>
                <ul className={col.style === 'chips' ? 'sp-slots' : 'sp-quests'}>
                  {col.items.map((it, j) => (
                    <li key={j}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          </WithChar>
        </>
      );

    case 'gallery':
      return (
        <>
          <StageHead head={block.head} n={i + 1} />
          <CartridgeShelf items={block.items} />
        </>
      );

    case 'compare':
      return (
        <>
          <StageHead head={block.head} n={i + 1} />
          <Screen image={block.image} className="sp-single" />
        </>
      );

    case 'duo':
      return (
        <>
          <StageHead head={block.head} n={i + 1} />
          <div className="sp-versus">
            {block.sides.map((s, k) => (
              <article key={k} className="sp-player">
                <p className="sp-player__tag">
                  {k === 0 ? '1P' : '2P'} · {s.eyebrow}
                </p>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <Screen image={s.image} className={s.device === 'phone' ? 'sp-screen--phone' : ''} />
                <ul className="sp-quests">
                  {s.points.map((p, j) => (
                    <li key={j}>{p}</li>
                  ))}
                </ul>
                {s.url && (
                  <a className="sp-inline" href={s.url} target="_blank" rel="noreferrer noopener">
                    {s.url}
                  </a>
                )}
              </article>
            ))}
          </div>
          {block.shared && (
            <div className="sp-bag sp-bag--chips">
              <h3 className="sp-bag__title">{block.shared.title}</h3>
              <ul className="sp-slots">
                {block.shared.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      );

    case 'markdown':
      return (
        <>
          <StageHead head={block.head} n={i + 1} />
          <div className="sp-dialog">
            <Scroll file={block.file} />
          </div>
        </>
      );

    default:
      return null;
  }
}

function Outro({
  block,
  fallback,
  cast,
  party,
}: {
  block: Extract<Block, { type: 'outro' }> | null;
  fallback: Action[];
  cast: Cast;
  party: string[];
}) {
  const actions = block?.actions?.length ? block.actions : fallback;
  const hasBack = actions.some((a) => a.href === '/#work');
  return (
    <div className="sp-outro">
      <p className="sp-outro__continue" aria-hidden="true">
        CONTINUE?{' '}
        <span className="sp-count">
          <span>9</span>
        </span>
      </p>
      <p className="sp-outro__clear">GAME CLEAR!</p>
      <Char {...cast} tag="WINNER" size="lg" className="sp-char--champ" />
      {block && (
        <h2 className="sp-h2 sp-outro__title">
          {block.title} {block.accentWord && <em>{block.accentWord}</em>}
        </h2>
      )}
      <div className="sp-actions sp-actions--center">
        {actions.map((a, k) => (
          <ArcadeLink key={k} action={a} big={k === 0} />
        ))}
        {!hasBack && <ArcadeLink action={{ label: 'Back to portfolio', href: '/#work', kind: 'ghost' }} />}
      </div>
      {party.length > 0 && (
        <div className="sp-party">
          <p className="sp-party__title" aria-hidden="true">
            BONUS PARTY
          </p>
          <ul>
            {party.map((src, k) => (
              <li key={src + k}>
                <Char src={src} guest={cast.guest} size="sm" flip={k % 2 === 1} tag={`P${k + 2}`} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="sp-outro__thanks sp-blink" aria-hidden="true">
        THANK YOU FOR PLAYING
      </p>
      <p className="sp-outro__credit" aria-hidden="true">
        INSERT COIN TO PLAY AGAIN · CREDIT 01
      </p>
    </div>
  );
}

// ------------------------------------------------------------------ page

export default function Page({ project, doc, guest }: ShowcasePageProps) {
  const { hero } = doc;
  const sections = doc.sections;
  const outroIndex = sections.findIndex((b) => b.type === 'outro');
  const mapNodes = sections
    .map((b, i) => ({ b, i }))
    .filter(({ b }) => 'head' in b && b.head)
    .map(({ b, i }) => ({ i, head: (b as { head: Head }).head }));
  const heroActions = hero.actions ?? [];
  const fallbackActions: Action[] = [
    ...(project.liveUrl ? [{ label: 'Play live', href: project.liveUrl, external: true }] : []),
    ...(project.githubUrl ? [{ label: 'Source', href: project.githubUrl, external: true, kind: 'ghost' as const }] : []),
  ];
  const spots = castSpots(guest, SPOTS);
  const cast = (k: number): Cast => ({ src: spots.at(k), guest });
  // Each spot-bearing block type gets its sprite on its first appearance only.
  const seen = new Set<string>();
  const sectionCast: Cast[] = sections.map((b) => {
    const k = SPOT_BY_TYPE[b.type];
    if (k === undefined || seen.has(b.type)) return {};
    seen.add(b.type);
    return cast(k);
  });
  const playerName = (guest?.name ?? 'Player').split(' ').pop()?.toUpperCase();
  const shots = [hero.stage?.left, hero.stage?.right].filter(Boolean) as ThemedImage[];

  return (
    <div className={`pg-spartan ${pixel.variable} ${crt.variable}`}>
      <div className="sp-stars" aria-hidden="true" />

      <nav className="sp-topbar" aria-label="Page">
        <a href="/#work" className="sp-exit">
          <span aria-hidden="true">◀</span> EXIT TO MAP
        </a>
        <span className="sp-topbar__mid" aria-hidden="true">
          1UP <b>{project.year ?? '2026'}</b> · HI-SCORE <b>{project.status}</b>
        </span>
        <span className="sp-topbar__credit" aria-hidden="true">
          CREDIT 01
        </span>
      </nav>

      {/* ---------------------------------------------------------- title screen */}
      <header className="sp-hero" data-tour="hero">
        {hero.eyebrow && <p className="sp-hero__eyebrow">© {hero.eyebrow}</p>}
        <h1 className="sp-hero__title">
          <span className="sp-hero__line">{hero.title}</span>
          {hero.accent && <span className="sp-hero__accent">{hero.accent}</span>}
        </h1>
        <a href="#level-select" className="sp-start">
          <span className="sp-blink">PRESS START</span>
        </a>

        <div className="sp-road" aria-hidden="true">
          <div className="sp-road__sky" />
          <div className="sp-road__car">
            <Pix map={CAR} className="sp-car" />
            <span className="sp-road__puff" />
          </div>
          <div className="sp-road__strip" />
        </div>

        <div className="sp-hero__grid">
          <div className="sp-hero__left">
            <div className="sp-dialog sp-dialog--hero">
              <span className="sp-dialog__name">{project.title.split(':')[0]}</span>
              <p>{hero.lede}</p>
            </div>
            {hero.badges && hero.badges.length > 0 && (
              <ul className="sp-powerups" aria-label="Highlights">
                {hero.badges.map((b, k) => (
                  <li key={k} className={b.tone === 'accent' ? 'is-accent' : ''}>
                    <span aria-hidden="true">{b.tone === 'accent' ? '★' : '+'}</span> {b.label}
                  </li>
                ))}
              </ul>
            )}
            <div className="sp-actions">
              {(heroActions.length ? heroActions : fallbackActions).map((a, k) => (
                <ArcadeLink key={k} action={a} big={k === 0} />
              ))}
            </div>
          </div>

          <div className="sp-hero__right">
            {hero.stage && (
              <div className="sp-cabinet">
                <div className="sp-cabinet__marquee" aria-hidden="true">
                  {hero.stage.url ?? project.title.split(':')[0]}
                </div>
                <Screen image={hero.stage.center} className="sp-cabinet__screen" />
                {shots.length > 0 && (
                  <div className="sp-cabinet__saves">
                    {shots.map((s, k) => (
                      <div key={k} className="sp-save">
                        <span className="sp-save__tag" aria-hidden="true">
                          FILE {k + 1}
                        </span>
                        <img src={s.light} alt={s.alt} loading="lazy" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {hero.facts && hero.facts.length > 0 && (
              <WithChar cast={cast(0)} side="right" tag={`P1 ${playerName}`} size="md">
              <div className="sp-sheet">
                <p className="sp-sheet__title" aria-hidden="true">
                  PLAYER 1 · SELECT
                </p>
                <dl>
                  {hero.facts.map((f, k) => (
                    <div key={k} className="sp-sheet__row">
                      <dt>{f.label}</dt>
                      <dd>{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              </WithChar>
            )}
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------- level select */}
      {mapNodes.length > 0 && (
        <nav id="level-select" className="sp-map" aria-label="Level select">
          <p className="sp-map__title">
            <span aria-hidden="true">▼</span> LEVEL SELECT <span aria-hidden="true">▼</span>
          </p>
          <WithChar cast={cast(1)} side="left" flip tag="YOU ARE HERE" size="sm">
          <ol className="sp-map__nodes">
            {mapNodes.map(({ i, head }, k) => (
              <li key={i}>
                <a href={`#stage-${i}`} className="sp-node">
                  <span className="sp-node__no">{`1-${k + 1}`}</span>
                  <span className="sp-node__label">{head.label}</span>
                  <span className="sp-node__stars" aria-hidden="true">
                    ★★★
                  </span>
                </a>
              </li>
            ))}
            {outroIndex >= 0 && (
              <li>
                <a href={`#stage-${outroIndex}`} className="sp-node sp-node--boss">
                  <span className="sp-node__no">BOSS</span>
                  <span className="sp-node__label">Game clear</span>
                  <span className="sp-node__stars" aria-hidden="true">
                    ♛
                  </span>
                </a>
              </li>
            )}
          </ol>
          </WithChar>
        </nav>
      )}

      {/* ---------------------------------------------------------- stages */}
      <main className="sp-stages">
        {sections.map((block, i) =>
          block.type === 'outro' ? (
            <section key={i} id={`stage-${i}`} data-tour={`section-${i}`} className="sp-stage sp-stage--outro">
              <Outro block={block} fallback={fallbackActions} cast={cast(7)} party={spots.rest} />
            </section>
          ) : (
            <section
              key={i}
              id={`stage-${i}`}
              data-tour={`section-${i}`}
              className={`sp-stage sp-stage--${block.type}`}
            >
              <BlockBody block={block} i={i} cast={sectionCast[i]} />
            </section>
          )
        )}
        {outroIndex < 0 && (
          <section className="sp-stage sp-stage--outro">
            <Outro
              block={null}
              fallback={heroActions.length ? heroActions : fallbackActions}
              cast={cast(7)}
              party={spots.rest}
            />
          </section>
        )}
      </main>
    </div>
  );
}
