import { readFile } from 'fs/promises';
import path from 'path';
import { Barlow_Condensed, JetBrains_Mono } from 'next/font/google';
import type { ShowcasePageProps } from '../types';
import type { Action } from '@/types/content';
import { castSpots, CastSprite } from '../cast';
import { ActionKey, Beside, BlockPanel, CastFigure, Panel, Tape, type CastProps } from './Blocks';
import { Candles, LineChart, Spark } from './Charts';
import { Clock, Shot } from './Client';
import { candles, metrics, screens, series, wireFromMarkdown, type Wire } from './data';
import './msft.css';

const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700', '800'], variable: '--msft-mono', display: 'swap' });
const cond = Barlow_Condensed({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--msft-cond', display: 'swap' });

/** Case-study headings for the news wire, read on the server when the file is local. */
async function loadWire(file: string | undefined): Promise<Wire[]> {
  if (!file || /^https?:/.test(file)) return [];
  try {
    const md = await readFile(path.join(process.cwd(), 'public', file.replace(/^\/+/, '')), 'utf8');
    return wireFromMarkdown(md);
  } catch {
    return [];
  }
}

const PIPELINE = [
  { k: 'INGEST', t: 'Daily MSFT price history', d: 'loaded into a pandas DataFrame' },
  { k: 'CLEAN', t: 'Dates parsed, UTC-aware', d: 'filtered to the 2020–2025 window' },
  { k: 'SCALE', t: 'Normalised + windowed', d: 'sliding look-back sequences' },
  { k: 'LSTM', t: 'Stacked recurrent layers', d: 'Keras / TensorFlow' },
  { k: 'DENSE', t: 'Regression head', d: 'one value: the next close' },
  { k: 'EVAL', t: 'Scored on held-out data', d: 'RMSE, MAE, error %' },
  { k: 'PLOT', t: 'Actual vs predicted', d: 'matplotlib overlay' },
];

export default async function Page({ project, doc, guest }: ShowcasePageProps) {
  const m = metrics(project);
  const pts = series();
  const ohlc = candles(pts);
  const shots = screens(project, doc);
  const hero = doc.hero;
  const mdBlock = doc.sections.find((b) => b.type === 'markdown');
  const mdIndex = doc.sections.findIndex((b) => b.type === 'markdown');
  const outroIndex = doc.sections.findIndex((b) => b.type === 'outro');
  const wire = await loadWire(mdBlock?.type === 'markdown' ? mdBlock.file : undefined);
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const chg = last.actual - prev.actual;

  // The guide's sprite spots, in page order; only spots that actually render get a pose, so any
  // pose without a spot falls through to `rest` and is shown by the EXIT panel.
  const spotNames = [
    'hero',
    'kpi',
    'chart',
    'pipeline',
    'candles',
    'wire',
    ...(shots.length ? ['windows'] : []),
    ...(mdIndex >= 0 ? ['notes'] : []),
    ...(outroIndex >= 0 ? ['exit'] : []),
  ];
  const spots = castSpots(guest, spotNames.length);
  const cast = (name: string): CastProps => ({ src: spots.at(spotNames.indexOf(name)), guest });
  const rest: CastProps[] = spots.rest.map((src) => ({ src, guest }));

  const actions: Action[] = hero.actions?.length
    ? hero.actions
    : project.githubUrl
      ? [{ label: 'View source', href: project.githubUrl, external: true }]
      : [];

  const fkeys = [
    { k: 'F1', l: 'HELP', h: '#msft-hero' },
    { k: 'F2', l: 'KPI', h: '#msft-kpi' },
    { k: 'F3', l: 'CHART', h: '#msft-chart' },
    { k: 'F4', l: 'MODEL', h: '#msft-pipe' },
    { k: 'F5', l: 'NEWS', h: '#msft-wire' },
    ...(shots.length ? [{ k: 'F6', l: 'WINDOWS', h: '#msft-win' }] : []),
    ...(mdIndex >= 0 ? [{ k: 'F7', l: 'NOTES', h: `#msft-sec-${mdIndex}` }] : []),
    { k: 'F8', l: 'EXIT', h: outroIndex >= 0 ? `#msft-sec-${outroIndex}` : '/#work' },
  ];

  const tape = [
    <>
      <b>MSFT US</b> <span className={chg >= 0 ? 'msft-up-t' : 'msft-down-t'}>{chg >= 0 ? '▲' : '▼'} {last.actual.toFixed(2)}</span> <i>illus.</i>
    </>,
    ...(m.rmse ? [<><b>RMSE</b> <span className="msft-cyan-t">{m.rmse}</span></>] : []),
    ...(m.error ? [<><b>ERR%</b> <span className="msft-down-t">▼ {m.error}</span></>] : []),
    ...(m.accuracy ? [<><b>FIT</b> <span className="msft-up-t">▲ {m.accuracy}</span></>] : []),
    ...(m.window ? [<><b>WINDOW</b> {m.window}</>] : []),
    <><b>MODEL</b> <span className="msft-up-t">LSTM ONLINE</span></>,
    ...project.tags.map((t) => <><b>{t.toUpperCase()}</b> <span className="msft-up-t">■</span></>),
    <><b>STATUS</b> {project.status.toUpperCase()}</>,
  ];

  const facts = [
    { label: 'Ticker', value: 'MSFT US Equity' },
    { label: 'Asset class', value: project.category },
    ...(project.year ? [{ label: 'Year', value: project.year }] : []),
    ...(hero.facts ?? []),
  ];

  const kpis = [
    { code: 'RMSE', label: 'Root mean squared error', value: m.rmse ?? '—', unit: 'USD', tone: 'cyan' as const, note: 'avg. miss per close' },
    { code: 'ERR', label: 'Error percentage', value: m.error ?? '—', unit: '%', tone: 'down' as const, note: 'relative to price' },
    { code: 'FIT', label: 'Tracking accuracy', value: m.accuracy ?? '—', unit: '%', tone: 'up' as const, note: '100 − error %' },
    { code: 'WIN', label: 'Evaluation window', value: m.window ?? project.year ?? '—', unit: '', tone: 'cyan' as const, note: 'daily closes, UTC' },
  ];
  const sparkSrc = pts.filter((_, i) => i % 12 === 0).map((p) => p.actual);
  const errSrc = pts.filter((_, i) => i % 12 === 0).map((p) => Math.abs(p.predicted - p.actual));

  return (
    <div className={`pg-msft ${mono.variable} ${cond.variable}`}>
      <a href="#msft-main" className="msft-skip">
        Skip to terminal
      </a>
      <div className="msft-top">
        <a href="/#work" className="msft-back">
          <kbd>◄</kbd> MENU · PORTFOLIO
        </a>
        <span className="msft-brand">
          ARKHINS<span>·</span>TERMINAL
        </span>
        <span className="msft-top-right">
          <span className="msft-live" aria-hidden="true" /> MODEL ONLINE <Clock />
        </span>
      </div>

      <nav className="msft-fkeys" aria-label="Terminal functions">
        <ul>
          {fkeys.map((f) => (
            <li key={f.k}>
              <a href={f.h}>
                <kbd>{f.k}</kbd>
                {f.l}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Tape items={tape} label="Model ticker" />

      <main id="msft-main" className="msft-grid">
        <section id="msft-hero" data-tour="hero" className="msft-panel msft-full msft-hero" aria-labelledby="msft-title">
          <div className="msft-cmd" aria-label="Command: MSFT US Equity GO">
            <span className="msft-cmd-pfx" aria-hidden="true">
              1&gt;
            </span>
            <span className="msft-cmd-typed" aria-hidden="true">
              MSFT US Equity <span className="msft-go-tag">&lt;GO&gt;</span>
            </span>
            <span className="msft-caret" aria-hidden="true" />
          </div>
          <div className="msft-hero-grid">
            <div className="msft-hero-main">
              {hero.eyebrow && <p className="msft-eyebrow">{hero.eyebrow.toUpperCase()} · DESCRIPTION</p>}
              <h1 id="msft-title" className="msft-title">
                {hero.title}
                {hero.accent && <span> {hero.accent}</span>}
              </h1>
              <p className="msft-lede">{hero.lede}</p>
              {project.summary && project.summary !== hero.lede && <p className="msft-para dim">{project.summary}</p>}
              {hero.badges && hero.badges.length > 0 && (
                <ul className="msft-chips" aria-label="Stack">
                  {hero.badges.map((b) => (
                    <li key={b.label} className={b.tone === 'accent' ? 'on' : ''}>
                      {b.label}
                    </li>
                  ))}
                </ul>
              )}
              <div className="msft-actions">
                {actions.map((a, k) => (
                  <ActionKey key={k} action={a} primary={k === 0} />
                ))}
                <ActionKey action={{ label: 'Back to all work', href: '/#work', kind: 'ghost' }} />
              </div>
            </div>
            <aside className="msft-des" aria-label="Security description">
              <div className="msft-quote">
                <span className="msft-quote-label">MODEL TRACKING ACCURACY</span>
                <span className="msft-quote-big">
                  {m.accuracy ?? '—'}
                  <small>%</small>
                </span>
                <span className="msft-up-t">▲ 1 − ERR {m.error ?? '—'}%</span>
              </div>
              <dl className="msft-facts">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd className={/status/i.test(f.label) ? 'msft-up-t' : ''}>{f.value}</dd>
                  </div>
                ))}
              </dl>
            </aside>
            {cast('hero').src && <CastFigure cast={cast('hero')} h={360} className="msft-hero-cast" />}
          </div>
        </section>

        <Panel id="msft-kpi" tour="kpi" code="KPI" title="Model performance" meta="TEST SET · REAL FIGURES" span="full">
          <Beside cast={cast('kpi')} side="left" h={250}>
          <dl className="msft-kpis">
            {kpis.map((k) => (
              <div key={k.code} className={`msft-kpi ${k.tone}`}>
                <dt>
                  <span className="msft-code">{k.code}</span> {k.label}
                </dt>
                <dd>
                  {k.value}
                  {k.unit && <small>{k.unit}</small>}
                </dd>
                <Spark values={k.code === 'RMSE' || k.code === 'ERR' ? errSrc : sparkSrc} tone={k.tone} />
                <span className="msft-kpi-note">{k.note}</span>
              </div>
            ))}
          </dl>
          </Beside>
        </Panel>

        <Panel
          id="msft-chart"
          tour="chart"
          code="GP"
          title="Actual vs predicted close"
          meta={<span className="msft-illus">ILLUSTRATIVE SERIES</span>}
          span="full"
        >
          <Beside cast={cast('chart')} side="left" h={340}>
          <ul className="msft-legend">
            <li className="actual">Actual close</li>
            <li className="predicted">LSTM prediction</li>
            <li className="band">Error band</li>
          </ul>
          <LineChart points={pts} />
          <p className="msft-foot">
            Generated to echo the shape of the notebook&apos;s 2020–2025 plot (see window 1 below for the real output). The model runs a
            little high, but it follows every turn.
          </p>
          </Beside>
        </Panel>

        <Panel id="msft-pipe" tour="pipeline" code="MODL" title="Model pipeline" meta="DATA → PREDICTION" span="full">
          <ol className="msft-pipe">
            {PIPELINE.map((s, k) => (
              <li key={s.k} className={s.k === 'LSTM' ? 'hot' : ''}>
                <span className="msft-pipe-n">{String(k + 1).padStart(2, '0')}</span>
                <b>{s.k}</b>
                <span>{s.t}</span>
                <small>{s.k === 'EVAL' && m.rmse ? `RMSE ${m.rmse} · ${m.error ?? '—'}% error` : s.d}</small>
              </li>
            ))}
          </ol>
          <Beside cast={cast('pipeline')} h={270} wide>
          <pre className="msft-pre" aria-label="Schematic Keras model summary">{`MODEL.SUMMARY()        schematic
───────────────────────────────
Input   look-back × 1 (close)
LSTM    return_sequences=True
LSTM    → hidden state
Dense   → 1   next close (USD)
───────────────────────────────
loss mse   ·   metric rmse`}</pre>
          </Beside>
        </Panel>

        <Panel id="msft-candles" tour="candles" code="OHLC" title="Weekly bars · tail" meta={<span className="msft-illus">ILLUSTRATIVE</span>} span="half">
          <Beside cast={cast('candles')} side="left" h={290}>
          <Candles data={ohlc} />
          <dl className="msft-mini">
            <div>
              <dt>LAST</dt>
              <dd>{last.actual.toFixed(2)}</dd>
            </div>
            <div>
              <dt>CHG</dt>
              <dd className={chg >= 0 ? 'msft-up-t' : 'msft-down-t'}>
                {chg >= 0 ? '+' : ''}
                {chg.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>PRED</dt>
              <dd className="msft-cyan-t">{last.predicted.toFixed(2)}</dd>
            </div>
          </dl>
          </Beside>
        </Panel>

        <Panel id="msft-wire" tour="wire" code="NEWS" title="Case wire" meta={`${wire.length || 3} ITEMS`} span="half">
          <Beside cast={cast('wire')} h={290}>
          <ol className="msft-wire">
            {(wire.length
              ? wire
              : [
                  { id: '', title: project.title, blurb: project.summary },
                  ...(project.description ? [{ id: '', title: 'Approach', blurb: project.description }] : []),
                  { id: '', title: `Status: ${project.status}`, blurb: [project.role, project.date].filter(Boolean).join(' · ') },
                ]
            ).map((w, k) => {
              const time = `${String(9 + Math.floor((30 + k * 17) / 60)).padStart(2, '0')}:${String((30 + k * 17) % 60).padStart(2, '0')}`;
              const body = (
                <>
                  <span className="msft-wire-meta">
                    {time} <span>*ARK</span>
                  </span>
                  <b>{w.title.toUpperCase()}</b>
                  {w.blurb && <span className="msft-wire-blurb">{w.blurb}</span>}
                </>
              );
              return <li key={k}>{w.id ? <a href={`#msft-md-${w.id}`}>{body}</a> : body}</li>;
            })}
          </ol>
          </Beside>
        </Panel>

        {shots.length > 0 && (
          <Panel id="msft-win" tour="windows" code="GRAB" title="Chart windows" meta={`${shots.length} OPEN`} span="full">
            <Beside cast={cast('windows')} h={340}>
            <div className="msft-shots">
              {shots.map((img, k) => (
                <Shot key={img.light} image={img} code={k === 0 ? 'GP' : 'DES'} index={k} />
              ))}
            </div>
            </Beside>
          </Panel>
        )}

        {doc.sections.map((b, i) => (
          <BlockPanel
            key={i}
            block={b}
            i={i}
            cast={i === mdIndex ? cast('notes') : i === outroIndex ? cast('exit') : undefined}
            rest={i === outroIndex ? rest : undefined}
          />
        ))}

        {outroIndex < 0 && rest.length > 0 && (
          <div className="msft-panel msft-full msft-rest msft-rest-solo">
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

        <p className="msft-disclaimer msft-full">
          <b>DISCLAIMER</b> Educational project. Charts marked illustrative are generated for this page. Nothing here is financial
          advice.
        </p>
      </main>
    </div>
  );
}
