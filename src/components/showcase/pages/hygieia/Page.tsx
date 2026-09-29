/* eslint-disable @next/next/no-img-element */
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import type { Action, Block, Head, ThemedImage } from '@/types/content';
import { Icon } from '../../ui';
import { CastSprite, castSpots } from '../cast';
import type { PageGuest, ShowcasePageProps } from '../types';
import { ChartTabs, DoctorsNotes, LightBox, ShiftCompare } from './client';
import './hygieia.css';

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--hy-sans',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--hy-mono',
  display: 'swap',
});

// ------------------------------------------------------------------ helpers

/** Same anchor scheme as the shared renderer, so deep links saved in /admin keep working. */
const anchor = (head: Head | undefined, type: string, i: number) =>
  `s-${(head?.label ?? type).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || i}`;

const isExternal = (a: Action) => a.external ?? /^https?:/i.test(a.href);

/** A PQRST complex repeated `beats` times, 200 units per beat on a 60-unit-tall strip. */
function ecgPath(beats: number) {
  let d = 'M0 40';
  for (let b = 0; b < beats; b++) {
    const x = b * 200;
    d += ` L${x + 56} 40 Q${x + 63} 31 ${x + 70} 40 L${x + 80} 40 L${x + 84} 46 L${x + 90} 4 L${x + 96} 56 L${x + 101} 40 L${x + 118} 40 Q${x + 132} 26 ${x + 146} 40 L${x + 200} 40`;
  }
  return d;
}

function Ecg({ label }: { label?: string }) {
  return (
    <div className="hy-ecg" aria-hidden="true">
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none">
        <g className="hy-ecg-trace">
          <path d={ecgPath(10)} />
        </g>
      </svg>
      {label && <span className="hy-ecg-label">{label}</span>}
    </div>
  );
}

function Cross({ size = 28 }: { size?: number }) {
  return (
    <svg className="hy-cross" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.5 2h7v6.5H22v7h-6.5V22h-7v-6.5H2v-7h6.5z" />
    </svg>
  );
}

function ActionLink({ action, resolve }: { action: Action; resolve?: (href: string) => string }) {
  const ext = isExternal(action);
  const href = resolve ? resolve(action.href) : action.href;
  const gh = /github\.com/i.test(action.href);
  return (
    <a
      href={href}
      className={`hy-btn ${action.kind === 'ghost' ? 'hy-btn--ghost' : 'hy-btn--solid'}`}
      {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {gh ? <span className="hy-btn-mark" aria-hidden="true">&lt;/&gt;</span> : <Cross size={12} />}
      <span>{action.label}</span>
      {ext && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}

/** One sprite spot: a pose, whether to mirror it so she faces the content, and who she is. */
type Spot = { src?: string; flip?: boolean; guest?: PageGuest };

function Sprite({ spot, className }: { spot?: Spot; className?: string }) {
  if (!spot?.src) return null;
  return (
    <CastSprite
      src={spot.src}
      guest={spot.guest}
      className={`hy-sprite${spot.flip ? ' is-flip' : ''}${className ? ` ${className}` : ''}`}
    />
  );
}

/** Content with a sprite standing in its own column beside it (never over it). */
function Beside({
  spot,
  side,
  sticky,
  children,
}: {
  spot?: Spot;
  side: 'left' | 'right';
  sticky?: boolean;
  children: React.ReactNode;
}) {
  if (!spot?.src) return <>{children}</>;
  return (
    <div className={`hy-beside hy-beside--${side}`}>
      <div className="hy-beside-main">{children}</div>
      <div className={`hy-beside-cast${sticky ? ' is-sticky' : ''}`}>
        <Sprite spot={spot} />
      </div>
    </div>
  );
}

function SectionHead({ head, kind, spot }: { head: Head; kind: string; spot?: Spot }) {
  if (spot?.src)
    return (
      <div className="hy-headrow">
        <SectionHead head={head} kind={kind} />
        <Sprite spot={spot} className="hy-sprite--head" />
      </div>
    );
  return (
    <div className="hy-head">
      <div className="hy-head-tag">
        <span className="hy-head-index">{head.index}</span>
        <span className="hy-head-label">{head.label}</span>
        <span className="hy-head-kind" aria-hidden="true">{kind}</span>
      </div>
      <h2 className="hy-h2">
        {head.title} {head.accentWord && <em>{head.accentWord}</em>}
      </h2>
      {head.lede && <p className="hy-head-lede">{head.lede}</p>}
    </div>
  );
}

/** The screen that should be shown by default: the light capture. */
const src = (img: ThemedImage) => img.light;

// ---------------------------------------------------------------- the page

/**
 * Where Frieren stands, in page order: spot 0 is the hero, then up to six sections, preferring the
 * ones with a natural place for her (lab report, slips, folders, notes...). Mirroring is per spot so
 * she faces the content beside her. Poses beyond the spots gather at the discharge summary.
 */
const PREFERRED = ['cards', 'table', 'tabs', 'steps', 'columns', 'markdown'];
const FALLBACK = ['overview', 'gallery', 'phones', 'compare', 'duo'];
const FLIP = [false, true, false, false, true, false, true];

function planSpots(sections: Block[]) {
  const pick = (types: string[]) =>
    sections.map((b, i) => (types.includes(b.type) ? i : -1)).filter((i) => i >= 0);
  const chosen = pick(PREFERRED).slice(0, 6);
  for (const i of pick(FALLBACK)) if (chosen.length < 6) chosen.push(i);
  return chosen.sort((a, b) => a - b);
}

export default function Page({ project, doc, guest }: ShowcasePageProps) {
  const { hero } = doc;
  const spotted = planSpots(doc.sections);
  const cast = castSpots(guest, 1 + spotted.length);
  const spot = (k: number): Spot => ({ src: cast.at(k), flip: FLIP[k % FLIP.length], guest });
  const sectionSpot = (i: number) => {
    const k = spotted.indexOf(i);
    return k >= 0 ? spot(k + 1) : undefined;
  };
  const hasOutro = doc.sections.some((b) => b.type === 'outro');
  const anchors = doc.sections.map((b, i) => anchor('head' in b ? b.head : undefined, b.type, i));
  const tabsIndex = doc.sections.findIndex((b) => b.type === 'tabs');

  /** In-page links that point at no section fall back to the model pipelines (the tabs block). */
  const resolve = (href: string) => {
    if (!href.startsWith('#')) return href;
    if (anchors.includes(href.slice(1))) return href;
    return tabsIndex >= 0 ? `#${anchors[tabsIndex]}` : href;
  };

  const chartNo = `HYG-${(project.year ?? '0000').replace(/\D/g, '')}-${String(project.sortOrder).padStart(3, '0')}`;
  const hasBackAction = [...(hero.actions ?? [])].some((a) => a.href === '/#work');

  return (
    <div className={`pg-hygieia ${sans.variable} ${mono.variable}`}>
      <a href="#hy-main" className="hy-skip">Skip to the chart</a>

      <nav className="hy-topbar" aria-label="Project">
        <a href="/#work" className="hy-back">
          <span aria-hidden="true">&larr;</span> Back to portfolio
        </a>
        <span className="hy-topbar-meta" aria-hidden="true">
          <Cross size={14} /> Ward: {project.category} &middot; Chart {chartNo}
        </span>
      </nav>

      {/* ------------------------------------------------------------ hero */}
      <header className="hy-hero" data-tour="hero">
        <div className="hy-board">
          <div className="hy-clip" aria-hidden="true">
            <span />
          </div>
          <div className="hy-sheet">
            <div className="hy-sheet-head">
              <div className="hy-sheet-brand">
                <Cross size={30} />
                <div>
                  <span className="hy-mono-s">Intake record</span>
                  <strong>{project.tagline ?? project.category}</strong>
                </div>
              </div>
              <dl className="hy-sheet-ids">
                <div>
                  <dt>Chart no.</dt>
                  <dd>{chartNo}</dd>
                </div>
                {project.date && (
                  <div>
                    <dt>Admitted</dt>
                    <dd>{project.date}</dd>
                  </div>
                )}
                <div>
                  <dt>Status</dt>
                  <dd>
                    <span className="hy-status-dot" aria-hidden="true" /> {project.status}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="hy-hero-grid">
              <div className="hy-hero-copy">
                <p className="hy-field-label">Subject</p>
                <p className="hy-subject">{project.title}</p>
                {hero.eyebrow && <p className="hy-eyebrow">{hero.eyebrow}</p>}
                <h1 className="hy-h1">
                  {hero.title}
                  {hero.accent && (
                    <>
                      {' '}
                      <span className="hy-h1-accent">{hero.accent}</span>
                    </>
                  )}
                </h1>
                <p className="hy-lede">{hero.lede}</p>

                {hero.badges && hero.badges.length > 0 && (
                  <ul className="hy-triage" aria-label="Highlights">
                    {hero.badges.map((b, i) => (
                      <li key={i} className={b.tone === 'accent' ? 'is-red' : `is-t${i % 3}`}>
                        {b.label}
                      </li>
                    ))}
                  </ul>
                )}

                <div className={cast.at(0) ? 'hy-intake has-cast' : 'hy-intake'}>
                  {hero.facts && hero.facts.length > 0 && (
                    <dl className="hy-facts">
                      {hero.facts.map((f, i) => (
                        <div key={i}>
                          <dt>{f.label}</dt>
                          <dd>{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <Sprite spot={spot(0)} className="hy-sprite--hero" />
                </div>

                <div className="hy-actions">
                  {(hero.actions ?? []).map((a, i) => (
                    <ActionLink key={i} action={a} resolve={resolve} />
                  ))}
                  {!hasBackAction && (hero.actions ?? []).length === 0 && (
                    <a className="hy-btn hy-btn--ghost" href="/#work">Back to portfolio</a>
                  )}
                </div>
              </div>

              {hero.stage && (
                <div className="hy-hero-stage">
                  <figure className="hy-monitor">
                    <div className="hy-monitor-bar" aria-hidden="true">
                      <span className="hy-monitor-led" />
                      <span>Monitor 01</span>
                      {hero.stage.url && <span className="hy-monitor-url">{hero.stage.url}</span>}
                    </div>
                    <div className="hy-monitor-screen">
                      <img src={src(hero.stage.center)} alt={hero.stage.center.alt} />
                    </div>
                  </figure>
                  <div className="hy-films">
                    {[hero.stage.left, hero.stage.right].filter(Boolean).map((img, i) => (
                      <figure key={i} className={`hy-film hy-film--${i}`}>
                        <span className="hy-paperclip" aria-hidden="true" />
                        <img src={src(img!)} alt={img!.alt} loading="lazy" />
                        <figcaption>
                          <span aria-hidden="true">Exhibit {String.fromCharCode(65 + i)} &middot; </span>
                          {img!.caption ?? img!.alt}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="hy-strip">
              <Ecg label="Lead II · 25 mm/s" />
              {project.tags.length > 0 && (
                <ul className="hy-tags" aria-label="Tags">
                  {project.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------- sections */}
      <main id="hy-main" className="hy-main">
        {doc.sections.map((block, i) => (
          <BlockView
            key={i}
            block={block}
            i={i}
            id={anchors[i]}
            resolve={resolve}
            spot={sectionSpot(i)}
            rest={block.type === 'outro' ? cast.rest : undefined}
            guest={guest}
          />
        ))}
        {!hasOutro && cast.rest.length > 0 && (
          <div className="hy-sec">
            <CastGroup poses={cast.rest} guest={guest} />
          </div>
        )}
      </main>
    </div>
  );
}

// ------------------------------------------------------------------ blocks

function BlockView({
  block,
  i,
  id,
  resolve,
  spot,
  rest,
  guest,
}: {
  block: Block;
  i: number;
  id: string;
  resolve: (href: string) => string;
  spot?: Spot;
  rest?: string[];
  guest?: PageGuest;
}) {
  const tour = `section-${i}`;

  switch (block.type) {
    // Vitals monitor
    case 'stats':
      return (
        <section className="hy-sec hy-vitals" id={id} data-tour={tour} aria-label="Key figures">
          <div className="hy-vitals-bezel">
            {block.items.map((s, k) => (
              <div key={k} className={`hy-vital hy-vital--${k % 4}`}>
                <span className="hy-vital-ch" aria-hidden="true">
                  CH{k + 1}
                </span>
                <strong className="hy-vital-val">{s.value}</strong>
                <span className="hy-vital-lab">{s.label}</span>
                <svg className="hy-vital-spark" viewBox="0 0 120 24" aria-hidden="true" preserveAspectRatio="none">
                  <path d={`M0 14 L${20 + k * 7} 14 L${26 + k * 7} 4 L${32 + k * 7} 22 L${38 + k * 7} 14 L120 14`} />
                </svg>
              </div>
            ))}
          </div>
        </section>
      );

    // History of present illness
    case 'overview':
      return (
        <section className="hy-sec" id={id} data-tour={tour}>
          <SectionHead head={block.head} kind="History" spot={spot} />
          <div className="hy-overview">
            <div className="hy-ruled">
              {block.paragraphs.map((p, k) => (
                <p key={k}>{p}</p>
              ))}
            </div>
            {block.features && block.features.length > 0 && (
              <ul className="hy-checklist" aria-label="Findings">
                {block.features.map((f, k) => (
                  <li key={k}>
                    <span className="hy-check-box" aria-hidden="true">
                      <Icon name={f.icon} size={16} />
                    </span>
                    <div>
                      <strong>{f.title}</strong>
                      <p>{f.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      );

    // Prescription slips
    case 'cards':
      return (
        <section className="hy-sec" id={id} data-tour={tour}>
          <SectionHead head={block.head} kind="Prescriptions" spot={spot} />
          <ul className="hy-rx-grid">
            {block.items.map((c, k) => (
              <li key={k} className="hy-rx" style={{ ['--hue' as string]: c.hue ?? '#0f766e' }}>
                <div className="hy-rx-top">
                  <span className="hy-rx-mark" aria-hidden="true">
                    R<sub>x</sub>
                  </span>
                  <span className="hy-rx-no" aria-hidden="true">
                    No. {String(k + 1).padStart(2, '0')}
                  </span>
                  <span className="hy-rx-icon" aria-hidden="true">
                    <Icon name={c.icon} size={18} />
                  </span>
                </div>
                <h3>{c.title}</h3>
                {c.subtitle && <p className="hy-rx-sub">{c.subtitle}</p>}
                {c.value && (
                  <p className="hy-rx-dose">
                    <strong>{c.value}</strong>
                    {c.valueLabel && <span>{c.valueLabel}</span>}
                  </p>
                )}
                {c.meta && <p className="hy-rx-meta">{c.meta}</p>}
                <span className="hy-rx-sign" aria-hidden="true">
                  Dispense as trained
                </span>
              </li>
            ))}
          </ul>
        </section>
      );

    // Lab report
    case 'table':
      return (
        <section className="hy-sec" id={id} data-tour={tour}>
          {block.head && <SectionHead head={block.head} kind="Laboratory" />}
          <Beside spot={spot} side="right">
          <div className="hy-lab">
            <div className="hy-lab-head" aria-hidden="true">
              <span>
                <Cross size={14} /> Laboratory report
              </span>
              <span>Flag &#9660; = below 90%</span>
            </div>
            <div className="hy-lab-scroll" tabIndex={0} role="region" aria-label={block.head?.title ?? 'Results table'}>
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
                      {r.map((cell, c) => {
                        const pct = /^(\d+(?:\.\d+)?)%$/.exec(cell.trim());
                        const low = pct ? parseFloat(pct[1]) < 90 : false;
                        return c === 0 ? (
                          <th key={c} scope="row">
                            <span
                              className="hy-lab-dot"
                              style={{ background: block.hues?.[k] ?? 'var(--hy-teal)' }}
                              aria-hidden="true"
                            />
                            {cell}
                          </th>
                        ) : (
                          <td key={c} className={pct ? `hy-num${low ? ' is-low' : ''}` : undefined}>
                            {cell}
                            {low && (
                              <>
                                <span className="hy-flag" aria-hidden="true">
                                  &#9660;
                                </span>
                                <span className="sr-only"> (flagged: below 90%)</span>
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </Beside>
        </section>
      );

    // Care pathways (folder tabs)
    case 'tabs':
      return (
        <section className="hy-sec" id={id} data-tour={tour}>
          <SectionHead head={block.head} kind="Care pathway" spot={spot} />
          <ChartTabs tabs={block.tabs} uid={id} />
        </section>
      );

    // Clinical observations with attached films
    case 'steps':
      return (
        <section className="hy-sec" id={id} data-tour={tour}>
          <SectionHead head={block.head} kind="Observations" spot={spot} />
          <ol className="hy-obs">
            {block.items.map((s, k) => (
              <li key={k} className="hy-obs-item">
                <div className="hy-obs-note">
                  <span className="hy-obs-time" aria-hidden="true">
                    Obs. {String(k + 1).padStart(2, '0')}
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  {s.ticks && s.ticks.length > 0 && (
                    <ul className="hy-ticks">
                      {s.ticks.map((t, j) => (
                        <li key={j}>{t}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <figure className={`hy-obs-film${s.tall ? ' is-tall' : ''}`}>
                  <span className="hy-tape" aria-hidden="true" />
                  <div className="hy-scrollshot" tabIndex={0}>
                    <img src={src(s.image)} alt={s.image.alt} loading="lazy" />
                  </div>
                  <figcaption>{s.image.caption ?? s.image.alt}</figcaption>
                </figure>
              </li>
            ))}
          </ol>
        </section>
      );

    case 'compare':
      return (
        <section className="hy-sec" id={id} data-tour={tour}>
          <SectionHead head={block.head} kind="Day / night" spot={spot} />
          <ShiftCompare image={block.image} />
        </section>
      );

    // Bedside devices
    case 'phones':
      return (
        <section className="hy-sec" id={id} data-tour={tour}>
          <SectionHead head={block.head} kind="Bedside" spot={spot} />
          <ul className="hy-phones">
            {block.items.map((p, k) => (
              <li key={k}>
                <div className="hy-phone" tabIndex={0}>
                  <span className="hy-phone-notch" aria-hidden="true" />
                  <img src={src(p)} alt={p.alt} loading="lazy" />
                </div>
                <span className="hy-phone-cap">{p.caption ?? p.alt}</span>
              </li>
            ))}
          </ul>
        </section>
      );

    // Protocols + formulary
    case 'columns':
      return (
        <section className="hy-sec" id={id} data-tour={tour}>
          <SectionHead head={block.head} kind="Protocol" />
          <Beside spot={spot} side="left">
          <div className="hy-protocol">
            {block.columns.map((c, k) => (
              <div key={k} className={`hy-proto hy-proto--${c.style}`}>
                <h3>
                  <span aria-hidden="true">{c.style === 'chips' ? 'Formulary' : `Layer ${k + 1}`}</span>
                  {c.title}
                </h3>
                {c.style === 'chips' ? (
                  <ul className="hy-pills">
                    {c.items.map((it, j) => (
                      <li key={j}>{it}</li>
                    ))}
                  </ul>
                ) : (
                  <ul className="hy-ticks">
                    {c.items.map((it, j) => (
                      <li key={j}>{it}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          </Beside>
        </section>
      );

    // X-ray light box
    case 'gallery':
      return (
        <section className="hy-sec" id={id} data-tour={tour}>
          <SectionHead head={block.head} kind="Radiology" spot={spot} />
          <LightBox items={block.items} />
        </section>
      );

    case 'markdown':
      return (
        <section className="hy-sec" id={id} data-tour={tour}>
          <SectionHead head={block.head} kind="Doctor's notes" />
          <Beside spot={spot} side="right" sticky>
            <DoctorsNotes file={block.file} />
          </Beside>
        </section>
      );

    // Discharge summary
    case 'outro':
      return (
        <section className="hy-sec hy-discharge" id={id} data-tour={tour}>
          <div className={spot?.src || rest?.length ? 'hy-discharge-wrap has-cast' : 'hy-discharge-wrap'}>
          <div className="hy-discharge-slip">
            <div className="hy-discharge-head" aria-hidden="true">
              <Cross size={18} /> Discharge summary
            </div>
            <h2 className="hy-h2 hy-h2--big">
              {block.title} {block.accentWord && <em>{block.accentWord}</em>}
            </h2>
            <div className="hy-actions">
              {block.actions.map((a, k) => (
                <ActionLink key={k} action={a} resolve={resolve} />
              ))}
              {!block.actions.some((a) => a.href === '/#work') && (
                <a className="hy-btn hy-btn--ghost" href="/#work">
                  Back to portfolio
                </a>
              )}
            </div>
            <div className="hy-signature" aria-hidden="true">
              <span>Attending</span>
              <span className="hy-signature-line" />
              <span>Discharged in good condition</span>
            </div>
          </div>
          {(spot?.src || (rest && rest.length > 0)) && (
            <CastGroup poses={[...(spot?.src ? [spot.src] : []), ...(rest ?? [])]} guest={guest} />
          )}
          </div>
        </section>
      );

    // Pager ticker
    case 'marquee':
      return (
        <section className="hy-sec" id={id} data-tour={tour} aria-label="Notes">
          <ul className="hy-pager">
            {block.items.map((t, k) => (
              <li key={k}>{t}</li>
            ))}
          </ul>
        </section>
      );

    // Two builds as two referrals
    case 'duo':
      return (
        <section className="hy-sec" id={id} data-tour={tour}>
          <SectionHead head={block.head} kind="Referral" spot={spot} />
          <div className="hy-duo">
            {block.sides.map((s, k) => (
              <article key={k} className="hy-proto">
                <p className="hy-field-label">{s.eyebrow}</p>
                <h3>{s.title}</h3>
                <p className="hy-duo-body">{s.body}</p>
                <div className={s.device === 'phone' ? 'hy-phone' : 'hy-obs-film'}>
                  <img src={src(s.image)} alt={s.image.alt} loading="lazy" />
                </div>
                <ul className="hy-ticks">
                  {s.points.map((p, j) => (
                    <li key={j}>{p}</li>
                  ))}
                </ul>
                {s.url && (
                  <a className="hy-btn hy-btn--ghost" href={s.url} target="_blank" rel="noopener noreferrer">
                    Open
                  </a>
                )}
              </article>
            ))}
          </div>
          {block.shared && (
            <div className="hy-proto hy-proto--chips hy-duo-shared">
              <h3>{block.shared.title}</h3>
              <ul className="hy-pills">
                {block.shared.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      );

    // Anything added later in /admin still shows up, as an addendum to the chart.
    default: {
      const b = block as { type: string; head?: Head } & Record<string, unknown>;
      const strings = collectStrings(b).slice(0, 24);
      return (
        <section className="hy-sec" id={id} data-tour={tour}>
          {b.head ? <SectionHead head={b.head} kind="Addendum" /> : null}
          <div className="hy-proto">
            <h3>
              <span aria-hidden="true">Addendum</span>
              {b.type}
            </h3>
            <ul className="hy-ticks">
              {strings.map((s, k) => (
                <li key={k}>{s}</li>
              ))}
            </ul>
          </div>
        </section>
      );
    }
  }
}

/** Every pose not given a spot of its own, lined up like staff signing off a chart. */
function CastGroup({ poses, guest }: { poses: string[]; guest?: PageGuest }) {
  return (
    <div className="hy-castgroup">
      {poses.map((p, k) => (
        <Sprite key={k} spot={{ src: p, guest, flip: k % 2 === 1 }} />
      ))}
    </div>
  );
}

/** Readable text found anywhere in an unknown block (skips ids, paths and the head). */
function collectStrings(v: unknown, out: string[] = [], key = ''): string[] {
  if (typeof v === 'string') {
    if (key !== 'type' && !/^(\/|#|https?:)/.test(v) && v.trim()) out.push(v);
  } else if (Array.isArray(v)) {
    v.forEach((x) => collectStrings(x, out, key));
  } else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) if (k !== 'head') collectStrings(x, out, k);
  }
  return out;
}
