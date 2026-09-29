/* eslint-disable @next/next/no-img-element */
import { Cinzel, EB_Garamond } from 'next/font/google';
import type { Action, Block, Head, ThemedImage } from '@/types/content';
import type { PageGuest, ShowcasePageProps } from '../types';
import { CastSprite, castSpots } from '../cast';
import { BidTicker } from './BidTicker';
import { Catalogue } from './Catalogue';
import { WorkedExample } from './WorkedExample';
import { pad, roman } from './money';
import './bidnest.css';

const display = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--bn-display',
  display: 'swap',
});

const text = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--bn-text',
  display: 'swap',
});

// ------------------------------------------------------------------ engraving

/** A hypotrochoid rosette, the looping line engraved into banknotes, as one SVG path. */
function rosette(R: number, r: number, d: number, size: number, steps = 1600) {
  const g = (a: number, b: number): number => (b ? g(b, a % b) : a);
  const turns = r / g(R, r);
  const k = (R - r) / r;
  const scale = size / (R - r + d);
  let path = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2 * turns;
    const x = ((R - r) * Math.cos(t) + d * Math.cos(k * t)) * scale;
    const y = ((R - r) * Math.sin(t) - d * Math.sin(k * t)) * scale;
    path += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return path + 'Z';
}

const ROSE_A = rosette(15, 7, 5.2, 190);
const ROSE_B = rosette(11, 4, 3.4, 150, 1000);
const ROSE_C = rosette(9, 2, 1.6, 90, 600);

function Guilloche({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-200 -200 400 400" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor">
        <path d={ROSE_A} strokeWidth="0.55" />
        <path d={ROSE_B} strokeWidth="0.5" opacity="0.8" />
        <path d={ROSE_C} strokeWidth="0.5" opacity="0.9" />
        <circle r="196" strokeWidth="0.6" />
        <circle r="199" strokeWidth="0.3" />
      </g>
    </svg>
  );
}

/** Interlaced sine waves for the engraved borders. */
function WaveBand({ className }: { className?: string }) {
  const lines = [0, 1, 2, 3, 4, 5].map((n) => {
    let d = '';
    for (let x = 0; x <= 1200; x += 6) {
      const y = 12 + Math.sin(x / 22 + n * 0.9) * 7 + Math.sin(x / 57 + n) * 2;
      d += `${x ? 'L' : 'M'}${x} ${y.toFixed(1)}`;
    }
    return d;
  });
  return (
    <svg className={className} viewBox="0 0 1200 24" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="0.6">
        {lines.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

function Gavel({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <g transform="rotate(-38 48 40)">
          <rect x="22" y="26" width="52" height="26" rx="4" />
          <path d="M30 26 v26 M66 26 v26" />
          <rect x="16" y="30" width="6" height="18" rx="2" />
          <rect x="74" y="30" width="6" height="18" rx="2" />
          <path d="M48 52 v58" strokeWidth="4" />
        </g>
        <ellipse cx="46" cy="104" rx="36" ry="7" />
        <path d="M10 104 v5 a36 7 0 0 0 72 0 v-5" />
      </g>
    </svg>
  );
}

function Seal({ year }: { year: string }) {
  return (
    <svg className="bn-seal" viewBox="-60 -60 120 120" role="img" aria-label="Gold seal of the sale">
      <defs>
        <radialGradient id="bn-seal-g" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#f6e3a1" />
          <stop offset="0.5" stopColor="#c9a24c" />
          <stop offset="1" stopColor="#7a5a1c" />
        </radialGradient>
      </defs>
      <path
        d={Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const rr = i % 2 ? 50 : 57;
          return `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`;
        }).join('') + 'Z'}
        fill="url(#bn-seal-g)"
      />
      <circle r="40" fill="none" stroke="#5c430f" strokeWidth="1" opacity="0.7" />
      <circle r="35" fill="none" stroke="#5c430f" strokeWidth="0.6" opacity="0.6" />
      <text y="9" textAnchor="middle" className="bn-seal-mono">
        BN
      </text>
      <text y="26" textAnchor="middle" className="bn-seal-year">
        {year}
      </text>
    </svg>
  );
}

// ------------------------------------------------------------------ helpers

const isExternal = (a: Action) => a.external ?? /^https?:/i.test(a.href);

function ActionLink({ a, i }: { a: Action; i: number }) {
  const ghost = a.kind === 'ghost' || (a.kind !== 'solid' && i > 0);
  return (
    <a
      className={`bn-btn ${ghost ? 'bn-btn-ghost' : 'bn-btn-foil'}`}
      href={a.href}
      {...(isExternal(a) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {a.label}
      {isExternal(a) && (
        <span className="bn-btn-arrow" aria-hidden="true">
          ↗
        </span>
      )}
      {isExternal(a) && <span className="bn-sr"> (opens in a new tab)</span>}
    </a>
  );
}

function Title({ title, accentWord }: { title: string; accentWord?: string }) {
  return (
    <>
      {title}
      {accentWord && (
        <>
          {' '}
          <em>{accentWord}</em>
        </>
      )}
    </>
  );
}

function SectionHead({ head, id, sprite, guest }: { head: Head; id: string; sprite?: string; guest?: PageGuest }) {
  const inner = (
    <header className="bn-shead">
      <p className="bn-kicker">
        <span>Section {head.index}</span>
        <span aria-hidden="true"> · </span>
        <span>{head.label}</span>
      </p>
      <h2 id={id} className="bn-shead-title">
        <Title title={head.title} accentWord={head.accentWord} />
      </h2>
      {head.lede && <p className="bn-shead-lede">{head.lede}</p>}
      <span className="bn-rule" aria-hidden="true">
        <i />❖<i />
      </span>
    </header>
  );
  if (!sprite) return inner;
  return (
    <div className="bn-shead-row">
      <CastSprite src={sprite} guest={guest} className="bn-cast bn-cast-shead" />
      {inner}
    </div>
  );
}

function Plate({ img, n, className = '' }: { img: ThemedImage; n?: number; className?: string }) {
  return (
    <figure className={`bn-plate ${className}`}>
      <span className="bn-plate-frame">
        <img src={img.light} alt={img.alt} loading="lazy" />
      </span>
      <figcaption className="bn-plate-cap">
        {n !== undefined && <b>Plate {roman(n)}.</b>} {img.caption ?? img.alt}
      </figcaption>
    </figure>
  );
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ------------------------------------------------------------------ blocks

type Cast = ReturnType<typeof castSpots>;

function BlockView({ block, i, first, cast, guest }: { block: Block; i: number; first: boolean; cast: Cast; guest?: PageGuest }) {
  const hid = `bn-s${i}`;
  switch (block.type) {
    case 'markdown':
      return (
        <section className="bn-sec bn-sec-cat" data-tour={`section-${i}`} aria-labelledby={hid}>
          <div className="bn-wrap">
            <SectionHead head={block.head} id={hid} sprite={first ? cast.at(1) : undefined} guest={guest} />
            {first && <WorkedExample sprites={[cast.at(2), cast.at(3)]} guest={guest} />}
            <Catalogue
              file={block.file}
              guest={guest}
              sprites={first ? [cast.at(4), cast.at(5), cast.at(6), cast.at(7)] : []}
            />
          </div>
        </section>
      );
    case 'outro':
      return null; // rendered by <Receipt/>, which needs the row as well
    case 'stats':
      return (
        <section className="bn-sec bn-sec-stats" data-tour={`section-${i}`} aria-label="Figures">
          <div className="bn-wrap">
            <dl className="bn-stats">
              {block.items.map((s, k) => (
                <div key={k}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      );
    case 'marquee':
      return (
        <section className="bn-sec bn-sec-marquee" data-tour={`section-${i}`} aria-label="Highlights">
          <ul className="bn-marquee">
            {block.items.map((t, k) => (
              <li key={k}>{t}</li>
            ))}
          </ul>
        </section>
      );
    default:
      return (
        <section className="bn-sec" data-tour={`section-${i}`} aria-labelledby={hid} id={slug(block.head?.label ?? '') || undefined}>
          <div className="bn-wrap">
            {block.head && <SectionHead head={block.head} id={hid} />}
            <BlockBody block={block} />
          </div>
        </section>
      );
  }
}

function BlockBody({ block }: { block: Block }) {
  switch (block.type) {
    case 'overview':
      return (
        <div className="bn-essay">
          <div className="bn-prose bn-prose-cols">
            {block.paragraphs.map((p, k) => (
              <p key={k}>{p}</p>
            ))}
          </div>
          {block.features && (
            <ol className="bn-lotcards">
              {block.features.map((f, k) => (
                <li key={k}>
                  <span className="bn-lotcards-no">Lot {pad(k + 1)}</span>
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      );
    case 'cards':
      return (
        <ol className="bn-lotcards">
          {block.items.map((c, k) => (
            <li key={k}>
              <span className="bn-lotcards-no">Lot {pad(k + 1)}</span>
              <h3>{c.title}</h3>
              {c.subtitle && <p>{c.subtitle}</p>}
              {c.value && (
                <p className="bn-lotcards-est">
                  <b>{c.value}</b> {c.valueLabel}
                </p>
              )}
              {c.meta && <p className="bn-lotcards-meta">{c.meta}</p>}
            </li>
          ))}
        </ol>
      );
    case 'table':
      return (
        <div className="bn-table-wrap">
          <table>
            <thead>
              <tr>
                {block.columns.map((c, k) => (
                  <th key={k} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, k) => (
                <tr key={k}>
                  {r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'tabs':
      return (
        <div className="bn-tabs">
          {block.tabs.map((t) => (
            <article key={t.id} className="bn-tabs-item">
              <h3>
                {t.label}
                {t.subtitle && <small>{t.subtitle}</small>}
              </h3>
              <ol>
                {t.steps.map((s, k) => (
                  <li key={k}>
                    <b>{s.title}</b> {s.description}
                  </li>
                ))}
              </ol>
              {t.details && (
                <div className="bn-tabs-details">
                  {t.detailsTitle && <p className="bn-kicker">{t.detailsTitle}</p>}
                  <ul>
                    {t.details.map((d, k) => (
                      <li key={k}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      );
    case 'steps':
      return (
        <ol className="bn-steps">
          {block.items.map((s, k) => (
            <li key={k}>
              <div>
                <span className="bn-lotcards-no">Lot {pad(k + 1)}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                {s.ticks && (
                  <ul className="bn-ticks">
                    {s.ticks.map((t, j) => (
                      <li key={j}>{t}</li>
                    ))}
                  </ul>
                )}
              </div>
              <Plate img={s.image} n={k + 1} />
            </li>
          ))}
        </ol>
      );
    case 'duo':
      return (
        <>
          <div className="bn-duo">
            {block.sides.map((s, k) => (
              <article key={k}>
                <p className="bn-kicker">{s.eyebrow}</p>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <Plate img={s.image} n={k + 1} className={s.device === 'phone' ? 'bn-plate-tall' : ''} />
                <ul className="bn-ticks">
                  {s.points.map((p, j) => (
                    <li key={j}>{p}</li>
                  ))}
                </ul>
                {s.url && (
                  <a className="bn-link" href={s.url} target="_blank" rel="noopener noreferrer">
                    Visit {s.title}
                  </a>
                )}
              </article>
            ))}
          </div>
          {block.shared && (
            <div className="bn-chips-row">
              <p className="bn-kicker">{block.shared.title}</p>
              <ul className="bn-chips">
                {block.shared.items.map((t, k) => (
                  <li key={k}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      );
    case 'compare':
      return <Plate img={block.image} n={1} className="bn-plate-wide" />;
    case 'phones':
    case 'gallery':
      return (
        <div className={`bn-plates ${block.type === 'phones' ? 'bn-plates-tall' : ''}`}>
          {block.items.map((img, k) => (
            <Plate key={k} img={img} n={k + 1} className={block.type === 'phones' ? 'bn-plate-tall' : ''} />
          ))}
        </div>
      );
    case 'columns':
      return (
        <div className="bn-columns">
          {block.columns.map((c, k) => (
            <div key={k}>
              <h3>{c.title}</h3>
              <ul className={c.style === 'chips' ? 'bn-chips' : 'bn-ticks'}>
                {c.items.map((t, j) => (
                  <li key={j}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

// ------------------------------------------------------------------ page

/**
 * Anya's ten spots, in page order: 0 cover (holding the paddle up), 1 beside the catalogue title, 2 and 3 at the
 * auctioneer's sheet, 4 by the lot index, 5-7 beside three lots, 8 perched on the bill of sale, 9 cheering beside it.
 * Poses past the tenth, or whose spot has no host (no markdown section), gather by the conditions of sale.
 */
const SPOTS = 10;

export default function Page({ project, doc, guest }: ShowcasePageProps) {
  const cast = castSpots(guest, SPOTS);
  const { hero } = doc;
  const year = project.year ?? (project.date?.match(/\d{4}/)?.[0] || '');
  const saleNo = `BN-${year || 'MMXXV'}`;
  const [name, sub] = hero.accent
    ? [hero.title, hero.accent]
    : (() => {
        const idx = project.title.indexOf(':');
        return idx === -1 ? [hero.title, undefined] : [project.title.slice(0, idx).trim(), project.title.slice(idx + 1).trim()];
      })();

  const plateMain: ThemedImage | null = hero.stage?.center
    ?? (project.cover ? { light: project.cover, alt: `${name} — main screen` } : null);
  const plateSecond: ThemedImage | null =
    hero.stage?.left ??
    hero.stage?.right ??
    (project.thumbnail && project.thumbnail !== plateMain?.light ? { light: project.thumbnail, alt: `${name} — title screen` } : null);

  const sold = /complete|shipped|live|done/i.test(project.status);
  const firstMd = doc.sections.findIndex((b) => b.type === 'markdown');
  const outroIndex = doc.sections.findIndex((b) => b.type === 'outro');
  const outro = outroIndex >= 0 ? (doc.sections[outroIndex] as Extract<Block, { type: 'outro' }>) : null;
  const facts = hero.facts ?? [];
  const tags = project.tags.length ? project.tags : (hero.badges ?? []).map((b) => b.label);
  const lots = doc.sections.filter((b) => b.type !== 'outro').length;
  const homeless = firstMd < 0 ? [cast.at(1), cast.at(4), cast.at(5), cast.at(6), cast.at(7)] : [];
  const gathering = [...homeless, ...cast.rest].filter((s): s is string => !!s);

  return (
    <div className={`pg-bidnest ${display.variable} ${text.variable}`}>
      <a className="bn-skip" href="#bn-main">
        Skip to the catalogue
      </a>

      {/* ------------------------------------------------ rail */}
      <nav className="bn-rail" aria-label="Page">
        <a className="bn-rail-back" href="/#work">
          <span aria-hidden="true">←</span> Return to the saleroom
        </a>
        <span className="bn-rail-mid" aria-hidden="true">
          The {name} Evening Sale
        </span>
        <span className="bn-rail-no">Sale {saleNo}</span>
      </nav>

      {/* ------------------------------------------------ cover */}
      <header className="bn-cover" data-tour="hero">
        <Guilloche className="bn-cover-rose" />
        <span className="bn-cover-mark" aria-hidden="true">
          {name.slice(0, 1)}
        </span>
        <WaveBand className="bn-band bn-band-top" />
        <div className="bn-cover-frame">
          <div className="bn-cover-top">
            <span>{hero.eyebrow || project.category}</span>
            <span className="bn-cover-date">{project.date ?? year}</span>
          </div>

          <div className="bn-cover-grid">
            <div className="bn-cover-copy">
              <p className="bn-cover-pre">An evening sale of one remarkable platform</p>
              <h1 className="bn-cover-title">
                <span className="bn-foil">{name}</span>
                {sub && <span className="bn-cover-sub">{sub}</span>}
              </h1>
              <span className="bn-rule bn-rule-gold" aria-hidden="true">
                <i />❖<i />
              </span>
              <p className="bn-cover-lede">{hero.lede}</p>

              {facts.length > 0 && (
                <dl className="bn-conditions">
                  {facts.map((f) => (
                    <div key={f.label}>
                      <dt>{f.label}</dt>
                      <dd>{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {tags.length > 0 && (
                <div className="bn-prov">
                  <p className="bn-prov-label">Provenance</p>
                  <ul>
                    {tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bn-actions">
                {(hero.actions ?? []).map((a, k) => (
                  <ActionLink key={a.href + k} a={a} i={k} />
                ))}
                <a className="bn-link" href="#bn-main">
                  Browse the catalogue ↓
                </a>
              </div>
            </div>

            <div className={`bn-cover-stage${cast.at(0) ? ' has-cast' : ''}`}>
            {cast.at(0) && (
              <div className="bn-cover-bidder">
                <CastSprite src={cast.at(0)} guest={guest} className="bn-cast bn-cast-cover" />
                <div className="bn-paddle bn-paddle-held" aria-hidden="true">
                  <span>Paddle</span>
                  <b>12</b>
                </div>
              </div>
            )}
            <div className="bn-cover-plates">
              {plateMain && (
                <figure className="bn-plate bn-plate-hero">
                  <span className="bn-plate-frame">
                    <img src={plateMain.light} alt={plateMain.alt} />
                  </span>
                  <figcaption className="bn-plate-cap">
                    <b>Plate I.</b> {plateMain.caption ?? plateMain.alt}
                  </figcaption>
                </figure>
              )}
              {plateSecond && (
                <figure className="bn-plate bn-plate-second">
                  <span className="bn-plate-frame">
                    <img src={plateSecond.light} alt={plateSecond.alt} loading="lazy" />
                  </span>
                  <figcaption className="bn-plate-cap">
                    <b>Plate II.</b> {plateSecond.caption ?? plateSecond.alt}
                  </figcaption>
                </figure>
              )}
              {sold && (
                <span className="bn-stamp" role="img" aria-label={`Status: ${project.status}`}>
                  Sold
                  <small>{project.status}</small>
                </span>
              )}
              {!cast.at(0) && (
                <div className="bn-paddle" aria-hidden="true">
                  <span>Paddle</span>
                  <b>12</b>
                </div>
              )}
            </div>
            </div>
          </div>

          <div className="bn-cover-foot">
            <Gavel className="bn-cover-gavel" />
            <p>
              {project.summary}
            </p>
            <span className="bn-cover-lots">
              {lots > 0 ? `${lots} section${lots > 1 ? 's' : ''} in this catalogue` : 'Catalogue'}
            </span>
          </div>
        </div>
        <WaveBand className="bn-band bn-band-bottom" />
      </header>

      <BidTicker />

      {/* ------------------------------------------------ catalogue */}
      <main id="bn-main" className="bn-main" tabIndex={-1}>
        {firstMd < 0 && (
          <section className="bn-sec">
            <div className="bn-wrap">
              <WorkedExample sprites={[cast.at(2), cast.at(3)]} guest={guest} />
            </div>
          </section>
        )}
        {doc.sections.map((b, i) => (
          <BlockView key={i} block={b} i={i} first={i === firstMd} cast={cast} guest={guest} />
        ))}

        {/* ------------------------------------------------ receipt */}
        <section
          className="bn-outro"
          {...(outroIndex >= 0 ? { 'data-tour': `section-${outroIndex}` } : {})}
          aria-labelledby="bn-receipt-title"
        >
          <Guilloche className="bn-outro-rose" />
          <div className="bn-outro-stage">
          <div className="bn-outro-side">
            <CastSprite src={cast.at(9)} guest={guest} className="bn-cast bn-cast-cheer" />
          </div>
          <div className="bn-outro-centre">
          {cast.at(8) && (
            <div className="bn-perch">
              <CastSprite src={cast.at(8)} guest={guest} className="bn-cast bn-cast-perch" />
            </div>
          )}
          <div className="bn-receipt">
            <div className="bn-receipt-head">
              <p className="bn-kicker">Bill of sale · No. {saleNo}-{pad(project.sortOrder % 100)}</p>
              <h2 id="bn-receipt-title" className="bn-receipt-title">
                {outro ? <Title title={outro.title} accentWord={outro.accentWord} /> : <>Sealed and <em>delivered</em></>}
              </h2>
            </div>
            <table className="bn-receipt-ledger">
              <caption className="bn-sr">Summary of the lot</caption>
              <tbody>
                <tr>
                  <th scope="row">Lot</th>
                  <td>{project.title}</td>
                </tr>
                <tr>
                  <th scope="row">Department</th>
                  <td>{project.category}</td>
                </tr>
                {project.role && (
                  <tr>
                    <th scope="row">Consigned by</th>
                    <td>{project.role}</td>
                  </tr>
                )}
                {(project.date || year) && (
                  <tr>
                    <th scope="row">Date of sale</th>
                    <td>{project.date ?? year}</td>
                  </tr>
                )}
                <tr>
                  <th scope="row">Materials</th>
                  <td>{tags.join(' · ')}</td>
                </tr>
                <tr className="bn-receipt-total">
                  <th scope="row">Hammer</th>
                  <td>{project.status}</td>
                </tr>
              </tbody>
            </table>
            <div className="bn-actions bn-actions-receipt">
              {(outro?.actions ?? hero.actions ?? []).map((a, k) => (
                <ActionLink key={a.href + k} a={a} i={k} />
              ))}
              {!(outro?.actions ?? []).some((a) => a.href === '/#work') && (
                <a className="bn-btn bn-btn-ghost" href="/#work">
                  Back to portfolio
                </a>
              )}
            </div>
            <Seal year={year || '2025'} />
            {sold && (
              <span className="bn-stamp bn-stamp-receipt" aria-hidden="true">
                Sold
              </span>
            )}
          </div>

          </div>
          <span className="bn-outro-side" aria-hidden="true" />
          </div>

          <div className="bn-terms">
            <p className="bn-kicker">Conditions of sale</p>
            <ol>
              <li>Every lot is offered as seen. The source is open for inspection at the repository listed above.</li>
              <li>
                Figures on the auctioneer&rsquo;s sheet are illustrative, worked from the roundoff and carry-forward rules
                in the case notes, and are not member data.
              </li>
              <li>
                Paddle numbers and bids in the ticker are theatre. The arithmetic behind them, in whole paise, is not.
              </li>
              <li>Screens are reproduced from the live build; images are shown as plates and may be cropped.</li>
            </ol>
          </div>

          {gathering.length > 0 && (
            <div className="bn-gathering">
              <p className="bn-kicker">Also in the saleroom tonight</p>
              <div className="bn-gathering-row">
                {gathering.map((src, k) => (
                  <CastSprite key={src + k} src={src} guest={guest} className="bn-cast bn-cast-crowd" />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
