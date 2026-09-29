'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** A reprinted article: the markdown file is fetched in the browser and set in newspaper columns. */
export function MarkdownColumns({ file }: { file: string }) {
  const [text, setText] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(file)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((t) => live && setText(t))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [file]);

  if (failed) return <p className="ctr-prose__note">This article could not be fetched from the press.</p>;
  if (text === null) return <p className="ctr-prose__note">Setting type…</p>;
  return (
    <div className="ctr-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}
