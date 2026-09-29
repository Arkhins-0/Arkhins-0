import type { Candle, Point } from './data';

const W = 800;
const H = 320;
const PAD = { l: 46, r: 58, t: 14, b: 26 };
const MIN = 120;
const MAX = 490;

const x = (t: number) => PAD.l + (t / 5) * (W - PAD.l - PAD.r);
const y = (v: number) => PAD.t + (1 - (v - MIN) / (MAX - MIN)) * (H - PAD.t - PAD.b);
const f = (n: number) => n.toFixed(1);

function path(points: Point[], key: 'actual' | 'predicted') {
  return points.map((p, i) => `${i ? 'L' : 'M'}${f(x(p.t))} ${f(y(p[key]))}`).join('');
}

/** Actual (amber) against predicted (cyan), with the gap between them shaded. */
export function LineChart({ points }: { points: Point[] }) {
  const last = points[points.length - 1];
  const band =
    points.map((p, i) => `${i ? 'L' : 'M'}${f(x(p.t))} ${f(y(p.actual))}`).join('') +
    [...points].reverse().map((p) => `L${f(x(p.t))} ${f(y(p.predicted))}`).join('') +
    'Z';
  const ticks = [150, 200, 250, 300, 350, 400, 450];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="msft-svg"
      role="img"
      aria-label="Illustrative line chart: predicted closing price tracks the actual closing price of MSFT from 2020 to 2025, running slightly above it."
    >
      <g className="msft-gridlines">
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} />
            <text x={PAD.l - 8} y={y(v) + 4} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        {[0, 1, 2, 3, 4, 5].map((yr) => (
          <g key={yr}>
            <line x1={x(yr)} x2={x(yr)} y1={PAD.t} y2={H - PAD.b} className="v" />
            <text x={x(yr)} y={H - 8} textAnchor="middle">
              {2020 + yr}
            </text>
          </g>
        ))}
      </g>
      <path d={band} className="msft-band" />
      <path d={path(points, 'actual')} className="msft-line actual" pathLength={1} />
      <path d={path(points, 'predicted')} className="msft-line predicted" pathLength={1} />
      <g className="msft-tag actual">
        <rect x={W - PAD.r + 4} y={y(last.actual) - 9} width={50} height={18} />
        <text x={W - PAD.r + 29} y={y(last.actual) + 4} textAnchor="middle">
          {last.actual.toFixed(1)}
        </text>
      </g>
      <g className="msft-tag predicted">
        <rect x={W - PAD.r + 4} y={y(last.predicted) - 27} width={50} height={18} />
        <text x={W - PAD.r + 29} y={y(last.predicted) - 14} textAnchor="middle">
          {last.predicted.toFixed(1)}
        </text>
      </g>
    </svg>
  );
}

/** Weekly OHLC candles, green up, red down. */
export function Candles({ data }: { data: Candle[] }) {
  const w = 520;
  const h = 220;
  const lo = Math.min(...data.map((d) => d.l)) - 4;
  const hi = Math.max(...data.map((d) => d.h)) + 4;
  const cy = (v: number) => 10 + (1 - (v - lo) / (hi - lo)) * (h - 30);
  const step = (w - 50) / data.length;
  const grid = [0, 1, 2, 3].map((i) => lo + ((hi - lo) * (i + 0.5)) / 4);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="msft-svg" role="img" aria-label="Illustrative weekly candlestick chart of the final months of the series.">
      <g className="msft-gridlines">
        {grid.map((v) => (
          <g key={v}>
            <line x1={4} x2={w - 46} y1={cy(v)} y2={cy(v)} />
            <text x={w - 4} y={cy(v) + 4} textAnchor="end">
              {v.toFixed(0)}
            </text>
          </g>
        ))}
      </g>
      {data.map((d, i) => {
        const up = d.c >= d.o;
        const cx = 8 + i * step + step / 2;
        const top = cy(Math.max(d.o, d.c));
        const bh = Math.max(1.5, Math.abs(cy(d.o) - cy(d.c)));
        return (
          <g key={i} className={up ? 'msft-up' : 'msft-down'}>
            <line x1={cx} x2={cx} y1={cy(d.h)} y2={cy(d.l)} />
            <rect x={cx - step * 0.32} y={top} width={step * 0.64} height={bh} />
          </g>
        );
      })}
    </svg>
  );
}

/** Tiny bar strip used inside KPI tiles. */
export function Spark({ values, tone }: { values: number[]; tone: 'up' | 'down' | 'cyan' }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  return (
    <svg viewBox={`0 0 ${values.length * 6} 24`} className={`msft-spark ${tone}`} aria-hidden="true" preserveAspectRatio="none">
      {values.map((v, i) => {
        const hh = 3 + ((v - min) / (max - min || 1)) * 21;
        return <rect key={i} x={i * 6} y={24 - hh} width={4} height={hh} />;
      })}
    </svg>
  );
}
