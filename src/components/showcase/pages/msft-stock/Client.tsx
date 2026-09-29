'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ThemedImage } from '@/types/content';
import { slugify } from './data';

/** New York session clock. Renders dashes on the server so hydration never mismatches. */
export function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="msft-clock" aria-label="New York time">
      NY {now ?? '--:--:--'}
    </span>
  );
}

/** A screenshot in a terminal chart window; activating it opens a full-size modal view. */
export function Shot({ image, code, index }: { image: ThemedImage; code: string; index: number }) {
  const ref = useRef<HTMLDialogElement>(null);
  const label = image.caption ?? image.alt;
  return (
    <figure className="msft-window">
      <figcaption className="msft-window-bar">
        <span className="msft-window-id">{index + 1})</span>
        <span className="msft-window-title">{label}</span>
        <span className="msft-window-code">{code} &lt;GO&gt;</span>
      </figcaption>
      <button type="button" className="msft-window-body" onClick={() => ref.current?.showModal()} aria-label={`Enlarge: ${label}`}>
        <img src={image.light} alt={image.alt} loading="lazy" />
        <span className="msft-window-zoom" aria-hidden="true">
          [ZOOM]
        </span>
      </button>
      <dialog ref={ref} className="msft-dialog" aria-label={label} onClick={(e) => e.target === ref.current && ref.current?.close()}>
        <div className="msft-dialog-bar">
          <span>{label}</span>
          <button type="button" onClick={() => ref.current?.close()} className="msft-key">
            ESC CLOSE
          </button>
        </div>
        <img src={image.light} alt={image.alt} />
      </dialog>
    </figure>
  );
}

/** Line numbers of the h2/h3 headings (outside code fences), in order, so each gets md-1, md-2, … */
function headingLines(md: string) {
  const map = new Map<number, number>();
  let fence = false;
  let n = 0;
  md.split(/\r?\n/).forEach((line, i) => {
    if (line.trim().startsWith('```')) fence = !fence;
    else if (!fence && /^#{2,3}\s/.test(line.trim())) map.set(i + 1, ++n);
  });
  return map;
}

const text = (children: ReactNode): string =>
  Array.isArray(children) ? children.map(text).join('') : typeof children === 'string' || typeof children === 'number' ? String(children) : children && typeof children === 'object' && 'props' in children ? text((children as { props: { children?: ReactNode } }).props.children) : '';

/** The case study, fetched client-side and printed as terminal text. */
export function Notes({ file }: { file: string }) {
  const [state, setState] = useState<{ md?: string; error?: boolean }>({});
  useEffect(() => {
    let live = true;
    fetch(file)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((md) => live && setState({ md }))
      .catch(() => live && setState({ error: true }));
    return () => {
      live = false;
    };
  }, [file]);

  const components = useMemo<Components>(() => {
    const lines = headingLines(state.md ?? '');
    const heading =
      (Tag: 'h2' | 'h3') =>
      // eslint-disable-next-line react/display-name
      ({ node, children }: { node?: { position?: { start: { line: number } } }; children?: ReactNode }) => {
        const n = node?.position ? lines.get(node.position.start.line) : undefined;
        return (
          <Tag id={`msft-md-${slugify(text(children))}`} data-tour={n ? `md-${n}` : undefined}>
            <span className="msft-md-prompt" aria-hidden="true">
              {Tag === 'h2' ? '>> ' : '> '}
            </span>
            {children}
          </Tag>
        );
      };
    return {
      h1: ({ children }) => <h3 className="msft-md-h1">{children}</h3>,
      h2: heading('h2'),
      h3: heading('h3'),
      a: ({ href, children }) => {
        const external = !!href && /^https?:/.test(href);
        return (
          <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
            {children}
          </a>
        );
      },
      img: ({ src, alt }) => (
        <span className="msft-md-img">
          <span className="msft-md-img-bar">GP · {alt || 'figure'}</span>
          <img src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} loading="lazy" />
        </span>
      ),
      table: ({ children }) => (
        <div className="msft-md-table">
          <table>{children}</table>
        </div>
      ),
    };
  }, [state.md]);

  if (state.error)
    return (
      <p className="msft-md-status down" role="status">
        ERR 404 · CASE FILE UNAVAILABLE · <a href={file}>open the raw file</a>
      </p>
    );
  if (!state.md)
    return (
      <p className="msft-md-status" role="status">
        LOADING CASE FILE<span className="msft-dots" aria-hidden="true" />
      </p>
    );
  return (
    <div className="msft-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {state.md}
      </ReactMarkdown>
    </div>
  );
}
