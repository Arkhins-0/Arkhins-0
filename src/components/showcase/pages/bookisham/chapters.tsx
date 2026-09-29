/* eslint-disable @next/next/no-img-element */
import type { Action, Block, Head, ThemedImage } from '@/types/content';
import type { ProjectRow } from '@/types/content';
import { Icon } from '../../ui';
import { CastSprite } from '../cast';
import type { PageGuest } from '../types';
import { Manuscript, Plate, RibbonTabs } from './client';

type Of<T extends Block['type']> = Extract<Block, { type: T }>;

// ------------------------------------------------------------ helpers

export function roman(n: number): string {
  const map: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let out = '';
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out;
}

const half = <T,>(xs: T[], leftBias = true): [T[], T[]] => {
  const cut = leftBias ? Math.ceil(xs.length / 2) : Math.floor(xs.length / 2);
  return [xs.slice(0, cut), xs.slice(cut)];
};

export function shortTitle(project: ProjectRow) {
  const [name, ...rest] = project.title.split(':');
  return { name: name.trim(), sub: rest.join(':').trim() };
}

// ------------------------------------------------------------ page furniture

/** Two facing pages with a gutter between them; on phones they become two pages one above the other. */
export function Spread({
  id,
  tour,
  heads,
  folios,
  verso,
  recto,
  rectoTour,
  rectoId,
  className,
  label,
}: {
  id?: string;
  tour?: string;
  heads: [string, string];
  folios: [string | number, string | number];
  verso: React.ReactNode;
  recto: React.ReactNode;
  rectoTour?: string;
  rectoId?: string;
  className?: string;
  label?: string;
}) {
  return (
    <section
      id={id}
      data-tour={tour}
      aria-label={label}
      className={`bk-spread${className ? ` ${className}` : ''}`}
    >
      <div className="bk-page bk-verso">
        <RunHead side="verso" text={heads[0]} folio={folios[0]} />
        <div className="bk-body">{verso}</div>
      </div>
      <div className="bk-page bk-recto" data-tour={rectoTour} id={rectoId}>
        <RunHead side="recto" text={heads[1]} folio={folios[1]} />
        <div className="bk-body">{recto}</div>
      </div>
    </section>
  );
}

/** A single wide sheet, for matter that should not be cut at the gutter (tables, manuscripts, comparisons). */
export function Sheet({
  id,
  tour,
  heads,
  folios,
  children,
  label,
}: {
  id?: string;
  tour?: string;
  heads: [string, string];
  folios: [string | number, string | number];
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <section id={id} data-tour={tour} aria-label={label} className="bk-sheet">
      <div className="bk-sheet-run">
        <RunHead side="verso" text={heads[0]} folio={folios[0]} />
        <RunHead side="recto" text={heads[1]} folio={folios[1]} />
      </div>
      <div className="bk-body">{children}</div>
    </section>
  );
}

function RunHead({ side, text, folio }: { side: 'verso' | 'recto'; text: string; folio: string | number }) {
  return (
    <div className={`bk-run bk-run-${side}`} aria-hidden="true">
      <span className="bk-folio">{folio}</span>
      <span className="bk-run-text">{text}</span>
    </div>
  );
}

export function Opener({ chapter, head }: { chapter?: string; head: Head }) {
  return (
    <div className="bk-opener">
      <span className="bk-marg" aria-hidden="true">¶ {head.index}</span>
      <p className="bk-chapno">
        {chapter ? <>Chapter {chapter}</> : head.label}
        {chapter && <span className="bk-chaplabel"> · {head.label}</span>}
      </p>
      <h2 className="bk-h2">
        {head.title} {head.accentWord && <em>{head.accentWord}</em>}
      </h2>
      <p className="bk-orn" aria-hidden="true">❦</p>
    </div>
  );
}

function Notes({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="bk-notes" aria-label="Margin notes">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}

export function Btn({ a }: { a: Action }) {
  const ext = a.external || /^https?:/.test(a.href);
  return (
    <a
      href={a.href}
      className={`bk-btn ${a.kind === 'ghost' ? 'bk-btn-ghost' : 'bk-btn-solid'}`}
      {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {a.label}
      {ext && (
        <>
          <span aria-hidden="true"> ↗</span>
          <span className="bk-sr"> (opens in a new tab)</span>
        </>
      )}
    </a>
  );
}

// ------------------------------------------------------------ chapter context

export type Ctx = {
  i: number;
  chapter?: string;
  start: number;
  book: string;
  project: ProjectRow;
  guest?: PageGuest;
  /** This chapter's pose of the guide, if it was given a spot. */
  sprite?: string;
  /** Poses left over after every spot is filled; the colophon shows them. */
  rest?: string[];
};

/** Block types that have a place for the guide to stand. */
export const CAST_TYPES: Block['type'][] = ['overview', 'duo', 'tabs', 'steps', 'phones', 'columns', 'gallery', 'cards'];

/** The guide standing in the outer margin, floated so the text wraps around her. */
function MarginCast({ c, side = 'r' }: { c: Ctx; side?: 'l' | 'r' }) {
  return <CastSprite src={c.sprite} guest={c.guest} className={`bk-cast bk-cast-float bk-cast-float-${side}`} />;
}

const heads = (c: Ctx, label: string): [string, string] => [c.book, c.chapter ? `Chapter ${c.chapter} · ${label}` : label];
const folios = (c: Ctx, k = 0): [number, number] => [c.start + k * 2, c.start + k * 2 + 1];
const secId = (c: Ctx) => `bk-ch-${c.i}`;
const tourId = (c: Ctx) => `section-${c.i}`;
const plateLabel = (c: Ctx, n: number) => `Plate ${c.chapter ?? roman(c.i + 1)}.${n}`;

// ------------------------------------------------------------ blocks

export function Figures({ items }: { items: Of<'stats'>['items'] }) {
  return (
    <dl className="bk-figures">
      {items.map((s, k) => (
        <div key={k} className="bk-figure">
          <dt>{s.value}</dt>
          <dd>{s.label}</dd>
        </div>
      ))}
    </dl>
  );
}

function StatsSpread({ b, c }: { b: Of<'stats'>; c: Ctx }) {
  const [l, r] = half(b.items);
  return (
    <Spread
      id={secId(c)}
      tour={tourId(c)}
      label="The book in figures"
      heads={heads(c, 'In figures')}
      folios={folios(c)}
      verso={
        <>
          <p className="bk-chapno">In figures</p>
          <Figures items={l} />
        </>
      }
      recto={<Figures items={r} />}
    />
  );
}

function Overview({ b, c }: { b: Of<'overview'>; c: Ctx }) {
  const feats = b.features ?? [];
  const [p1, p2] = feats.length ? [b.paragraphs, [] as string[]] : half(b.paragraphs);
  return (
    <Spread
      id={secId(c)}
      tour={tourId(c)}
      label={b.head.label}
      heads={heads(c, b.head.label)}
      folios={folios(c)}
      verso={
        <>
          <Opener chapter={c.chapter} head={b.head} />
          {b.head.lede && <p className="bk-epigraph">{b.head.lede}</p>}
          {p1.map((p, k) => (
            <p key={k} className={k === 0 ? 'bk-p bk-dropcap' : 'bk-p'}>
              {p}
            </p>
          ))}
        </>
      }
      recto={
        feats.length ? (
          <>
            <MarginCast c={c} />
            <p className="bk-chapno">The house rules</p>
            <ol className="bk-articles">
              {feats.map((f, k) => (
                <li key={k}>
                  <span className="bk-art-icon" aria-hidden="true">
                    <Icon name={f.icon} size={16} />
                  </span>
                  <div>
                    <h3 className="bk-h4">
                      <span className="bk-sect">§ {k + 1}</span> {f.title}
                    </h3>
                    <p>{f.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </>
        ) : (
          p2.map((p, k) => (
            <p key={k} className="bk-p">
              {p}
            </p>
          ))
        )
      }
    />
  );
}

function DuoSide({ side, n, c }: { side: Of<'duo'>['sides'][number]; n: number; c: Ctx }) {
  return (
    <article className="bk-side">
      <p className="bk-eyebrow">{side.eyebrow}</p>
      <h3 className="bk-h3">{side.title}</h3>
      <p className="bk-p">{side.body}</p>
      <Plate
        image={side.image}
        label={plateLabel(c, n)}
        frame={side.device}
        url={side.url}
        crop={side.device !== 'phone'}
      />
      <Notes items={side.points} />
    </article>
  );
}

function Duo({ b, c }: { b: Of<'duo'>; c: Ctx }) {
  const [first, ...rest] = b.sides;
  return (
    <Spread
      id={secId(c)}
      tour={tourId(c)}
      label={b.head.label}
      heads={heads(c, b.head.label)}
      folios={folios(c)}
      verso={
        <>
          <MarginCast c={c} />
          <Opener chapter={c.chapter} head={b.head} />
          {first && <DuoSide side={first} n={1} c={c} />}
        </>
      }
      recto={
        <>
          {b.head.lede && <p className="bk-epigraph">{b.head.lede}</p>}
          {rest.map((s, k) => (
            <DuoSide key={k} side={s} n={k + 2} c={c} />
          ))}
          {b.shared && b.shared.items.length > 0 && (
            <div className="bk-foot">
              <p>
                <sup>*</sup> <em>{b.shared.title}:</em>{' '}
                {b.shared.items.map((t, k) => (
                  <span key={k} className="bk-foot-item">
                    <code>{t}</code>
                    {k < b.shared!.items.length - 1 ? ' · ' : '.'}
                  </span>
                ))}
              </p>
            </div>
          )}
        </>
      }
    />
  );
}

function Tabs({ b, c }: { b: Of<'tabs'>; c: Ctx }) {
  return (
    <Spread
      id={secId(c)}
      tour={tourId(c)}
      label={b.head.label}
      heads={heads(c, b.head.label)}
      folios={folios(c)}
      verso={
        <>
          <Opener chapter={c.chapter} head={b.head} />
          {b.head.lede && <p className="bk-p bk-dropcap">{b.head.lede}</p>}
          <MarginCast c={c} />
          <p className="bk-chapno bk-mt">In {b.tabs.length} parts</p>
          <ol className="bk-parts">
            {b.tabs.map((t, k) => (
              <li key={t.id}>
                <span className="bk-parts-no">{roman(k + 1)}.</span>
                <span>
                  <strong>{t.label}</strong>
                  {t.subtitle && <em> — {t.subtitle}</em>}
                </span>
              </li>
            ))}
          </ol>
          <p className="bk-hint">Pull a ribbon on the facing page to open its part.</p>
        </>
      }
      recto={<RibbonTabs tabs={b.tabs} label={b.head.label} />}
    />
  );
}

function StepItem({ item, n, c, group, labels }: { item: Of<'steps'>['items'][number]; n: number; c: Ctx; group: ThemedImage[]; labels: string[] }) {
  return (
    <article className="bk-step">
      <h3 className="bk-h3">
        <span className="bk-sect">§ {n}.</span> {item.title}
      </h3>
      <Plate image={item.image} label={labels[n - 1]} group={group} labels={labels} index={n - 1} />
      <p className="bk-p">{item.body}</p>
      {item.ticks && <Notes items={item.ticks} />}
    </article>
  );
}

function Steps({ b, c }: { b: Of<'steps'>; c: Ctx }) {
  const group = b.items.map((it) => it.image);
  const labels = b.items.map((_, k) => plateLabel(c, k + 1));
  const pairs: Of<'steps'>['items'][] = [];
  for (let k = 0; k < b.items.length; k += 2) pairs.push(b.items.slice(k, k + 2));
  if (!pairs.length) pairs.push([]);
  return (
    <div id={secId(c)} data-tour={tourId(c)} className="bk-chapter">
      {c.sprite && (
        <div className="bk-peek">
          <CastSprite src={c.sprite} guest={c.guest} className="bk-cast bk-cast-peek" />
        </div>
      )}
      {pairs.map((pair, k) => (
        <Spread
          key={k}
          label={k === 0 ? b.head.label : undefined}
          heads={heads(c, b.head.label)}
          folios={folios(c, k)}
          verso={
            <>
              {k === 0 && <Opener chapter={c.chapter} head={b.head} />}
              {k === 0 && b.head.lede && <p className="bk-epigraph">{b.head.lede}</p>}
              {pair[0] && <StepItem item={pair[0]} n={k * 2 + 1} c={c} group={group} labels={labels} />}
            </>
          }
          recto={
            pair[1] ? (
              <StepItem item={pair[1]} n={k * 2 + 2} c={c} group={group} labels={labels} />
            ) : (
              <p className="bk-blank">This page intentionally left blank.</p>
            )
          }
        />
      ))}
    </div>
  );
}

function Pocket({ items, from, c, cast }: { items: ThemedImage[]; from: number; c: Ctx; cast?: boolean }) {
  return (
    <div className="bk-pocket">
      {items.map((img, k) => (
        <Plate key={k} image={img} label={`Fig. ${from + k}`} frame="phone" crop={false} />
      ))}
      {cast && c.sprite && (
        <div className="bk-pocket-cast">
          <CastSprite src={c.sprite} guest={c.guest} className="bk-cast bk-cast-cell" />
        </div>
      )}
    </div>
  );
}

function Phones({ b, c }: { b: Of<'phones'>; c: Ctx }) {
  const [l, r] = half(b.items, false);
  return (
    <Spread
      id={secId(c)}
      tour={tourId(c)}
      label={b.head.label}
      heads={heads(c, b.head.label)}
      folios={folios(c)}
      verso={
        <>
          <Opener chapter={c.chapter} head={b.head} />
          {b.head.lede && <p className="bk-p bk-dropcap">{b.head.lede}</p>}
          <Pocket items={l} from={1} c={c} />
        </>
      }
      recto={<Pocket items={r} from={l.length + 1} c={c} cast />}
    />
  );
}

function Column({ col }: { col: Of<'columns'>['columns'][number] }) {
  return (
    <div className="bk-col">
      <h3 className="bk-h4 bk-col-title">{col.title}</h3>
      {col.style === 'chips' ? (
        <p className="bk-index">
          {col.items.map((t, k) => (
            <span key={k}>
              <span className="bk-index-item">{t}</span>
              {k < col.items.length - 1 && <span aria-hidden="true"> · </span>}
            </span>
          ))}
        </p>
      ) : (
        <ul className="bk-hedera">
          {col.items.map((t, k) => (
            <li key={k}>{t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Columns({ b, c }: { b: Of<'columns'>; c: Ctx }) {
  const [l, r] = half(b.columns);
  return (
    <Spread
      id={secId(c)}
      tour={tourId(c)}
      label={b.head.label}
      heads={heads(c, b.head.label)}
      folios={folios(c)}
      verso={
        <>
          <Opener chapter={c.chapter} head={b.head} />
          {b.head.lede && <p className="bk-epigraph">{b.head.lede}</p>}
          {l.map((col, k) => (
            <Column key={k} col={col} />
          ))}
        </>
      }
      recto={
        <>
          <MarginCast c={c} />
          {r.map((col, k) => (
            <Column key={k} col={col} />
          ))}
        </>
      }
    />
  );
}

function Gallery({ b, c }: { b: Of<'gallery'>; c: Ctx }) {
  const labels = b.items.map((_, k) => plateLabel(c, k + 1));
  const [l, r] = half(b.items, false);
  const grid = (xs: ThemedImage[], off: number) => (
    <div className="bk-plates">
      {xs.map((img, k) => (
        <Plate key={k} image={img} label={labels[off + k]} group={b.items} labels={labels} index={off + k} />
      ))}
    </div>
  );
  return (
    <Spread
      id={secId(c)}
      tour={tourId(c)}
      label={b.head.label}
      heads={heads(c, 'List of plates')}
      folios={folios(c)}
      verso={
        <>
          <Opener chapter={c.chapter} head={b.head} />
          {b.head.lede && <p className="bk-epigraph">{b.head.lede}</p>}
          {grid(l, 0)}
        </>
      }
      recto={
        <>
          {c.sprite && (
            <div className="bk-cast-head">
              <CastSprite src={c.sprite} guest={c.guest} className="bk-cast bk-cast-small" />
            </div>
          )}
          {grid(r, l.length)}
        </>
      }
    />
  );
}

function Cards({ b, c }: { b: Of<'cards'>; c: Ctx }) {
  const [l, r] = half(b.items);
  const list = (xs: Of<'cards'>['items']) => (
    <ul className="bk-persons">
      {xs.map((it, k) => (
        <li key={k}>
          {it.icon && (
            <span className="bk-art-icon" aria-hidden="true">
              <Icon name={it.icon} size={15} />
            </span>
          )}
          <div>
            <h3 className="bk-h4">{it.title}</h3>
            {it.subtitle && <p className="bk-person-sub">{it.subtitle}</p>}
            {it.value && (
              <p className="bk-person-val">
                <strong>{it.value}</strong> {it.valueLabel}
              </p>
            )}
            {it.meta && <p className="bk-person-meta">{it.meta}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
  return (
    <Spread
      id={secId(c)}
      tour={tourId(c)}
      label={b.head.label}
      heads={heads(c, b.head.label)}
      folios={folios(c)}
      verso={
        <>
          <Opener chapter={c.chapter} head={b.head} />
          {b.head.lede && <p className="bk-epigraph">{b.head.lede}</p>}
          {list(l)}
        </>
      }
      recto={
        <>
          <MarginCast c={c} />
          {list(r)}
        </>
      }
    />
  );
}

function Table({ b, c }: { b: Of<'table'>; c: Ctx }) {
  const label = b.head?.label ?? 'Table';
  return (
    <Sheet id={secId(c)} tour={tourId(c)} label={label} heads={heads(c, label)} folios={folios(c)}>
      {b.head && <Opener chapter={c.chapter} head={b.head} />}
      {b.head?.lede && <p className="bk-epigraph">{b.head.lede}</p>}
      <div className="bk-table-wrap" tabIndex={0} role="region" aria-label={label}>
        <table className="bk-table">
          <thead>
            <tr>
              {b.columns.map((col, k) => (
                <th key={k} scope="col">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((row, k) => (
              <tr key={k}>
                {row.map((cell, j) =>
                  j === 0 ? (
                    <th key={j} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={j}>{cell}</td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Sheet>
  );
}

function Compare({ b, c }: { b: Of<'compare'>; c: Ctx }) {
  return (
    <Sheet id={secId(c)} tour={tourId(c)} label={b.head.label} heads={heads(c, b.head.label)} folios={folios(c)}>
      <Opener chapter={c.chapter} head={b.head} />
      {b.head.lede && <p className="bk-epigraph">{b.head.lede}</p>}
      <Plate image={b.image} label={plateLabel(c, 1)} crop={false} className="bk-plate-wide" />
    </Sheet>
  );
}

function Markdown({ b, c }: { b: Of<'markdown'>; c: Ctx }) {
  return (
    <Sheet id={secId(c)} tour={tourId(c)} label={b.head.label} heads={heads(c, b.head.label)} folios={folios(c)}>
      <Opener chapter={c.chapter} head={b.head} />
      {b.head.lede && <p className="bk-epigraph">{b.head.lede}</p>}
      <Manuscript file={b.file} />
    </Sheet>
  );
}

function Marquee({ b, c }: { b: Of<'marquee'>; c: Ctx }) {
  return (
    <aside id={secId(c)} data-tour={tourId(c)} className="bk-epigraphs" aria-label="Epigraphs">
      {b.items.map((t, k) => (
        <span key={k}>
          {k > 0 && (
            <span className="bk-epi-orn" aria-hidden="true">
              {' '}❧{' '}
            </span>
          )}
          {t}
        </span>
      ))}
    </aside>
  );
}

function Outro({ b, c }: { b: Of<'outro'>; c: Ctx }) {
  const p = c.project;
  const hasBack = b.actions.some((a) => a.href === '/#work');
  return (
    <Spread
      id={secId(c)}
      tour={tourId(c)}
      label="Colophon"
      className="bk-last"
      heads={[c.book, 'Colophon']}
      folios={folios(c)}
      verso={
        <div className="bk-colophon">
          <p className="bk-chapno">Colophon</p>
          <p className="bk-orn" aria-hidden="true">❦</p>
          <p>
            <span className="sc">{p.title}</span>
            {p.tagline && <>, {p.tagline.charAt(0).toLowerCase() + p.tagline.slice(1)}</>}.
          </p>
          {p.role && (
            <p>
              Designed and built by one hand: <em>{p.role}</em>.
            </p>
          )}
          <p>
            Shelved under <em>{p.category}</em>
            {p.date ? <>, {p.date}</> : p.year ? <>, {p.year}</> : null}. Status: <em>{p.status}</em>.
          </p>
          {p.tags.length > 0 && (
            <p className="bk-colo-set">
              Set in{' '}
              {p.tags.map((t, k) => (
                <span key={k}>
                  <span className="sc">{t}</span>
                  {k < p.tags.length - 2 ? ', ' : k === p.tags.length - 2 ? ' and ' : '.'}
                </span>
              ))}
            </p>
          )}
          <p className="bk-colo-type">
            This page is typeset in Cormorant Garamond and EB Garamond, on paper the colour of an old library
            card.
          </p>
          {c.guest && c.guest.poses.length > 0 && (
            <p className="bk-colo-guide">
              Your guide through these pages: <span className="sc">{c.guest.name}</span>, of <em>{c.guest.series}</em>.
            </p>
          )}
          <CastRow c={c} />
        </div>
      }
      recto={
        <div className="bk-finis">
          <p className="bk-finis-word">Finis</p>
          <h2 className="bk-h2">
            {b.title} {b.accentWord && <em>{b.accentWord}</em>}
          </h2>
          <div className="bk-actions bk-actions-center">
            {b.actions.map((a, k) => (
              <Btn key={k} a={a} />
            ))}
            {!hasBack && <Btn a={{ label: 'Close the book', href: '/#work', kind: 'ghost' }} />}
          </div>
          <p className="bk-orn" aria-hidden="true">✦ ✦ ✦</p>
        </div>
      }
    />
  );
}

/** Pages a block occupies, for the contents list and the running folios. */
export function pagesFor(b: Block): number {
  if (b.type === 'marquee') return 0;
  if (b.type === 'steps') return Math.max(1, Math.ceil(b.items.length / 2)) * 2;
  return 2;
}

export function Chapter({ b, c }: { b: Block; c: Ctx }) {
  switch (b.type) {
    case 'stats':
      return <StatsSpread b={b} c={c} />;
    case 'overview':
      return <Overview b={b} c={c} />;
    case 'duo':
      return <Duo b={b} c={c} />;
    case 'tabs':
      return <Tabs b={b} c={c} />;
    case 'steps':
      return <Steps b={b} c={c} />;
    case 'phones':
      return <Phones b={b} c={c} />;
    case 'columns':
      return <Columns b={b} c={c} />;
    case 'gallery':
      return <Gallery b={b} c={c} />;
    case 'cards':
      return <Cards b={b} c={c} />;
    case 'table':
      return <Table b={b} c={c} />;
    case 'compare':
      return <Compare b={b} c={c} />;
    case 'markdown':
      return <Markdown b={b} c={c} />;
    case 'marquee':
      return <Marquee b={b} c={c} />;
    case 'outro':
      return <Outro b={b} c={c} />;
    default:
      return null;
  }
}

/** Every pose that did not get a spot of its own, standing together at the end of the book. */
export function CastRow({ c }: { c: Pick<Ctx, 'rest' | 'guest'> }) {
  if (!c.rest || !c.rest.length) return null;
  return (
    <div className="bk-cast-row">
      {c.rest.map((src, k) => (
        <CastSprite key={k} src={src} guest={c.guest} className="bk-cast bk-cast-group" />
      ))}
    </div>
  );
}
