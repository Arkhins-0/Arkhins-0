/* eslint-disable @next/next/no-img-element */
import type { Block, ThemedImage } from '@/types/content';
import { Icon } from '../../primitives';
import { MarkdownColumns } from './Markdown';
import { Zoom } from './Lightbox';
import { ActionLink, Barcode, CastRow, Headline, Plate, Star, Tear, hash, rng } from './print';
import type { PageGuest } from '../types';

/** `star` is the pose for this spread's sprite spot (if any); `rest` only reaches the back cover. */
export type Ctx = { page: number; issue: string; mag: string; guest?: PageGuest; star?: string; rest?: string[] };

/** Running foot of a spread, like the folio line along the bottom of a printed page. */
function Folio({ ctx, label }: { ctx: Ctx; label: string }) {
  return (
    <p className="ctr-folio" aria-hidden="true">
      <span>{ctx.page}</span>
      <span>
        {ctx.mag} · {ctx.issue}
      </span>
      <span>{label}</span>
    </p>
  );
}

/** First sentence of a paragraph, lifted as a pull quote. */
function firstSentence(p?: string) {
  if (!p) return null;
  const m = p.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : p).trim();
}

// ------------------------------------------------------------------ marquee

function Ticker({ items }: { items: string[] }) {
  const row = (hidden: boolean) => (
    <ul className="ctr-ticker__row" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <li key={i}>
          <span>{t}</span>
          <span className="ctr-ticker__star" aria-hidden="true">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="ctr-ticker">
      <div className="ctr-ticker__under" aria-hidden="true" />
      <div className="ctr-ticker__tape">
        <div className="ctr-ticker__track">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------- stats

function Numbers({ items, ctx }: { items: { value: string; label: string }[]; ctx: Ctx }) {
  return (
    <div className="ctr-wrap">
      <p className="ctr-hed__kicker ctr-hed__kicker--solo">
        <span className="ctr-hed__idx">№</span>
        <span>By the numbers</span>
        <span className="ctr-hed__pg">p.{ctx.page}</span>
      </p>
      <CastRow src={ctx.star} guest={ctx.guest} side="right" size="lg" className="ctr-castrow--numbers">
      <ol className="ctr-numbers">
        {items.map((s, i) => (
          <li key={i} className={`ctr-numbers__item ctr-numbers__item--${i % 3}`}>
            <span className="ctr-roundel" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="ctr-numbers__value">{s.value}</span>
            <span className="ctr-numbers__label">{s.label}</span>
          </li>
        ))}
      </ol>
      </CastRow>
    </div>
  );
}

// ----------------------------------------------------------------- overview

function Feature({ block, ctx }: { block: Extract<Block, { type: 'overview' }>; ctx: Ctx }) {
  const quote = firstSentence(block.paragraphs[1] ?? block.paragraphs[0]);
  const r = rng(hash(block.head.title));
  return (
    <div className="ctr-wrap">
      <Headline head={block.head} page={ctx.page} />
      <div className="ctr-feature">
        <div className="ctr-cols ctr-dropcap">
          {block.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {((quote && block.paragraphs.length > 1) || ctx.star) && (
          <div className="ctr-feature__side">
            {quote && block.paragraphs.length > 1 && (
              <aside className="ctr-pull" aria-hidden="true">
                <span className="ctr-pull__mark">“</span>
                {quote}
              </aside>
            )}
            <Star src={ctx.star} guest={ctx.guest} size="lg" className="ctr-star--pull" />
          </div>
        )}
      </div>
      {block.features && block.features.length > 0 && (
        <div className="ctr-decals">
          <p className="ctr-decals__title">
            <span>Sticker sheet</span> peel &amp; apply
          </p>
          <ul className="ctr-decals__grid">
            {block.features.map((f, i) => {
              const tilt = ((r() - 0.5) * 5).toFixed(2);
              return (
                <li key={i} className={`ctr-decal ctr-decal--${i % 4}`} style={{ ['--tilt' as string]: `${tilt}deg` }}>
                  <span className="ctr-decal__icon" aria-hidden="true">
                    <Icon name={f.icon} size={22} />
                  </span>
                  <h3 className="ctr-decal__title">{f.title}</h3>
                  <p className="ctr-decal__body">{f.description}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <Folio ctx={ctx} label={block.head.label} />
    </div>
  );
}

// ---------------------------------------------------------------------- duo

function HeadToHead({ block, ctx }: { block: Extract<Block, { type: 'duo' }>; ctx: Ctx }) {
  const images = block.sides.map((s) => s.image);
  return (
    <div className="ctr-wrap">
      <Headline head={block.head} page={ctx.page} />
      <div className="ctr-h2h">
        <span className="ctr-h2h__vs" aria-hidden="true">
          VS
        </span>
        {block.sides.map((s, i) => (
          <article key={i} className={`ctr-h2h__side ctr-h2h__side--${i % 2}`}>
            <p className="ctr-dateline">{s.eyebrow}</p>
            <h3 className="ctr-h2h__title">{s.title}</h3>
            <Plate
              items={images}
              index={i}
              className={s.device === 'phone' ? 'ctr-plate--phone' : 'ctr-plate--screen'}
              caption={s.url ?? s.image.caption ?? s.image.alt}
            />
            <p className="ctr-h2h__body">{s.body}</p>
            <ul className="ctr-bullets">
              {s.points.map((p, j) => (
                <li key={j}>{p}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <CastRow src={ctx.star} guest={ctx.guest} side="left" flip size="md" className="ctr-castrow--stamps">
      {block.shared && (
        <div className="ctr-stamps">
          <p className="ctr-stamps__title">{block.shared.title}</p>
          <ul>
            {block.shared.items.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}
      </CastRow>
      <Folio ctx={ctx} label={block.head.label} />
    </div>
  );
}

// --------------------------------------------------------------------- tabs

function ThreePart({ block, ctx }: { block: Extract<Block, { type: 'tabs' }>; ctx: Ctx }) {
  return (
    <div className="ctr-wrap">
      <CastRow src={ctx.star} guest={ctx.guest} side="right" size="md">
        <Headline head={block.head} page={ctx.page} tone="red" />
      </CastRow>
      <div className="ctr-parts" style={{ ['--n' as string]: String(Math.min(block.tabs.length, 3)) }}>
        {block.tabs.map((t, i) => (
          <article key={t.id} className={`ctr-part ctr-part--${i % 3}`} id={`ctr-part-${t.id}`}>
            <header className="ctr-part__head">
              <span className="ctr-part__no">Part {i + 1}</span>
              <h3 className="ctr-part__label">{t.label}</h3>
              {t.subtitle && <p className="ctr-part__sub">{t.subtitle}</p>}
            </header>
            <ol className="ctr-part__steps">
              {t.steps.map((s, j) => (
                <li key={j}>
                  <span className="ctr-part__n" aria-hidden="true">
                    {j + 1}
                  </span>
                  <div>
                    <h4>{s.title}</h4>
                    <p>{s.description}</p>
                  </div>
                </li>
              ))}
            </ol>
            {t.details && t.details.length > 0 && (
              <footer className="ctr-part__foot">
                <span className="ctr-part__foot-title">{t.detailsTitle ?? 'Notes'}:</span>{' '}
                {t.details.map((d, j) => (
                  <span key={j} className={d.startsWith('⚠') ? 'ctr-part__warn' : undefined}>
                    {d}
                    {j < t.details!.length - 1 ? ' · ' : ''}
                  </span>
                ))}
              </footer>
            )}
          </article>
        ))}
      </div>
      <Folio ctx={ctx} label={block.head.label} />
    </div>
  );
}

// -------------------------------------------------------------------- steps

function PhotoEssay({ block, ctx }: { block: Extract<Block, { type: 'steps' }>; ctx: Ctx }) {
  const images = block.items.map((s) => s.image);
  return (
    <div className="ctr-wrap">
      <Headline head={block.head} page={ctx.page} />
      <ol className="ctr-essay">
        {block.items.map((s, i) => (
          <li key={i} className={`ctr-essay__item${i % 2 ? ' ctr-essay__item--flip' : ''}${s.tall ? ' is-tall' : ''}`}>
            <Plate items={images} index={i} tall={s.tall} tape={i % 3 === 0} caption={false} />
            <div className="ctr-essay__text">
              <span className="ctr-essay__no" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="ctr-essay__title">{s.title}</h3>
              <p className="ctr-essay__body">{s.body}</p>
              {s.ticks && s.ticks.length > 0 && (
                <ul className="ctr-bullets ctr-bullets--spotted">
                  {s.ticks.map((t, j) => (
                    <li key={j}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
      <Folio ctx={ctx} label={block.head.label} />
    </div>
  );
}

// ------------------------------------------------------------------- phones

function ContactSheet({ block, ctx }: { block: Extract<Block, { type: 'phones' }>; ctx: Ctx }) {
  return (
    <div className="ctr-wrap">
      <Headline head={block.head} page={ctx.page} />
      <CastRow src={ctx.star} guest={ctx.guest} side="left" flip size="md">
      <div className="ctr-sheet">
        <p className="ctr-sheet__label" aria-hidden="true">
          <span>CONTACT SHEET</span>
          <span>{ctx.mag} PRESS 400</span>
        </p>
        <ul className="ctr-film">
          {block.items.map((img, i) => (
            <li key={i} className={`ctr-film__frame${i === 0 ? ' is-picked' : ''}`}>
              <span className="ctr-film__no" aria-hidden="true">
                {i + 12}
                {i % 2 ? 'A' : ''} ▸
              </span>
              <Zoom items={block.items} index={i} className="ctr-film__zoom">
                <img src={img.light} alt={img.alt} loading="lazy" decoding="async" />
              </Zoom>
              <span className="ctr-film__cap">{img.caption ?? img.alt}</span>
            </li>
          ))}
        </ul>
      </div>
      </CastRow>
      <Folio ctx={ctx} label={block.head.label} />
    </div>
  );
}

// ------------------------------------------------------------------ columns

function SpecSheet({ block, ctx }: { block: Extract<Block, { type: 'columns' }>; ctx: Ctx }) {
  const lists = block.columns.filter((c) => c.style !== 'chips');
  const chips = block.columns.filter((c) => c.style === 'chips');
  return (
    <div className="ctr-wrap">
      <Headline head={block.head} page={ctx.page} />
      <CastRow src={ctx.star} guest={ctx.guest} side="right" size="lg">
      <div className="ctr-spec">
        <p className="ctr-spec__band" aria-hidden="true">
          <span>Technical specification</span>
          <span>Homologation sheet</span>
        </p>
        <div className="ctr-spec__grid">
          {lists.map((c, i) => (
            <section key={i} className="ctr-spec__col" aria-label={c.title}>
              <h3 className="ctr-spec__title">
                <span aria-hidden="true">{String.fromCharCode(65 + i)}.</span> {c.title}
              </h3>
              <ul className="ctr-spec__list">
                {c.items.map((t, j) => (
                  <li key={j}>{t}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
      </CastRow>
      {chips.map((c, i) => (
        <div key={i} className="ctr-livery">
          <h3 className="ctr-livery__title">{c.title}</h3>
          <ul className="ctr-livery__sheet">
            {c.items.map((t, j) => (
              <li key={j} className={`ctr-sticker ctr-sticker--${hash(t) % 5}`} style={{ ['--tilt' as string]: `${((hash(t) % 9) - 4) * 0.8}deg` }}>
                {t}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Folio ctx={ctx} label={block.head.label} />
    </div>
  );
}

// ------------------------------------------------------------------ gallery

function Scrapbook({ block, ctx, images }: { block: { head: Parameters<typeof Headline>[0]['head'] }; ctx: Ctx; images: ThemedImage[] }) {
  return (
    <div className="ctr-wrap">
      <CastRow src={ctx.star} guest={ctx.guest} side="right" size="sm">
        <Headline head={block.head} page={ctx.page} />
      </CastRow>
      <ul className="ctr-scrap">
        {images.map((img, i) => (
          <li key={i} className="ctr-polaroid" style={{ ['--tilt' as string]: `${((hash(img.light) % 7) - 3) * 0.9}deg` }}>
            <span className={`ctr-tape ctr-tape--${i % 3}`} aria-hidden="true" />
            <Zoom items={images} index={i} className="ctr-polaroid__zoom">
              <img src={img.light} alt={img.alt} loading="lazy" decoding="async" />
            </Zoom>
            <span className="ctr-polaroid__cap">{img.caption ?? img.alt}</span>
          </li>
        ))}
      </ul>
      <Folio ctx={ctx} label={block.head.label} />
    </div>
  );
}

// -------------------------------------------------------------------- outro

function BackCover({ block, ctx }: { block: Extract<Block, { type: 'outro' }>; ctx: Ctx }) {
  const hasBack = block.actions.some((a) => a.href === '/#work');
  return (
    <div className="ctr-back">
      <Tear seed={hash(block.title) + 3} flip />
      <div className="ctr-back__dots" aria-hidden="true" />
      <div className="ctr-wrap ctr-back__inner">
        <p className="ctr-back__ad">Advertisement · back cover</p>
        <h2 className="ctr-back__title">
          {block.title}
          {block.accentWord && (
            <>
              {' '}
              <span className="ctr-back__accent">{block.accentWord}</span>
            </>
          )}
        </h2>
        <div className="ctr-coupon">
          <span className="ctr-coupon__scissors" aria-hidden="true">
            ✂
          </span>
          <p className="ctr-coupon__title">Clip &amp; keep</p>
          <div className="ctr-coupon__actions">
            {block.actions.map((a, i) => (
              <ActionLink key={i} action={a} />
            ))}
            {!hasBack && <ActionLink action={{ label: 'Back to portfolio', href: '/#work', kind: 'ghost' }} />}
          </div>
          <Barcode text={`${ctx.mag}${ctx.issue}${block.title}`} className="ctr-coupon__code" />
        </div>
        {(ctx.star || (ctx.rest && ctx.rest.length > 0)) && (
          <div className="ctr-back__cast">
            <p className="ctr-back__castlabel">Cover stars of the issue</p>
            <div className="ctr-back__castrow">
              <Star src={ctx.star} guest={ctx.guest} size="md" />
              {(ctx.rest ?? []).map((src, i) => (
                <Star key={`${src}-${i}`} src={src} guest={ctx.guest} size="md" flip={i % 2 === 1} />
              ))}
            </div>
          </div>
        )}
        <p className="ctr-back__small" aria-hidden="true">
          Printed on the grid · {ctx.mag} · {ctx.issue}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- fallbacks

function Classification({ block, ctx }: { block: Extract<Block, { type: 'table' }>; ctx: Ctx }) {
  return (
    <div className="ctr-wrap">
      {block.head && <Headline head={block.head} page={ctx.page} />}
      <div className="ctr-table-wrap">
        <table className="ctr-table">
          <thead>
            <tr>
              {block.columns.map((c, i) => (
                <th key={i} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) =>
                  j === 0 ? (
                    <th key={j} scope="row">
                      {c}
                    </th>
                  ) : (
                    <td key={j}>{c}</td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Folio ctx={ctx} label={blockLabelSafe(block.head?.label, 'Classification')} />
    </div>
  );
}

function blockLabelSafe(l: string | undefined, d: string) {
  return l ?? d;
}

function LineUp({ block, ctx }: { block: Extract<Block, { type: 'cards' }>; ctx: Ctx }) {
  return (
    <div className="ctr-wrap">
      <Headline head={block.head} page={ctx.page} />
      <ul className="ctr-lineup">
        {block.items.map((c, i) => (
          <li key={i} className="ctr-lineup__card">
            <span className="ctr-roundel ctr-roundel--sm" aria-hidden="true">
              {c.icon ? <Icon name={c.icon} size={18} /> : String(i + 1)}
            </span>
            <h3>{c.title}</h3>
            {c.subtitle && <p className="ctr-lineup__sub">{c.subtitle}</p>}
            {c.value && (
              <p className="ctr-lineup__value">
                {c.value}
                {c.valueLabel && <small> {c.valueLabel}</small>}
              </p>
            )}
            {c.meta && <p className="ctr-lineup__meta">{c.meta}</p>}
          </li>
        ))}
      </ul>
      <Folio ctx={ctx} label={block.head.label} />
    </div>
  );
}

function Reprint({ block, ctx }: { block: Extract<Block, { type: 'markdown' }>; ctx: Ctx }) {
  return (
    <div className="ctr-wrap">
      <Headline head={block.head} page={ctx.page} />
      <MarkdownColumns file={block.file} />
      <Folio ctx={ctx} label={block.head.label} />
    </div>
  );
}

function Centrefold({ block, ctx }: { block: Extract<Block, { type: 'compare' }>; ctx: Ctx }) {
  return (
    <div className="ctr-wrap">
      <Headline head={block.head} page={ctx.page} />
      <Plate items={[block.image]} index={0} tape className="ctr-plate--wide" />
      <Folio ctx={ctx} label={block.head.label} />
    </div>
  );
}

// ------------------------------------------------------------------ dispatch

export function Spread({ block, ctx }: { block: Block; ctx: Ctx }) {
  switch (block.type) {
    case 'marquee':
      return <Ticker items={block.items} />;
    case 'stats':
      return <Numbers items={block.items} ctx={ctx} />;
    case 'overview':
      return <Feature block={block} ctx={ctx} />;
    case 'duo':
      return <HeadToHead block={block} ctx={ctx} />;
    case 'tabs':
      return <ThreePart block={block} ctx={ctx} />;
    case 'steps':
      return <PhotoEssay block={block} ctx={ctx} />;
    case 'phones':
      return <ContactSheet block={block} ctx={ctx} />;
    case 'columns':
      return <SpecSheet block={block} ctx={ctx} />;
    case 'gallery':
      return <Scrapbook block={block} ctx={ctx} images={block.items} />;
    case 'outro':
      return <BackCover block={block} ctx={ctx} />;
    case 'table':
      return <Classification block={block} ctx={ctx} />;
    case 'cards':
      return <LineUp block={block} ctx={ctx} />;
    case 'markdown':
      return <Reprint block={block} ctx={ctx} />;
    case 'compare':
      return <Centrefold block={block} ctx={ctx} />;
    default:
      return null;
  }
}
