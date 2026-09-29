import type { CSSProperties, ReactNode } from 'react';
import type { Action, Block, Head } from '@/types/content';
import { CastSprite } from '../cast';
import type { PageGuest } from '../types';
import { Notes, Shot } from './Client';

export type CastProps = { src?: string; guest?: PageGuest };

/**
 * The guide as the desk "analyst": a sprite in its own column beside a panel's content, never over it.
 * With no pose for this spot it renders the content alone.
 */
export function Beside({
  cast,
  side = 'right',
  h = 300,
  wide,
  sticky,
  children,
}: {
  cast?: CastProps;
  side?: 'left' | 'right';
  h?: number;
  wide?: boolean;
  sticky?: boolean;
  children: ReactNode;
}) {
  if (!cast?.src) return <>{children}</>;
  return (
    <div className={`msft-beside ${side}`}>
      <div className="msft-beside-main">{children}</div>
      <CastFigure cast={cast} h={h} wide={wide} sticky={sticky} side={side} />
    </div>
  );
}

export function CastFigure({
  cast,
  h,
  wide,
  sticky,
  side = 'right',
  className = '',
}: {
  cast: CastProps;
  h: number;
  wide?: boolean;
  sticky?: boolean;
  side?: 'left' | 'right';
  className?: string;
}) {
  return (
    <figure
      className={`msft-cast ${side} ${wide ? 'wide' : ''} ${sticky ? 'sticky' : ''} ${className}`}
      style={{ '--cast-h': `${h}px` } as CSSProperties}
    >
      <figcaption aria-hidden="true">ANL · {(cast.guest?.name ?? 'GUIDE').toUpperCase()}</figcaption>
      <CastSprite src={cast.src} guest={cast.guest} />
    </figure>
  );
}

export function Panel({
  id,
  tour,
  code,
  title,
  meta,
  span = 'full',
  children,
  className = '',
}: {
  id?: string;
  tour?: string;
  code: string;
  title: ReactNode;
  meta?: ReactNode;
  span?: 'full' | 'wide' | 'half' | 'narrow' | 'third';
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} data-tour={tour} className={`msft-panel msft-${span} ${className}`} aria-labelledby={id ? `${id}-h` : undefined}>
      <header className="msft-panel-head">
        <span className="msft-code">{code}</span>
        <h2 id={id ? `${id}-h` : undefined}>{title}</h2>
        {meta && <span className="msft-meta">{meta}</span>}
      </header>
      <div className="msft-panel-body">{children}</div>
    </section>
  );
}

export function ActionKey({ action, primary }: { action: Action; primary?: boolean }) {
  const ext = action.external || /^https?:/.test(action.href);
  return (
    <a
      href={action.href}
      className={`msft-go ${primary && action.kind !== 'ghost' ? 'solid' : ''}`}
      {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      <span>{action.label}</span>
      <kbd>{ext ? '↗' : 'GO'}</kbd>
    </a>
  );
}

const headTitle = (h: Head) => (
  <>
    {h.title} {h.accentWord && <em>{h.accentWord}</em>}
  </>
);
const headCode = (h: Head) => `${h.index} ${h.label}`.toUpperCase();

/** Any showcase block, printed as a terminal panel. */
export function BlockPanel({
  block,
  i,
  cast,
  rest,
}: {
  block: Block;
  i: number;
  /** The guide's pose for this panel, if it has a spot. */
  cast?: CastProps;
  /** Poses beyond the page's spots; shown by the EXIT panel. */
  rest?: CastProps[];
}) {
  const id = `msft-sec-${i}`;
  const tour = `section-${i}`;
  switch (block.type) {
    case 'markdown':
      return (
        <Panel id={id} tour={tour} code={headCode(block.head)} title={headTitle(block.head)} meta="CN · CASE NOTES" className="msft-notes">
          <Beside cast={cast} h={360} sticky>
            {block.head.lede && <p className="msft-lede">{block.head.lede}</p>}
            <Notes file={block.file} />
          </Beside>
        </Panel>
      );
    case 'outro':
      return (
        <Panel id={id} tour={tour} code="EXIT" title="Session summary" meta="END OF FEED" className="msft-outro">
          <Beside cast={cast} h={300}>
            <p className="msft-outro-title">
              {block.title} {block.accentWord && <em>{block.accentWord}</em>}
            </p>
            <div className="msft-actions">
              {block.actions.map((a, k) => (
                <ActionKey key={k} action={a} primary={k === 0} />
              ))}
            </div>
            {rest && rest.length > 0 && (
              <div className="msft-rest">
                <p className="msft-rest-label">
                  <span className="msft-code">DESK</span> Also on shift
                </p>
                <ul>
                  {rest.map((r) => (
                    <li key={r.src}>
                      <CastSprite src={r.src} guest={r.guest} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Beside>
        </Panel>
      );
    case 'stats':
      return (
        <Panel id={id} tour={tour} code="STAT" title="Figures">
          <dl className="msft-kpis">
            {block.items.map((s, k) => (
              <div key={k} className="msft-kpi">
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      );
    case 'marquee':
      return (
        <div id={id} data-tour={tour}>
          <Tape items={block.items} label="Headlines" />
        </div>
      );
    case 'overview':
      return (
        <Panel id={id} tour={tour} code={headCode(block.head)} title={headTitle(block.head)}>
          {block.head.lede && <p className="msft-lede">{block.head.lede}</p>}
          {block.paragraphs.map((p, k) => (
            <p key={k} className="msft-para">
              {p}
            </p>
          ))}
          {block.features && (
            <ul className="msft-rows">
              {block.features.map((f, k) => (
                <li key={k}>
                  <b>{f.title}</b>
                  <span>{f.description}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      );
    case 'cards':
      return (
        <Panel id={id} tour={tour} code={headCode(block.head)} title={headTitle(block.head)}>
          <ul className="msft-rows">
            {block.items.map((c, k) => (
              <li key={k}>
                <b>{c.title}</b>
                <span>{[c.subtitle, c.meta].filter(Boolean).join(' · ')}</span>
                {c.value && (
                  <span className="msft-up-t">
                    {c.value} {c.valueLabel}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      );
    case 'table':
      return (
        <Panel id={id} tour={tour} code={block.head ? headCode(block.head) : 'TBL'} title={block.head ? headTitle(block.head) : 'Table'}>
          <div className="msft-md-table">
            <table>
              <thead>
                <tr>
                  {block.columns.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((r, k) => (
                  <tr key={k}>
                    {r.map((c, j) => (
                      <td key={j}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      );
    case 'tabs':
      return (
        <Panel id={id} tour={tour} code={headCode(block.head)} title={headTitle(block.head)}>
          <div className="msft-cols">
            {block.tabs.map((t) => (
              <div key={t.id}>
                <h3 className="msft-sub">{t.label}</h3>
                <ol className="msft-rows">
                  {t.steps.map((s, k) => (
                    <li key={k}>
                      <b>{s.title}</b>
                      <span>{s.description}</span>
                    </li>
                  ))}
                </ol>
                {t.details && (
                  <ul className="msft-ticks">
                    {t.details.map((d, k) => (
                      <li key={k}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Panel>
      );
    case 'columns':
      return (
        <Panel id={id} tour={tour} code={headCode(block.head)} title={headTitle(block.head)}>
          <div className="msft-cols">
            {block.columns.map((c) => (
              <div key={c.title}>
                <h3 className="msft-sub">{c.title}</h3>
                <ul className={c.style === 'chips' ? 'msft-chips' : 'msft-ticks'}>
                  {c.items.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>
      );
    case 'steps':
      return (
        <Panel id={id} tour={tour} code={headCode(block.head)} title={headTitle(block.head)}>
          <div className="msft-shots">
            {block.items.map((s, k) => (
              <div key={k}>
                <h3 className="msft-sub">{s.title}</h3>
                <p className="msft-para">{s.body}</p>
                {s.ticks && (
                  <ul className="msft-ticks">
                    {s.ticks.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
                <Shot image={s.image} code="STEP" index={k} />
              </div>
            ))}
          </div>
        </Panel>
      );
    case 'duo':
      return (
        <Panel id={id} tour={tour} code={headCode(block.head)} title={headTitle(block.head)}>
          <div className="msft-shots">
            {block.sides.map((s, k) => (
              <div key={k}>
                <h3 className="msft-sub">
                  {s.eyebrow} · {s.title}
                </h3>
                <p className="msft-para">{s.body}</p>
                <Shot image={s.image} code={s.device.toUpperCase()} index={k} />
                <ul className="msft-ticks">
                  {s.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {block.shared && (
            <ul className="msft-chips">
              {block.shared.items.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          )}
        </Panel>
      );
    case 'compare':
    case 'phones':
    case 'gallery': {
      const items = block.type === 'compare' ? [block.image] : block.items;
      return (
        <Panel id={id} tour={tour} code={headCode(block.head)} title={headTitle(block.head)} meta={`${items.length} WINDOW${items.length === 1 ? '' : 'S'}`}>
          <div className="msft-shots">
            {items.map((img, k) => (
              <Shot key={k} image={img} code="GP" index={k} />
            ))}
          </div>
        </Panel>
      );
    }
    default:
      return null;
  }
}

/** Scrolling ticker tape; the list is doubled so the loop is seamless, the copy hidden from AT. */
export function Tape({ items, label }: { items: ReactNode[]; label: string }) {
  return (
    <div className="msft-tape" role="region" aria-label={label}>
      <div className="msft-tape-track">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1 ? true : undefined}>
            {items.map((it, k) => (
              <li key={k}>{it}</li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
