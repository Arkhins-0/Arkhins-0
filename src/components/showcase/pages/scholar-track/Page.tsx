/* eslint-disable @next/next/no-img-element */
import { Fragment } from 'react';
import { IBM_Plex_Mono, Source_Serif_4 } from 'next/font/google';
import type { Action, Block, Head, ShowcaseDoc, ThemedImage } from '@/types/content';
import type { PageGuest, ShowcasePageProps } from '../types';
import { CastSprite, castSpots } from '../cast';
import { CompareFigure, Manuscript, Plate, PlateDesk } from './client';
import './scholar.css';

/**
 * Scholar Track, typeset as a journal paper: title block, abstract, numbered sections in two
 * columns, captioned figures and tables, a references list and a peer-review sidebar.
 * Everything is rendered from the showcase document so /admin edits keep showing up.
 */

const serif = Source_Serif_4({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--st-serif',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--st-mono',
  display: 'swap',
});

// ------------------------------------------------------------------ helpers

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
const roman = (n: number) => ROMAN[n - 1] ?? String(n);
const alpha = (n: number) => String.fromCharCode(97 + (n % 26));
const LOWER_ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function blockHead(b: Block): Head | undefined {
  return 'head' in b ? b.head : undefined;
}

/** Arrow-separated states in a lede ("A → B → C") become a transition diagram. */
function phasesOf(lede?: string) {
  if (!lede || !lede.includes('→')) return null;
  const parts = lede.split('→').map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts : null;
}

function isExternal(a: Action) {
  return a.external || /^https?:\/\//.test(a.href);
}

function Link({ a, className }: { a: Action; className?: string }) {
  const ext = isExternal(a);
  return (
    <a
      href={a.href}
      className={className}
      data-kind={a.kind ?? 'solid'}
      {...(ext ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
    >
      {a.label}
      {ext && <span aria-hidden="true"> ↗</span>}
      {ext && <span className="st-sr">(opens in a new tab)</span>}
    </a>
  );
}

/** Figure and table counters, assigned in page order during render. */
class Counter {
  fig = 1;
  tab = 0;
  eq = 0;
  nextFig() {
    this.fig += 1;
    return this.fig;
  }
  nextTab() {
    this.tab += 1;
    return this.tab;
  }
}

// ------------------------------------------------------------------ page

export default function Page({ project, doc, guest, author }: ShowcasePageProps) {
  const AUTHOR = author ?? '';
  const { hero } = doc;
  const year = project.year ?? (project.date?.match(/\d{4}/)?.[0] || '');
  const doi = `10.${year || '0000'}/${project.slug}`;
  const manuscript = `ST-${year || '0000'}-${String(project.sortOrder).padStart(4, '0')}`;
  const counter = new Counter();

  // Guest sprites, in page order: 0 abstract margin, 1 review rail, 2 equations, 3 Table 1,
  // 4 comparison figure, 5 conclusion. A spot whose block is missing hands its pose to the
  // appendix plate beside the references, along with every pose beyond the six spots.
  const SPOTS = 6;
  const cast = castSpots(guest, SPOTS);
  const hasSpot = [
    true,
    true,
    doc.sections.some((b) => b.type === 'stats'),
    doc.sections.some((b) => b.type === 'overview' && !!b.features?.length),
    doc.sections.some((b) => b.type === 'compare'),
    doc.sections.some((b) => b.type === 'outro'),
  ];
  const leftovers = [
    ...Array.from({ length: SPOTS }, (_, k) => (hasSpot[k] ? undefined : cast.at(k))).filter(
      (x): x is string => !!x
    ),
    ...cast.rest,
  ];
  const sprites: Sprites = { at: (k) => (hasSpot[k] ? cast.at(k) : undefined), guest };

  // numbered sections: every block with a head gets a roman numeral, in page order
  let n = 0;
  const numbers = doc.sections.map((b) => (blockHead(b) ? ++n : 0));
  const contents = doc.sections
    .map((b, i) => ({ head: blockHead(b), i, num: numbers[i] }))
    .filter((x): x is { head: Head; i: number; num: number } => !!x.head);

  const stepsBlock = doc.sections.find((b): b is Extract<Block, { type: 'steps' }> => b.type === 'steps');
  const outro = doc.sections.find((b): b is Extract<Block, { type: 'outro' }> => b.type === 'outro');

  // references: every outbound link the document mentions, de-duplicated
  const refs: { label: string; href: string }[] = [];
  const addRef = (label: string, href?: string | null) => {
    if (!href || href.startsWith('#') || refs.some((r) => r.href === href)) return;
    refs.push({ label, href });
  };
  hero.actions?.forEach((a) => addRef(a.label, a.href));
  outro?.actions.forEach((a) => addRef(a.label, a.href));
  addRef('Source repository', project.githubUrl);
  addRef('Live deployment', project.liveUrl);
  doc.sections.forEach((b) => {
    if (b.type === 'markdown') addRef(`${b.head.label} (manuscript source)`, b.file);
  });

  const stage = hero.stage;
  const subfigs = stage ? [stage.center, stage.left, stage.right].filter(Boolean) as ThemedImage[] : [];

  return (
    <div className={`pg-scholar ${serif.variable} ${mono.variable}`}>
      <PlateDesk>
        <a href="#st-main" className="st-skip">Skip to the paper</a>

        {/* running head */}
        <header className="st-running">
          <a href="/#work" className="st-back">
            <span aria-hidden="true">←</span> Return to index
          </a>
          <span className="st-running-mid">{project.category} · Preprint · {project.status}</span>
          <span className="st-mono st-running-doi">doi:{doi}</span>
        </header>

        <article className="st-sheet" id="st-main">
          <span className="st-arxiv" aria-hidden="true">
            {manuscript} [{project.category.toLowerCase()}.SE] {project.date ?? year}
          </span>

          {/* ------------------------------------------------ title block */}
          <section className="st-titleblock" data-tour="hero" aria-labelledby="st-title">
            <p className="st-journal">
              <span>Proceedings of the Portfolio</span>
              <span aria-hidden="true"> · </span>
              <span className="st-mono">Vol. {year} · No. {String(project.sortOrder).padStart(2, '0')}</span>
            </p>
            {hero.eyebrow && <p className="st-eyebrow">{hero.eyebrow}</p>}
            <h1 id="st-title" className="st-title">
              {hero.title}
              {hero.accent && (
                <>
                  {' '}
                  <em>{hero.accent}</em>
                </>
              )}
            </h1>
            <p className="st-subtitle">{project.title}</p>

            <p className="st-authors">
              {AUTHOR && (
                <span className="st-author">
                  {AUTHOR}
                  <sup>1</sup>
                </span>
              )}
            </p>
            <p className="st-affil">
              <sup>1</sup> {project.role ?? 'Author'} · {project.category}
              {project.date ? ` · ${project.date}` : ''}
            </p>
            <p className="st-ids st-mono">
              <span>doi:{doi}</span>
              <span>Manuscript {manuscript}</span>
              <span>Status: {project.status}</span>
            </p>

            <div className="st-front">
              <div className="st-abstract">
                <p>
                  <strong className="st-runin">Abstract—</strong>
                  {hero.lede}
                </p>
                {hero.badges && hero.badges.length > 0 && (
                  <p className="st-keywords">
                    <strong className="st-runin">Index Terms—</strong>
                    {hero.badges.map((b, i) => (
                      <Fragment key={i}>
                        <span className={b.tone === 'accent' ? 'st-kw-accent' : undefined}>{b.label}</span>
                        {i < hero.badges!.length - 1 ? '; ' : '.'}
                      </Fragment>
                    ))}
                  </p>
                )}
                {project.tags.length > 0 && (
                  <p className="st-ccs st-mono">
                    <span className="st-ccs-label">CCS</span>
                    {project.tags.join(' → ')}
                  </p>
                )}
              </div>

              {hero.facts && hero.facts.length > 0 && (
                <table className="st-booktabs st-facts">
                  <caption>Manuscript metadata</caption>
                  <tbody>
                    {hero.facts.map((f, i) => (
                      <tr key={i}>
                        <th scope="row">{f.label}</th>
                        <td>{f.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <Sprite s={sprites} k={0} className="st-spot st-spot-abstract" />
            </div>

            {hero.actions && hero.actions.length > 0 && (
              <nav className="st-actions" aria-label="Paper actions">
                <span className="st-actions-label">Available at</span>
                {hero.actions.map((a, i) => (
                  <Link key={i} a={a} className="st-btn" />
                ))}
              </nav>
            )}

            {stage && subfigs.length > 0 && (
              <figure className="st-figure st-fig1">
                <div className="st-fig1-grid" data-count={subfigs.length}>
                  {subfigs.map((img, i) => (
                    <div key={i} className={i === 0 ? 'st-sub st-sub-main' : 'st-sub'}>
                      <Plate items={subfigs} index={i} className="st-plate">
                        <img src={img.light} alt={img.alt} loading={i === 0 ? 'eager' : 'lazy'} />
                      </Plate>
                      <span className="st-subcap">
                        ({alpha(i)}) {img.caption ?? img.alt}
                      </span>
                    </div>
                  ))}
                </div>
                <figcaption>
                  <span className="st-figlabel">Figure 1:</span>{' '}
                  {subfigs.map((s, i) => `(${alpha(i)}) ${s.caption ?? s.alt}`).join('; ')}.
                  {stage.url && (
                    <>
                      {' '}Captured at <span className="st-mono">{stage.url}</span>.
                    </>
                  )}
                </figcaption>
              </figure>
            )}
          </section>

          {/* ------------------------------------------------ body + review rail */}
          <div className="st-bodygrid">
            <aside className="st-review" aria-label="Peer review record">
              <div className="st-review-inner">
                <p className="st-review-kicker">Peer review record</p>
                <dl className="st-review-meta st-mono">
                  <div><dt>Manuscript</dt><dd>{manuscript}</dd></div>
                  {project.date && <div><dt>Received</dt><dd>{project.date}</dd></div>}
                  <div><dt>Decision</dt><dd>{project.status}</dd></div>
                </dl>

                <ul className="st-referees">
                  {['Referee 1', 'Referee 2', 'Handling editor'].map((r, i) => (
                    <li key={r}>
                      <span>{r}</span>
                      <span className="st-stamp st-stamp-sm" style={{ ['--r' as string]: `${[-7, 5, -3][i]}deg` }}>
                        Approved
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="st-stamp st-stamp-lg" aria-label={`Committee approved, ${project.status}`}>
                  <span>Committee</span>
                  <strong>Approved</strong>
                  <span className="st-mono">{project.status} · {year}</span>
                </div>

                <Sprite s={sprites} k={1} className="st-spot st-spot-rail" />

                {stepsBlock && stepsBlock.items.length > 0 && (
                  <div className="st-mini-gantt">
                    <p className="st-review-kicker">Review timeline</p>
                    <Gantt items={stepsBlock.items.map((s) => s.title)} phases={phasesOf(stepsBlock.head.lede)} compact />
                  </div>
                )}

                {contents.length > 0 && (
                  <nav className="st-toc" aria-label="Contents">
                    <p className="st-review-kicker">Contents</p>
                    <ol>
                      {contents.map((c) => (
                        <li key={c.i}>
                          <a href={`#s-${slugify(c.head.label)}`}>
                            <span className="st-mono">{roman(c.num)}.</span> {c.head.label}
                          </a>
                        </li>
                      ))}
                      <li>
                        <a href="#st-references"><span className="st-mono">—</span> References</a>
                      </li>
                    </ol>
                  </nav>
                )}
              </div>
            </aside>

            <div className="st-body">
              {doc.sections.map((b, i) => (
                <BlockView key={i} block={b} i={i} num={numbers[i]} counter={counter} doc={doc} sprites={sprites} />
              ))}

              <section className="st-section st-refs" id="st-references" aria-labelledby="st-refs-h">
                <h2 id="st-refs-h" className="st-h2 st-h2-plain">References</h2>
                <ol className="st-reflist">
                  {refs.map((r, i) => (
                    <li key={r.href}>
                      <span className="st-refnum st-mono">[{i + 1}]</span>
                      <span>
                        {AUTHOR ? `${AUTHOR}, ` : ''}“{r.label},” <em>{project.title}</em>
                        {year ? `, ${year}` : ''}. [Online]. Available:{' '}
                        <a
                          href={r.href}
                          className="st-mono st-url"
                          {...(/^https?:/.test(r.href) ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                        >
                          {r.href.replace(/^https?:\/\//, '')}
                        </a>
                      </span>
                    </li>
                  ))}
                  <li>
                    <span className="st-refnum st-mono">[{refs.length + 1}]</span>
                    <span>
                      “Portfolio index,” <a href="/#work" className="st-url st-mono">/#work</a>.
                    </span>
                  </li>
                </ol>
              </section>

              {leftovers.length > 0 && (
                <figure className="st-figure st-appendix">
                  <div className="st-appendix-row">
                    {leftovers.map((src, k) => (
                      <CastSprite key={k} src={src} guest={guest} className="st-sprite" />
                    ))}
                  </div>
                  <figcaption>
                    <span className="st-figlabel">Plate A:</span> The remaining members of the review committee
                    {guest ? `, chaired by ${guest.name}` : ''}.
                  </figcaption>
                </figure>
              )}

              <footer className="st-footnotes">
                <p>
                  <sup>1</sup> Correspondence: {project.role ?? 'Author'}. {project.summary}
                </p>
                {project.description && (
                  <p>
                    <sup>2</sup> {project.description}
                  </p>
                )}
                <p className="st-folio st-mono" aria-hidden="true">— {project.slug} · {doi} —</p>
              </footer>
            </div>
          </div>
        </article>
      </PlateDesk>
    </div>
  );
}

// ------------------------------------------------------------------ guest sprites

type Sprites = { at: (k: number) => string | undefined; guest?: PageGuest };

/** One pose in a reserved margin cell; renders nothing when the spot has no pose. */
function Sprite({ s, k, className }: { s: Sprites; k: number; className: string }) {
  const src = s.at(k);
  if (!src) return null;
  return (
    <span className={className} data-spot={k}>
      <CastSprite src={src} guest={s.guest} className="st-sprite" />
    </span>
  );
}

// ------------------------------------------------------------------ section heading

function SectionHead({ head, num }: { head: Head; num: number }) {
  return (
    <header className="st-shead">
      <h2 className="st-h2">
        <span className="st-secnum">{roman(num)}.</span> {head.label}
      </h2>
      <p className="st-h2-title">
        {head.title}
        {head.accentWord && (
          <>
            {' '}
            <em>{head.accentWord}</em>
          </>
        )}
      </p>
    </header>
  );
}

// ------------------------------------------------------------------ blocks

function BlockView({
  block: b,
  i,
  num,
  counter,
  doc,
  sprites,
}: {
  block: Block;
  i: number;
  num: number;
  counter: Counter;
  doc: ShowcaseDoc;
  sprites: Sprites;
}) {
  const head = blockHead(b);
  const id = head ? `s-${slugify(head.label)}` : `s-block-${i}`;
  const common = { 'data-tour': `section-${i}`, id, className: `st-section st-${b.type}` };

  switch (b.type) {
    case 'stats':
      return (
        <section {...common} aria-label="Key results">
          <div className="st-withspot st-withspot-eq">
          <Sprite s={sprites} k={2} className="st-spot st-spot-eq" />
          <div className="st-eqbox">
            <p className="st-eqbox-label">Key results</p>
            <ol className="st-eqs">
              {b.items.map((s, k) => {
                counter.eq += 1;
                return (
                  <li key={k}>
                    <span className="st-eq">
                      <span className="st-eq-var"><i>x</i><sub>{counter.eq}</sub></span>
                      <span className="st-eq-rel" aria-hidden="true">=</span>
                      <span className="st-eq-val">{s.value}</span>
                    </span>
                    <span className="st-eq-label">{s.label}</span>
                    <span className="st-eq-num st-mono">({counter.eq})</span>
                  </li>
                );
              })}
            </ol>
          </div>
          </div>
        </section>
      );

    case 'overview': {
      const t = b.features?.length ? counter.nextTab() : 0;
      return (
        <section {...common} aria-labelledby={`${id}-h`}>
          <div id={`${id}-h`}><SectionHead head={b.head} num={num} /></div>
          {b.head.lede && <p className="st-lede">{b.head.lede}</p>}
          <div className="st-cols st-dropcap">
            {b.paragraphs.map((p, k) => <p key={k}>{p}</p>)}
          </div>
          {b.features && b.features.length > 0 && (
            <div className="st-withspot st-withspot-table">
            <Sprite s={sprites} k={3} className="st-spot st-spot-table" />
            <div className="st-tablewrap">
              <table className="st-booktabs st-wide">
                <caption>
                  <span className="st-figlabel">Table {t}:</span> {b.head.label}: components and responsibilities.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Component</th>
                    <th scope="col">Responsibility</th>
                  </tr>
                </thead>
                <tbody>
                  {b.features.map((f, k) => (
                    <tr key={k}>
                      <td className="st-mono">{String(k + 1).padStart(2, '0')}</td>
                      <th scope="row">{f.title}</th>
                      <td>{f.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          )}
        </section>
      );
    }

    case 'steps': {
      const phases = phasesOf(b.head.lede);
      const ganttFig = counter.nextFig();
      return (
        <section {...common} aria-labelledby={`${id}-h`}>
          <div id={`${id}-h`}><SectionHead head={b.head} num={num} /></div>
          {b.head.lede && !phases && <p className="st-lede">{b.head.lede}</p>}
          <figure className="st-figure">
            {phases && (
              <ol className="st-states st-mono" aria-label="State transitions">
                {phases.map((p, k) => (
                  <li key={k}>
                    <span>{p}</span>
                  </li>
                ))}
              </ol>
            )}
            <Gantt items={b.items.map((s) => s.title)} phases={phases} />
            <figcaption>
              <span className="st-figlabel">Figure {ganttFig}:</span> Gantt chart of the review cycle; each
              milestone passes through the same states in order.
            </figcaption>
          </figure>

          {b.items.map((s, k) => {
            const f = counter.nextFig();
            return (
              <div className="st-step" key={k}>
                <div className="st-step-text">
                  <h3 className="st-h3">
                    <span className="st-mono">{roman(num)}.{alpha(k).toUpperCase()}</span> {s.title}
                  </h3>
                  <p>{s.body}</p>
                  {s.ticks && s.ticks.length > 0 && (
                    <ol className="st-enum">
                      {s.ticks.map((t, j) => (
                        <li key={j}>
                          <span className="st-enum-n">({LOWER_ROMAN[j] ?? j + 1})</span> {t}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
                <figure className="st-figure st-step-fig" data-tall={s.tall ? 'true' : undefined}>
                  <Plate items={b.items.map((x) => x.image)} index={k} className="st-plate st-crop">
                    <img src={s.image.light} alt={s.image.alt} loading="lazy" />
                  </Plate>
                  <figcaption>
                    <span className="st-figlabel">Figure {f}:</span> {s.image.caption ?? s.image.alt}.
                  </figcaption>
                </figure>
              </div>
            );
          })}
        </section>
      );
    }

    case 'compare': {
      const f = counter.nextFig();
      return (
        <section {...common} aria-labelledby={`${id}-h`}>
          <div id={`${id}-h`}><SectionHead head={b.head} num={num} /></div>
          {b.head.lede && <p className="st-lede">{b.head.lede}</p>}
          <div className="st-withspot st-withspot-cmp">
          <Sprite s={sprites} k={4} className="st-spot st-spot-cmp" />
          <figure className="st-figure">
            <CompareFigure image={b.image} />
            <figcaption>
              <span className="st-figlabel">Figure {f}:</span> {b.image.caption ?? b.image.alt}, rendered from one
              token set: (a) light theme, (b) dark theme. Drag the rule, or use the arrow keys, to compare.
            </figcaption>
          </figure>
          </div>
        </section>
      );
    }

    case 'phones': {
      const f = counter.nextFig();
      return (
        <section {...common} aria-labelledby={`${id}-h`}>
          <div id={`${id}-h`}><SectionHead head={b.head} num={num} /></div>
          {b.head.lede && <p className="st-lede">{b.head.lede}</p>}
          <figure className="st-figure">
            <div className="st-phone-grid">
              {b.items.map((img, k) => (
                <div className="st-sub" key={k}>
                  <Plate items={b.items} index={k} className="st-plate st-phone">
                    <img src={img.light} alt={img.alt} loading="lazy" />
                  </Plate>
                  <span className="st-subcap">({alpha(k)}) {img.caption ?? img.alt}</span>
                </div>
              ))}
            </div>
            <figcaption>
              <span className="st-figlabel">Figure {f}:</span> Narrow-viewport renderings:{' '}
              {b.items.map((m, k) => `(${alpha(k)}) ${m.caption ?? m.alt}`).join('; ')}.
            </figcaption>
          </figure>
        </section>
      );
    }

    case 'columns':
      return (
        <section {...common} aria-labelledby={`${id}-h`}>
          <div id={`${id}-h`}><SectionHead head={b.head} num={num} /></div>
          {b.head.lede && <p className="st-lede">{b.head.lede}</p>}
          <div className="st-twocol">
            {b.columns.map((c, k) => (
              <div key={k} className="st-colblock">
                <h3 className="st-h3">
                  <span className="st-mono">{alpha(k).toUpperCase()}.</span> {c.title}
                </h3>
                {c.style === 'chips' ? (
                  <ul className="st-terms st-mono">
                    {c.items.map((t, j) => <li key={j}>{t}</li>)}
                  </ul>
                ) : (
                  <ol className="st-claims">
                    {c.items.map((t, j) => (
                      <li key={j}>
                        <span className="st-claim-n st-mono">P{j + 1}</span>
                        <span>{t}</span>
                        <span className="st-qed" aria-label="verified">∎</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            ))}
          </div>
        </section>
      );

    case 'gallery': {
      const f = counter.nextFig();
      return (
        <section {...common} aria-labelledby={`${id}-h`}>
          <div id={`${id}-h`}><SectionHead head={b.head} num={num} /></div>
          {b.head.lede && <p className="st-lede">{b.head.lede}</p>}
          <figure className="st-figure">
            <ol className="st-plates">
              {b.items.map((img, k) => (
                <li key={k}>
                  <Plate items={b.items} index={k} className="st-plate st-thumb">
                    <img src={img.light} alt={img.alt} loading="lazy" />
                  </Plate>
                  <span className="st-subcap">
                    <span className="st-mono">{f}.{k + 1}</span> {img.caption ?? img.alt}
                  </span>
                </li>
              ))}
            </ol>
            <figcaption>
              <span className="st-figlabel">Figure {f}:</span> Supplementary plates, {b.items.length} screens. Select a
              plate to enlarge.
            </figcaption>
          </figure>
        </section>
      );
    }

    case 'markdown':
      return (
        <section {...common} aria-labelledby={`${id}-h`}>
          <div id={`${id}-h`}><SectionHead head={b.head} num={num} /></div>
          {b.head.lede && <p className="st-lede">{b.head.lede}</p>}
          <Manuscript file={b.file} />
        </section>
      );

    case 'outro':
      return (
        <section {...common} className="st-section st-outro" aria-labelledby={`${id}-h`}>
          <h2 id={`${id}-h`} className="st-h2 st-h2-plain">Conclusion &amp; Availability</h2>
          <p className="st-outro-title">
            {b.title}
            {b.accentWord && (
              <>
                {' '}
                <em>{b.accentWord}</em>
              </>
            )}
          </p>
          <div className="st-outro-row">
            <nav className="st-actions" aria-label="Closing actions">
              {b.actions.map((a, k) => <Link key={k} a={a} className="st-btn" />)}
              {!b.actions.some((a) => a.href === '/#work') && (
                <a href="/#work" className="st-btn" data-kind="ghost">Back to portfolio</a>
              )}
            </nav>
            <span className="st-stamp st-stamp-md" aria-hidden="true" style={{ ['--r' as string]: '-9deg' }}>
              Accepted
            </span>
            <Sprite s={sprites} k={5} className="st-spot st-spot-outro" />
          </div>
        </section>
      );

    // ------------------------------------------ blocks this page has no bespoke design for
    case 'cards':
    case 'table':
    case 'tabs':
    case 'duo':
    case 'marquee':
    default:
      return <Fallback block={b} i={i} num={num} counter={counter} common={common} doc={doc} />;
  }
}

function Fallback({
  block: b,
  num,
  counter,
  common,
}: {
  block: Block;
  i: number;
  num: number;
  counter: Counter;
  common: Record<string, string>;
  doc: ShowcaseDoc;
}) {
  const head = blockHead(b);
  const headEl = head ? <SectionHead head={head} num={num} /> : null;
  const lede = head?.lede ? <p className="st-lede">{head.lede}</p> : null;

  if (b.type === 'marquee') {
    return (
      <section {...common} aria-label="Keywords">
        <p className="st-keywords st-keywords-block">
          <strong className="st-runin">Keywords—</strong>
          {b.items.join('; ')}.
        </p>
      </section>
    );
  }

  if (b.type === 'table' || b.type === 'cards') {
    const t = counter.nextTab();
    const columns = b.type === 'table' ? b.columns : ['Item', 'Detail', 'Value'];
    const rows =
      b.type === 'table'
        ? b.rows
        : b.items.map((c) => [c.title, [c.subtitle, c.meta].filter(Boolean).join(' · '), [c.value, c.valueLabel].filter(Boolean).join(' ')]);
    return (
      <section {...common}>
        {headEl}
        {lede}
        <div className="st-tablewrap">
          <table className="st-booktabs st-wide">
            <caption>
              <span className="st-figlabel">Table {t}:</span> {head?.label ?? 'Data'}.
            </caption>
            <thead>
              <tr>{columns.map((c, k) => <th key={k} scope="col">{c}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, k) => (
                <tr key={k}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  if (b.type === 'tabs') {
    return (
      <section {...common}>
        {headEl}
        {lede}
        <div className="st-twocol">
          {b.tabs.map((tab, k) => (
            <div key={tab.id} className="st-colblock">
              <h3 className="st-h3">
                <span className="st-mono">{alpha(k).toUpperCase()}.</span> {tab.label}
              </h3>
              {tab.subtitle && <p className="st-lede">{tab.subtitle}</p>}
              <ol className="st-enum">
                {tab.steps.map((s, j) => (
                  <li key={j}>
                    <span className="st-enum-n">({LOWER_ROMAN[j] ?? j + 1})</span> <strong>{s.title}.</strong> {s.description}
                  </li>
                ))}
              </ol>
              {tab.details && tab.details.length > 0 && (
                <p className="st-note">
                  {tab.detailsTitle ? <strong>{tab.detailsTitle}: </strong> : null}
                  {tab.details.join('; ')}.
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (b.type === 'duo') {
    return (
      <section {...common}>
        {headEl}
        {lede}
        <div className="st-twocol">
          {b.sides.map((s, k) => {
            const f = counter.nextFig();
            return (
              <div key={k} className="st-colblock">
                <h3 className="st-h3">
                  <span className="st-mono">{alpha(k).toUpperCase()}.</span> {s.title}
                </h3>
                <p>{s.body}</p>
                <figure className="st-figure">
                  <Plate items={[s.image]} index={0} className={s.device === 'phone' ? 'st-plate st-phone' : 'st-plate st-crop'}>
                    <img src={s.image.light} alt={s.image.alt} loading="lazy" />
                  </Plate>
                  <figcaption>
                    <span className="st-figlabel">Figure {f}:</span> {s.image.caption ?? s.image.alt}.
                  </figcaption>
                </figure>
                {s.points.length > 0 && (
                  <ol className="st-enum">
                    {s.points.map((p, j) => (
                      <li key={j}><span className="st-enum-n">({LOWER_ROMAN[j] ?? j + 1})</span> {p}</li>
                    ))}
                  </ol>
                )}
              </div>
            );
          })}
        </div>
        {b.shared && (
          <p className="st-keywords st-keywords-block">
            <strong className="st-runin">{b.shared.title}—</strong>
            {b.shared.items.join('; ')}.
          </p>
        )}
      </section>
    );
  }

  // Unknown block type: keep at least its heading on the page.
  return <section {...common}>{headEl}{lede}</section>;
}

// ------------------------------------------------------------------ gantt

function Gantt({ items, phases, compact }: { items: string[]; phases: string[] | null; compact?: boolean }) {
  const P = phases?.length ?? items.length;
  const N = items.length;
  return (
    <div
      className={compact ? 'st-gantt st-gantt-compact' : 'st-gantt'}
      style={{ ['--cols' as string]: P }}
      role="img"
      aria-label={`Timeline: ${items.join(', then ')}`}
    >
      {!compact && (
        <div className="st-gantt-row st-gantt-headrow" aria-hidden="true">
          <span className="st-gantt-label" />
          <span className="st-gantt-track">
            {Array.from({ length: P }, (_, k) => (
              <span key={k} className="st-gantt-col st-mono">
                {phases ? phases[k].replace(/_/g, ' ') : `T${k + 1}`}
              </span>
            ))}
          </span>
        </div>
      )}
      {items.map((t, k) => {
        const start = (k * P) / N;
        const end = Math.min(P, ((k + 1) * P) / N + (k < N - 1 ? 0.35 : 0));
        return (
          <div className="st-gantt-row" key={k} aria-hidden="true">
            <span className="st-gantt-label">
              <span className="st-mono">{String(k + 1).padStart(2, '0')}</span> {t}
            </span>
            <span className="st-gantt-track">
              <span
                className="st-gantt-bar"
                data-last={k === N - 1 ? 'true' : undefined}
                style={{ left: `${(start / P) * 100}%`, width: `${((end - start) / P) * 100}%` }}
              />
            </span>
          </div>
        );
      })}
    </div>
  );
}
