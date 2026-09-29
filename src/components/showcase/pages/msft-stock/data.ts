/**
 * Deterministic, ILLUSTRATIVE market series for the terminal panels. The shape loosely follows the
 * notebook's actual-vs-predicted plot (2020–2025); the values are generated, not real quotes.
 */
import type { ProjectRow, ShowcaseDoc, ThemedImage } from '@/types/content';

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Anchor points: [years since 2020-01-01, close]. */
const KEYS: [number, number][] = [
  [0, 160], [0.14, 186], [0.22, 140], [0.45, 200], [0.7, 214], [1, 222], [1.3, 245], [1.6, 292],
  [1.88, 340], [2.02, 332], [2.3, 284], [2.45, 256], [2.6, 290], [2.84, 228], [3.02, 240], [3.3, 284],
  [3.55, 345], [3.8, 322], [4.02, 378], [4.25, 420], [4.52, 464], [4.6, 408], [4.8, 432], [4.96, 444], [5, 424],
];

export type Point = { t: number; actual: number; predicted: number };

export function series(n = 261): Point[] {
  const rnd = mulberry32(5_750_1694);
  const out: Point[] = [];
  let drift = 0;
  let prev = KEYS[0][1];
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * 5;
    let k = 0;
    while (k < KEYS.length - 2 && KEYS[k + 1][0] < t) k++;
    const [t0, v0] = KEYS[k];
    const [t1, v1] = KEYS[k + 1];
    const f = (t - t0) / (t1 - t0 || 1);
    const smooth = f * f * (3 - 2 * f);
    const base = v0 + (v1 - v0) * smooth;
    drift = drift * 0.72 + (rnd() - 0.5) * 11;
    const actual = base + drift;
    const predicted = prev + 9 + (rnd() - 0.5) * 7;
    out.push({ t, actual, predicted: i === 0 ? actual + 9 : predicted });
    prev = actual;
  }
  return out;
}

export type Candle = { o: number; h: number; l: number; c: number };

export function candles(points: Point[], count = 34): Candle[] {
  const rnd = mulberry32(2025);
  const tail = points.slice(-(count + 1));
  const out: Candle[] = [];
  for (let i = 1; i < tail.length; i++) {
    const o = tail[i - 1].actual;
    const c = tail[i].actual;
    out.push({ o, c, h: Math.max(o, c) + 1 + rnd() * 7, l: Math.min(o, c) - 1 - rnd() * 7 });
  }
  return out;
}

// ------------------------------------------------------------------ facts from the row

export type Metrics = { rmse: string | null; error: string | null; accuracy: string | null; window: string | null };

export function metrics(p: ProjectRow): Metrics {
  const text = [p.summary, p.description, p.tagline].filter(Boolean).join(' ');
  const rmse = text.match(/RMSE[^0-9]{0,24}(\d+(?:\.\d+)?)/i)?.[1] ?? null;
  const error =
    text.match(/(\d+(?:\.\d+)?)\s*%\s*error/i)?.[1] ?? text.match(/error[^0-9]{0,24}(\d+(?:\.\d+)?)\s*%/i)?.[1] ?? null;
  const w = text.match(/(20\d\d)\s*[-–—]\s*(20\d\d)/);
  const accuracy = error ? (100 - parseFloat(error)).toFixed(2) : null;
  return { rmse, error, accuracy, window: w ? `${w[1]}–${w[2]}` : null };
}

/** Screens for the chart windows: the hero stage, the cover and the card thumbnail, de-duplicated. */
export function screens(p: ProjectRow, doc: ShowcaseDoc): ThemedImage[] {
  const s = doc.hero.stage;
  const list: ThemedImage[] = [
    ...(s ? [s.center, s.left, s.right].filter((x): x is ThemedImage => !!x) : []),
    ...(p.cover ? [{ light: p.cover, alt: `${p.title}: actual vs predicted closing price` }] : []),
    ...(p.thumbnail ? [{ light: p.thumbnail, alt: `${p.title}: project card` }] : []),
  ];
  const seen = new Set<string>();
  return list.filter((img) => {
    const key = img.light.replace(/^\//, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ------------------------------------------------------------------ markdown wire

export type Wire = { id: string; title: string; blurb: string };

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[`*_]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** h2 headings of the case study with the first sentence under each, for the news-wire panel. */
export function wireFromMarkdown(md: string): Wire[] {
  const out: Wire[] = [];
  let fence = false;
  let current: Wire | null = null;
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith('```')) {
      fence = !fence;
      continue;
    }
    if (fence) continue;
    const h = line.match(/^##\s+(.+)$/);
    if (h) {
      current = { id: slugify(h[1]), title: h[1].replace(/[`*_]/g, ''), blurb: '' };
      out.push(current);
      continue;
    }
    if (current && !current.blurb && line && !line.startsWith('#') && !line.startsWith('!')) {
      const clean = line
        .replace(/^[-*\d.)\s]+/, '')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/[`*_]/g, '')
        .trim();
      if (clean) {
        const first = clean.match(/^.*?[.!?](\s|$)/)?.[0] ?? clean;
        current.blurb = first.length > 170 ? `${first.slice(0, 167).trimEnd()}…` : first.trim();
      }
    }
  }
  return out;
}
