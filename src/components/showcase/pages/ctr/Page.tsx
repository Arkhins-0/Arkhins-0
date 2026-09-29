/* eslint-disable @next/next/no-img-element */
import { Anton, Archivo, Newsreader } from 'next/font/google';
import type { ShowcasePageProps } from '../types';
import { PressLightbox, Zoom } from './Lightbox';
import { Spread } from './Spreads';
import { ActionLink, Barcode, Star, Tear, blockLabel, blockTitle, hash, pagesFor } from './print';
import { castSpots } from '../cast';
import type { Block } from '@/types/content';
import './ctr.css';

const display = Anton({ subsets: ['latin'], weight: '400', variable: '--ctr-display', display: 'swap' });
const serif = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--ctr-serif',
  display: 'swap',
});
const grot = Archivo({ subsets: ['latin'], weight: ['500', '700', '800'], variable: '--ctr-grot', display: 'swap' });

/** Decorative masthead of the imaginary racing weekly this page is printed in. */
const MAG = 'TURBO';

/**
 * Sprite spots in page order. The first four are the strongest (cover star, spec sheet, numbers, pull
 * quote); the rest fill in as more poses are added. Spreads get their spot by type (first of each).
 */
const SPOT = { cover: 0, sidebar: 1, stats: 2, overview: 3, duo: 4, tabs: 5, phones: 6, columns: 7, gallery: 8, outro: 9 } as const;
const SPOTS = 10;

/**
 * Chennai Turbo Riders as a glossy racing magazine: a cut-out cover, a contents page with a spec sheet,
 * one editorial spread per section, and a back-cover advert for the outro. Everything is set from props.
 */
export default function Page({ project, doc, guest }: ShowcasePageProps) {
  const { hero, theme, sections } = doc;
  const issue = `Issue ${project.year ?? ''}`.trim();
  const yearShort = project.year ? `’${project.year.slice(-2)}` : '№1';
  const photo = theme.backdrop ?? project.cover ?? undefined;

  // Page numbers for the contents: the cover is p.1, contents p.2–3, features follow.
  let cursor = 4;
  const pages = sections.map((b) => {
    const p = cursor;
    cursor += pagesFor(b);
    return p;
  });

  const stage = hero.stage;
  const stageItems = stage ? [stage.center, stage.left, stage.right].filter((x): x is NonNullable<typeof x> => !!x) : [];
  const titleWords = hero.title.split(/\s+/).filter(Boolean);

  const rootStyle = {
    ['--ctr-y' as string]: theme.accent?.hex ?? '#f7d619',
  } as React.CSSProperties;

  const cast = castSpots(guest, SPOTS);
  const seen = new Set<string>();
  const starFor = (b: Block): string | undefined => {
    if (seen.has(b.type) || !(b.type in SPOT)) return undefined;
    seen.add(b.type);
    return cast.at(SPOT[b.type as keyof typeof SPOT]);
  };
  const stars = sections.map(starFor);
  const firstOutro = sections.findIndex((b) => b.type === 'outro');
  const hasOutro = firstOutro >= 0;

  const contents = sections
    .map((b, i) => ({ b, i, title: blockTitle(b), label: blockLabel(b), page: pages[i] }))
    .filter((e) => e.title);

  return (
    <div className={`pg-ctr ${display.variable} ${serif.variable} ${grot.variable}`} style={rootStyle}>
      <PressLightbox>
        {/* ------------------------------------------------------------ masthead strip */}
        <nav className="ctr-strip" aria-label="Project">
          <a href="/#work" className="ctr-strip__back">
            <span aria-hidden="true">←</span> Back to the paddock
          </a>
          <span className="ctr-strip__mid" aria-hidden="true">
            {MAG} · the racing weekly · {issue}
          </span>
          <span className="ctr-strip__price" aria-hidden="true">
            {project.category}
          </span>
        </nav>

        {/* -------------------------------------------------------------------- cover */}
        <header className="ctr-cover" data-tour="hero">
          <div className="ctr-cover__photo" aria-hidden="true">
            {photo && <img src={photo} alt="" />}
            <span className="ctr-cover__wash" />
            <span className="ctr-cover__dots" />
          </div>

          <div className="ctr-cover__inner">
            <div className="ctr-cover__mast">
              <p className="ctr-mast" aria-hidden="true">
                {MAG}
              </p>
              <div className="ctr-cover__issue">
                <span>{issue}</span>
                {project.date && <span>{project.date}</span>}
                <span className="ctr-cover__status">{project.status}</span>
              </div>
            </div>

            <div className="ctr-cover__grid">
              <div className="ctr-cover__copy">
                {hero.eyebrow && <p className="ctr-banner">{hero.eyebrow}</p>}
                <h1 className="ctr-cutout">
                  <span className="ctr-sr">
                    {hero.title} {hero.accent}
                  </span>
                  <span aria-hidden="true" className="ctr-cutout__words">
                    {titleWords.map((w, i) => (
                      <span key={i} className={`ctr-cutout__w ctr-cutout__w--${hash(w + i) % 3}`}>
                        {w}
                      </span>
                    ))}
                    {hero.accent && <span className="ctr-cutout__w ctr-cutout__accent">{hero.accent}</span>}
                  </span>
                </h1>
                <div className="ctr-coverstory">
                  <p className="ctr-coverstory__tag">Cover story · p.{pages.find((_, i) => sections[i].type === 'overview') ?? 4}</p>
                  <p className="ctr-coverstory__lede">{hero.lede}</p>
                </div>
                {hero.actions && hero.actions.length > 0 && (
                  <div className="ctr-actions">
                    {hero.actions.map((a, i) => (
                      <ActionLink key={i} action={a} />
                    ))}
                  </div>
                )}
              </div>

              <div className="ctr-cover__side">
                <span className="ctr-roundel ctr-roundel--xl" aria-hidden="true">
                  {yearShort}
                </span>
                <div className="ctr-cover__lineup">
                  {hero.badges && hero.badges.length > 0 && (
                    <ul className="ctr-coverlines" aria-label="Cover lines">
                      {hero.badges.map((b, i) => (
                        <li key={i} className={b.tone === 'accent' ? 'is-accent' : undefined}>
                          <span aria-hidden="true">+</span> {b.label}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Star src={cast.at(SPOT.cover)} guest={guest} size="lg" className="ctr-star--cover" />
                </div>
                {stageItems.length > 0 && (
                  <div className="ctr-tipin">
                    <figure className="ctr-tipin__main">
                      <span className="ctr-tape" aria-hidden="true" />
                      <Zoom items={stageItems} index={0} className="ctr-tipin__zoom">
                        <img src={stageItems[0].light} alt={stageItems[0].alt} />
                      </Zoom>
                      {stage?.url && <figcaption>{stage.url}</figcaption>}
                    </figure>
                    {stageItems.slice(1).map((img, i) => (
                      <figure key={i} className={`ctr-tipin__clip ctr-tipin__clip--${i}`}>
                        <Zoom items={stageItems} index={i + 1} className="ctr-tipin__zoom">
                          <img src={img.light} alt={img.alt} loading="lazy" />
                        </Zoom>
                      </figure>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="ctr-cover__foot">
              <Barcode text={project.slug + issue} className="ctr-cover__code" />
              <p className="ctr-cover__tagline">{project.tagline ?? project.summary}</p>
            </div>
          </div>
          <Tear seed={hash(project.slug)} />
        </header>

        {/* ------------------------------------------------------------------ contents */}
        <section className="ctr-contents" aria-labelledby="ctr-contents-title">
          <div className="ctr-wrap ctr-contents__grid">
            <div>
              <h2 id="ctr-contents-title" className="ctr-contents__title">
                Contents
              </h2>
              <ol className="ctr-toc">
                {contents.map((e) => (
                  <li key={e.i}>
                    <a href={`#ctr-s-${e.i}`} className="ctr-toc__link">
                      <span className="ctr-toc__pg">{e.page}</span>
                      <span className="ctr-toc__text">
                        <span className="ctr-toc__label">{e.label}</span>
                        <span className="ctr-toc__title">{e.title}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
            <div className="ctr-sidebar-col">
            <Star src={cast.at(SPOT.sidebar)} guest={guest} size="md" className="ctr-star--sidebar" />
            <aside className="ctr-sidebar" aria-label="Spec sheet">
              <p className="ctr-sidebar__head">Spec sheet</p>
              <h3 className="ctr-sidebar__name">{project.title}</h3>
              <dl className="ctr-sidebar__dl">
                {(hero.facts ?? []).map((f, i) => (
                  <div key={i}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
                {project.role && (
                  <div>
                    <dt>Credits</dt>
                    <dd>{project.role}</dd>
                  </div>
                )}
              </dl>
              {project.tags.length > 0 && (
                <ul className="ctr-sidebar__tags" aria-label="Tags">
                  {project.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
              <div className="ctr-editor">
                <p className="ctr-editor__head">From the editor</p>
                <p className="ctr-editor__body">{project.summary}</p>
              </div>
            </aside>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------- spreads */}
        <div className="ctr-issue">
          {sections.map((b, i) => (
            <section
              key={i}
              id={`ctr-s-${i}`}
              data-tour={`section-${i}`}
              className={`ctr-spread ctr-spread--${b.type} ctr-spread--${i % 2 ? 'odd' : 'even'}`}
              aria-label={blockTitle(b) ?? blockLabel(b)}
            >
              <Spread
                block={b}
                ctx={{
                  page: pages[i],
                  issue,
                  mag: MAG,
                  guest,
                  star: stars[i],
                  rest: i === firstOutro ? cast.rest : undefined,
                }}
              />
            </section>
          ))}
          {!hasOutro && (
            <section className="ctr-spread ctr-spread--outro">
              <Spread
                block={{ type: 'outro', title: project.title, actions: hero.actions ?? [] }}
                ctx={{ page: cursor, issue, mag: MAG, guest, star: cast.at(SPOT.outro), rest: cast.rest }}
              />
            </section>
          )}
        </div>
      </PressLightbox>
    </div>
  );
}
