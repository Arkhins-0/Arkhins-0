'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { pad, roman } from './money';
import { CastSprite } from '../cast';
import type { PageGuest } from '../types';

type Chunk =
  | { kind: 'front'; body: string; h3Start: number }
  | { kind: 'part'; title: string; part: number; body: string; h3Start: number }
  | { kind: 'lot'; title: string; lot: number; part: number; md: number; body: string; h3Start: number };

/**
 * Splits the case study into catalogue pieces: text before the first heading is the frontispiece, each `#`
 * opens a Part, each `##` is a Lot. `md` numbers every h2/h3 in document order for the tour markers.
 */
function split(src: string): Chunk[] {
  const out: Chunk[] = [];
  let md = 0;
  let part = 0;
  let lot = 0;
  let fence = false;
  let cur: Chunk = { kind: 'front', body: '', h3Start: 0 };
  const lines: string[] = [];
  const flush = () => {
    cur.body = lines.join('\n').trim();
    lines.length = 0;
    if (cur.kind !== 'front' || cur.body) out.push(cur);
  };
  for (const line of src.replace(/\r\n?/g, '\n').split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (!fence) {
      const h1 = /^#\s+(.+?)\s*#*\s*$/.exec(line);
      const h2 = /^##\s+(.+?)\s*#*\s*$/.exec(line);
      if (h1) {
        flush();
        part += 1;
        cur = { kind: 'part', title: h1[1], part, body: '', h3Start: md };
        continue;
      }
      if (h2) {
        flush();
        md += 1;
        lot += 1;
        cur = { kind: 'lot', title: h2[1], lot, part: Math.max(part, 1), md, body: '', h3Start: md };
        continue;
      }
      if (/^###\s+/.test(line)) md += 1;
      if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) continue; // rules: the catalogue draws its own
    }
    lines.push(line);
  }
  flush();
  return out;
}

const words = (s: string) => s.replace(/[#*_`>!\[\]()-]/g, ' ').split(/\s+/).filter(Boolean).length;

function estimate(body: string) {
  const min = Math.max(1, Math.round(words(body) / 200));
  return `${min}–${min + 1} min`;
}

const plain = (s: string) => s.replace(/[*_`]/g, '');

/** The markdown renderer, with h3 tour markers numbered from `h3Start` in document order. */
function Prose({ body, h3Start }: { body: string; h3Start: number }) {
  let k = 0;
  const components: Components = {
    h1: ({ children }) => <h3 className="bn-p-h1">{children}</h3>,
    h2: ({ children }) => <h3 className="bn-p-h2">{children}</h3>,
    h3: ({ children }) => {
      k += 1;
      return (
        <h3 className="bn-p-h3" data-tour={`md-${h3Start + k}`}>
          <span aria-hidden="true">§ </span>
          {children}
        </h3>
      );
    },
    a: ({ href, children }) => {
      const ext = !!href && /^https?:/i.test(href);
      return (
        <a href={href} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {children}
        </a>
      );
    },
    img: ({ src, alt }) => (
      <span className="bn-plate bn-plate-inline">
        <span className="bn-plate-frame">
          <img src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} loading="lazy" />
        </span>
        {alt && <span className="bn-plate-cap">{alt}</span>}
      </span>
    ),
    table: ({ children }) => (
      <div className="bn-table-wrap">
        <table>{children}</table>
      </div>
    ),
  };
  return (
    <div className="bn-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {body}
      </ReactMarkdown>
    </div>
  );
}

function Loading() {
  return (
    <div className="bn-cat-loading" role="status">
      <span className="bn-gavel-spin" aria-hidden="true">
        <GavelMark />
      </span>
      <p>The catalogue is being brought up from the vault&hellip;</p>
      <span className="bn-skel" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}

function GavelMark() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        <rect x="14" y="10" width="26" height="12" rx="2" transform="rotate(-40 27 16)" />
        <path d="M30 24 L52 50" />
        <path d="M10 56 h26" />
        <path d="M14 51 h18" />
      </g>
    </svg>
  );
}

/** The markdown case study laid out as auction lots, with a lot index up front. */
export function Catalogue({
  file,
  sprites = [],
  guest,
}: {
  file: string;
  /** [by the lot index, then one per chosen lot]; any without a host are shown at the end. */
  sprites?: (string | undefined)[];
  guest?: PageGuest;
}) {
  const [state, setState] = useState<{ s: 'loading' } | { s: 'error' } | { s: 'ok'; chunks: Chunk[] }>({ s: 'loading' });

  useEffect(() => {
    let live = true;
    fetch(file)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((t) => live && setState({ s: 'ok', chunks: split(t) }))
      .catch(() => live && setState({ s: 'error' }));
    return () => {
      live = false;
    };
  }, [file]);

  if (state.s === 'loading') return <Loading />;
  if (state.s === 'error')
    return (
      <div className="bn-cat-loading" role="alert">
        <p>This catalogue could not be fetched just now.</p>
        <a className="bn-btn bn-btn-ghost" href={file} target="_blank" rel="noopener noreferrer">
          Read the notes directly
        </a>
        <Leftovers list={sprites} guest={guest} />
      </div>
    );

  const lots = state.chunks.filter((c): c is Extract<Chunk, { kind: 'lot' }> => c.kind === 'lot');
  const partsCount = state.chunks.filter((c) => c.kind === 'part').length;

  // Sprite 0 stands by the index; the rest are spread evenly through the lots, one per lot.
  const [indexSprite, ...lotSprites] = sprites;
  const byLot = new Map<number, string>();
  const leftovers: (string | undefined)[] = lots.length > 1 ? [] : [indexSprite];
  lotSprites.forEach((src, j) => {
    const at = Math.floor(((j + 0.5) * lots.length) / Math.max(1, lotSprites.length));
    if (src && lots[at] && !byLot.has(lots[at].lot)) byLot.set(lots[at].lot, src);
    else leftovers.push(src);
  });

  return (
    <div className="bn-cat">
      {lots.length > 1 && (
        <div className={`bn-index-row${indexSprite ? ' has-cast' : ''}`}>
        <nav className="bn-index" aria-label="Lot index">
          <p className="bn-kicker">Index of lots</p>
          <ol>
            {lots.map((l) => (
              <li key={l.lot}>
                <a href={`#bn-lot-${l.lot}`}>
                  <span className="bn-index-no">{pad(l.lot)}</span>
                  <span className="bn-index-title">{plain(l.title)}</span>
                  <span className="bn-index-dots" aria-hidden="true" />
                  <span className="bn-index-est">{estimate(l.body)}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <CastSprite src={indexSprite} guest={guest} className="bn-cast bn-cast-index" />
        </div>
      )}

      {state.chunks.map((c, i) => {
        if (c.kind === 'front')
          return (
            <div key={i} className="bn-front">
              <p className="bn-kicker">Frontispiece</p>
              <Prose body={c.body} h3Start={c.h3Start} />
            </div>
          );
        if (c.kind === 'part')
          return (
            <div key={i} className="bn-part">
              <div className="bn-part-head">
                <span className="bn-part-no">{partsCount > 1 ? `Part ${roman(c.part)}` : 'The sale'}</span>
                <h3 className="bn-part-title">{plain(c.title)}</h3>
                <span className="bn-part-orn" aria-hidden="true">
                  ❖
                </span>
              </div>
              {c.body && <Prose body={c.body} h3Start={c.h3Start} />}
            </div>
          );
        return (
          <article key={i} id={`bn-lot-${c.lot}`} className="bn-lot" data-tour={`md-${c.md}`}>
            <aside className="bn-lot-side">
              <span className="bn-lot-label">Lot</span>
              <span className="bn-lot-no">{pad(c.lot)}</span>
              <dl className="bn-lot-meta">
                <div>
                  <dt>Estimate</dt>
                  <dd>{estimate(c.body)} read</dd>
                </div>
                {partsCount > 1 && (
                  <div>
                    <dt>Part</dt>
                    <dd>{roman(c.part)}</dd>
                  </div>
                )}
              </dl>
            </aside>
            <div className="bn-lot-body">
              {byLot.has(c.lot) && (
                <CastSprite
                  src={byLot.get(c.lot)}
                  guest={guest}
                  className={`bn-cast bn-cast-lot bn-cast-lot-${Array.from(byLot.keys()).indexOf(c.lot) + 1}`}
                />
              )}
              <h2 className="bn-lot-title">{plain(c.title)}</h2>
              {c.body && <Prose body={c.body} h3Start={c.h3Start} />}
              <p className="bn-lot-foot" aria-hidden="true">
                Lot {pad(c.lot)} of {pad(lots.length)}
              </p>
            </div>
          </article>
        );
      })}
      <Leftovers list={leftovers} guest={guest} />
    </div>
  );
}

function Leftovers({ list, guest }: { list: (string | undefined)[]; guest?: PageGuest }) {
  const srcs = list.filter((s): s is string => !!s);
  if (!srcs.length) return null;
  return (
    <div className="bn-gathering-row bn-cat-leftovers">
      {srcs.map((src, k) => (
        <CastSprite key={src + k} src={src} guest={guest} className="bn-cast bn-cast-crowd" />
      ))}
    </div>
  );
}
