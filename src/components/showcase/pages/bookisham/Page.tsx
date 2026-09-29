/* eslint-disable @next/next/no-img-element */
import { Cormorant_Garamond, EB_Garamond } from 'next/font/google';
import type { ShowcasePageProps } from '../types';
import { CastSprite, castSpots } from '../cast';
import { Btn, CAST_TYPES, CastRow, Chapter, Figures, Spread, pagesFor, roman, shortTitle, type Ctx } from './chapters';
import { NightToggle, Plate, PlateRoom } from './client';
import './book.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--bk-font-display',
  display: 'swap',
});

const body = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--bk-font-body',
  display: 'swap',
});

/**
 * Bookisham, bound as a hardcover: a cloth cover and jacket flap, a frontispiece, a contents page with a
 * silk ribbon, then one chapter per section as facing pages with running heads and folios, ending on a colophon.
 */
export default function Page({ project, doc, guest }: ShowcasePageProps) {
  const { hero, sections, theme } = doc;
  const { name, sub } = shortTitle(project);
  const book = name;

  // Stats that open the document sit opposite the contents page, as the book's front matter.
  const statsUpFront = sections[0]?.type === 'stats';

  // The guide's spots, in page order: beside the cover, under the contents, then one per chapter that has
  // room for her (up to six). Whatever poses remain stand together on the colophon.
  const castChapters = sections
    .map((b, i) => ({ b, i }))
    .filter(({ b, i }) => CAST_TYPES.includes(b.type) && !(i === 0 && statsUpFront))
    .slice(0, 6)
    .map(({ i }) => i);
  const cast = castSpots(guest, 2 + castChapters.length);

  let folio = 1;
  let chapterNo = 0;
  const plan = sections.map((block, i) => {
    const pages = i === 0 && statsUpFront ? 0 : pagesFor(block);
    const hasHead = 'head' in block && !!block.head;
    const ctx: Ctx = {
      i,
      chapter: hasHead ? roman(++chapterNo) : undefined,
      start: folio,
      book,
      project,
      guest,
      sprite: castChapters.includes(i) ? cast.at(2 + castChapters.indexOf(i)) : undefined,
      rest: block.type === 'outro' ? cast.rest : undefined,
    };
    folio += pages;
    return { block, ctx, pages };
  });

  const toc = plan.filter(({ block, pages }) => pages > 0 && ('head' in block ? !!block.head : block.type === 'outro'));
  const stage = hero.stage;
  const rootStyle = {
    '--bk-gold-in': theme.accent2?.hex,
    '--bk-backdrop': theme.backdrop ? `url("${theme.backdrop}")` : undefined,
  } as React.CSSProperties;

  return (
    <div
      id="bk-root"
      className={`pg-bookisham ${display.variable} ${body.variable}`}
      data-night="off"
      style={rootStyle}
    >
      {theme.backdrop && <div className="bk-desk-photo" aria-hidden="true" />}
      <PlateRoom>
        <nav className="bk-top" aria-label="Book">
          <a href="/#work" className="bk-top-back">
            <span aria-hidden="true">←</span> Back to the shelf
          </a>
          <span className="bk-top-title" aria-hidden="true">
            {name}
            {sub && <em> · {sub}</em>}
          </span>
          <span className="bk-top-right">
            <a href="#bk-contents" className="bk-top-link">
              Contents
            </a>
            <NightToggle />
          </span>
        </nav>

        <main className="bk-desk">
          {/* ---------------------------------------------------- cover and jacket flap */}
          <header data-tour="hero" className="bk-hero">
            <div className="bk-hero-row">
              <div className="bk-cover-wrap">
                <div className="bk-cover">
                  <div className="bk-spine" aria-hidden="true">
                    <span className="bk-foil">{name}</span>
                  </div>
                  <div className="bk-board">
                    <div className="bk-frame">
                      <span className="bk-corner bk-c1" aria-hidden="true">❧</span>
                      <span className="bk-corner bk-c2" aria-hidden="true">❧</span>
                      <span className="bk-corner bk-c3" aria-hidden="true">❧</span>
                      <span className="bk-corner bk-c4" aria-hidden="true">❧</span>
                      {hero.eyebrow && <p className="bk-foil bk-cover-eyebrow">{hero.eyebrow}</p>}
                      <div className="bk-label">
                        <h1>
                          <span className="bk-name">{name}</span>
                          {sub && <span className="bk-sub">{sub}</span>}
                        </h1>
                      </div>
                      <p className="bk-foil bk-cover-orn" aria-hidden="true">
                        ❦
                      </p>
                      {hero.badges && hero.badges.length > 0 && (
                        <ul className="bk-stamps" aria-label="In this edition">
                          {hero.badges.map((b, k) => (
                            <li key={k} className={b.tone === 'accent' ? 'bk-foil bk-stamp-hi' : 'bk-foil'}>
                              {b.label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <span className="bk-cover-ribbon" aria-hidden="true" />
                </div>
                <CastSprite src={cast.at(0)} guest={guest} className="bk-cast bk-cast-desk" />
              </div>

              <div className="bk-flap">
                <p className="bk-eyebrow">From the jacket flap</p>
                <h2 className="bk-flap-title">
                  {hero.title} {hero.accent && <em>{hero.accent}</em>}
                </h2>
                <p className="bk-p bk-dropcap">{hero.lede}</p>
                {hero.actions && hero.actions.length > 0 && (
                  <div className="bk-actions">
                    {hero.actions.map((a, k) => (
                      <Btn key={k} a={a} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ---------------------------------------------------- frontispiece + title page */}
            {(stage || (hero.facts && hero.facts.length > 0)) && (
              <Spread
                label="Frontispiece"
                className="bk-front"
                heads={[book, 'Particulars']}
                folios={['ii', 'iii']}
                verso={
                  stage ? (
                    <>
                      <p className="bk-chapno">Frontispiece</p>
                      <Plate
                        image={stage.center}
                        label="Frontis."
                        frame="browser"
                        url={stage.url}
                        eager
                        group={[stage.center, stage.left, stage.right].filter((x): x is NonNullable<typeof x> => !!x)}
                        labels={['Frontis.', 'Fig. a', 'Fig. b'].slice(0, 1 + (stage.left ? 1 : 0) + (stage.right ? 1 : 0))}
                        index={0}
                      />
                    </>
                  ) : (
                    <p className="bk-blank">This page intentionally left blank.</p>
                  )
                }
                recto={
                  <>
                    <p className="bk-chapno">Particulars of this edition</p>
                    {hero.facts && (
                      <dl className="bk-particulars">
                        {hero.facts.map((f, k) => (
                          <div key={k}>
                            <dt>{f.label}</dt>
                            <span className="bk-leader" aria-hidden="true" />
                            <dd>{f.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {stage && (stage.left || stage.right) && (
                      <div className="bk-plates bk-plates-small">
                        {[stage.left, stage.right]
                          .filter((x): x is NonNullable<typeof x> => !!x)
                          .map((img, k, arr) => {
                            const group = [stage.center, ...arr];
                            const labels = ['Frontis.', 'Fig. a', 'Fig. b'].slice(0, group.length);
                            return (
                              <Plate
                                key={k}
                                image={img}
                                label={labels[k + 1]}
                                group={group}
                                labels={labels}
                                index={k + 1}
                              />
                            );
                          })}
                      </div>
                    )}
                  </>
                }
              />
            )}
          </header>

          {/* ---------------------------------------------------- contents, with a silk ribbon */}
          <Spread
            id="bk-contents"
            label="Contents"
            className="bk-contents"
            heads={[book, statsUpFront ? 'In figures' : 'Epigraph']}
            folios={['iv', 'v']}
            rectoTour={statsUpFront ? 'section-0' : undefined}
            rectoId={statsUpFront ? 'bk-ch-0' : undefined}
            verso={
              <>
                <span className="bk-ribbon-mark" aria-hidden="true" />
                <h2 className="bk-h2 bk-toc-title">Contents</h2>
                <ol className="bk-toc">
                  {toc.map(({ block, ctx }) => {
                    const label =
                      'head' in block && block.head
                        ? block.head.label
                        : block.type === 'outro'
                          ? 'Colophon'
                          : '';
                    const title =
                      'head' in block && block.head
                        ? `${block.head.title} ${block.head.accentWord ?? ''}`.trim()
                        : block.type === 'outro'
                          ? `${block.title} ${block.accentWord ?? ''}`.trim()
                          : '';
                    return (
                      <li key={ctx.i}>
                        <a href={`#bk-ch-${ctx.i}`}>
                          <span className="bk-toc-no">{ctx.chapter ?? '·'}</span>
                          <span className="bk-toc-text">
                            <span className="bk-toc-label">{label}</span>
                            <em className="bk-toc-sub">{title}</em>
                          </span>
                          <span className="bk-leader" aria-hidden="true" />
                          <span className="bk-toc-page">
                            <span className="bk-sr">page </span>
                            {ctx.start}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ol>
                {cast.at(1) && (
                  <div className="bk-cast-foot">
                    <CastSprite src={cast.at(1)} guest={guest} className="bk-cast bk-cast-bust" />
                  </div>
                )}
              </>
            }
            recto={
              statsUpFront && sections[0].type === 'stats' ? (
                <>
                  <p className="bk-chapno">The book in figures</p>
                  <Figures items={sections[0].items} />
                  <p className="bk-orn" aria-hidden="true">❦</p>
                </>
              ) : (
                <div className="bk-epigraph-page">
                  <p className="bk-epigraph bk-epigraph-big">{project.tagline ?? project.summary}</p>
                  <p className="bk-orn" aria-hidden="true">❦</p>
                </div>
              )
            }
          />

          {/* ---------------------------------------------------- the chapters */}
          {plan.map(({ block, ctx, pages }) =>
            pages === 0 && block.type === 'stats' ? null : <Chapter key={ctx.i} b={block} c={ctx} />
          )}

          {!sections.some((s) => s.type === 'outro') && <CastRow c={{ rest: cast.rest, guest }} />}
          {!sections.some((s) => s.type === 'outro') && (
            <p className="bk-endlink">
              <a href="/#work" className="bk-btn bk-btn-solid">
                Close the book
              </a>
            </p>
          )}
        </main>
      </PlateRoom>
    </div>
  );
}
