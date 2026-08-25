'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import content from '@/data/content.json';
import { fill } from '@/lib/utils';

const COPY = content.work.reader;

export type NotesTarget = {
  id: string;
  title: string;
  markdownFile?: string;
  category?: string;
  date?: string;
} | null;

type Status = 'loading' | 'ready' | 'error';

/** Markdown files reference their images relatively; make them root-absolute. */
function absolute(src: string) {
  if (!src) return src;
  if (/^(https?:)?\/\//.test(src) || src.startsWith('/')) return src;
  return `/${src.replace(/^\.\//, '')}`;
}

/**
 * Slide-over reader for a project's long-form write-up. The file is fetched on
 * open rather than bundled, so the notes cost nothing until someone asks.
 */
export function CaseNotes({
  project,
  onClose,
}: {
  project: NotesTarget;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<Status>('loading');
  const [markdown, setMarkdown] = useState('');

  const file = project?.markdownFile;

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setStatus('loading');
    setMarkdown('');

    fetch(file)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((text) => {
        if (cancelled) return;
        setMarkdown(text);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  // Escape closes; the page underneath must not scroll while this is open.
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="notes"
          className="fixed inset-0 z-[95]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={fill(COPY.aria, { title: project.title })}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="notch-tl glass-fill-solid absolute inset-y-0 right-0 flex w-[min(46rem,100vw)] flex-col border-l border-accent/25"
            style={{ ['--notch' as string]: '28px' }}
          >
            {/* header */}
            <header className="flex items-start gap-4 border-b border-white/8 px-6 py-5 md:px-9">
              <div className="min-w-0 flex-1">
                <p className="eyebrow">{COPY.eyebrow}</p>
                <h3 className="mt-2 font-display text-xl font-bold leading-tight md:text-2xl">
                  {project.title}
                </h3>
                {(project.category || project.date) && (
                  <p className="hud mt-1.5 text-ink-faint">
                    {[project.category, project.date]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label={COPY.close}
                className="grid h-9 w-9 shrink-0 place-items-center border border-white/15 text-ink transition-colors hover:border-accent hover:text-accent"
              >
                <X size={16} />
              </button>
            </header>

            {/* body */}
            <div className="markdown-content flex-1 overflow-y-auto px-6 py-7 md:px-9">
              {status === 'loading' && (
                <p className="hud animate-pulse text-ink-faint">
                  {COPY.loading}
                </p>
              )}

              {status === 'error' && (
                <p className="hud text-rose">{COPY.error}</p>
              )}

              {status === 'ready' && (
                <article className="prose-neon max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      img: ({ src, alt }) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={absolute(String(src ?? ''))}
                          alt={alt ?? ''}
                          loading="lazy"
                        />
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                      table: ({ children }) => (
                        <div className="rail-scroll">
                          <table>{children}</table>
                        </div>
                      ),
                    }}
                  >
                    {markdown}
                  </ReactMarkdown>
                </article>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
