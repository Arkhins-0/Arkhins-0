'use client';

import { useEffect, useState } from 'react';
import { Braces, ChevronRight, Loader2, RotateCcw, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Json, api, humanize } from './api';
import { CodeEditor, locateJsonError } from './CodeEditor';
import { JsonEditor } from './JsonEditor';
import type { GroupInfo } from './sections';
import { useToast } from './Toast';

/** Edits one site document (theme, interface copy) as a form or as raw JSON. */
export function DocEditor({ docKey, title, hint, groups = {} }: { docKey: string; title: string; hint: string; groups?: Record<string, GroupInfo> }) {
  const [data, setData] = useState<Record<string, Json> | null>(null);
  const [saved, setSaved] = useState('');
  const [raw, setRaw] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    setData(null);
    setRaw(null);
    api<{ data: Record<string, Json> }>(`/api/admin/site/${docKey}`)
      .then((r) => {
        setData(r.data);
        setSaved(JSON.stringify(r.data));
      })
      .catch((e) => setError(e.message));
  }, [docKey]);

  const order = Object.keys(groups);
  const rank = (k: string) => (order.includes(k) ? order.indexOf(k) : order.length);

  const rawProblem = raw !== null ? locateJsonError(raw) : null;
  const rawIsObject = raw !== null && !rawProblem && /^\s*\{/.test(raw);
  const dirty = data !== null && (raw !== null ? (rawProblem ? true : JSON.stringify(JSON.parse(raw)) !== saved) : JSON.stringify(data) !== saved);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = async () => {
    let body = data;
    if (raw !== null) {
      if (rawProblem) return toast(`Fix the JSON first: line ${rawProblem.line}, ${rawProblem.message}`, 'error');
      if (!rawIsObject) return toast('The document must be a JSON object.', 'error');
      body = JSON.parse(raw);
    }
    setBusy(true);
    try {
      await api(`/api/admin/site/${docKey}`, { method: 'PUT', body: JSON.stringify({ data: body }) });
      setData(body);
      setSaved(JSON.stringify(body));
      if (raw !== null) setRaw(JSON.stringify(body, null, 2));
      toast('Saved. The site is updated.');
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!confirm(`Replace “${title}” with the defaults bundled in the code? Your edits here will be lost.`)) return;
    setBusy(true);
    try {
      const r = await api<{ data: Record<string, Json> }>(`/api/admin/site/${docKey}`, { method: 'DELETE' });
      setData(r.data);
      setSaved(JSON.stringify(r.data));
      setRaw(null);
      toast('Restored defaults.');
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const toggleRaw = () => {
    if (raw === null) return setRaw(JSON.stringify(data, null, 2));
    if (rawProblem || !rawIsObject) return;
    setData(JSON.parse(raw));
    setRaw(null);
  };

  if (error) return <p className="mt-8 font-bold text-red-600">{error}</p>;
  if (!data) return <p className="mt-8 flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading…</p>;

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b-2 border-[#1c1633]/10 bg-[#fff7ea]/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="mr-auto">
          <h1 className="text-xl font-extrabold">{title}</h1>
          <p className="text-xs text-[#1c1633]/60">{hint}</p>
        </div>
        <button type="button" className="adm-btn" onClick={toggleRaw} disabled={raw !== null && (!!rawProblem || !rawIsObject)} title={raw !== null && rawProblem ? 'Fix the JSON to go back to the form' : undefined}>
          <Braces size={14} /> {raw === null ? 'Edit as JSON' : 'Back to form'}
        </button>
        <button type="button" className="adm-btn" onClick={reset} disabled={busy}>
          <RotateCcw size={14} /> Defaults
        </button>
        <button type="button" className={cn('adm-btn adm-btn-primary', !dirty && 'opacity-50')} onClick={save} disabled={busy || !dirty}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {dirty ? 'Save changes' : 'Saved'}
        </button>
      </div>

      {raw !== null ? (
        <CodeEditor value={raw} onChange={setRaw} onSave={save} minHeight={560} />
      ) : (
        <div className="space-y-4">
          {Object.entries(data)
            // Configured groups first, in their listed order; anything unlisted after them.
            .sort(([a], [b]) => rank(a) - rank(b))
            .map(([k, v], n) => (
              <details key={k} className="adm-card group" open={n === 0}>
                <summary className="flex cursor-pointer list-none items-start gap-2 px-5 py-4">
                  <ChevronRight size={18} className="mt-0.5 shrink-0 transition-transform group-open:rotate-90" />
                  <span>
                    <span className="block font-extrabold">{groups[k]?.label ?? humanize(k)}</span>
                    {groups[k]?.hint && <span className="block text-xs font-medium text-[#1c1633]/55">{groups[k].hint}</span>}
                  </span>
                </summary>
                <div className="border-t-2 border-[#1c1633]/10 p-5">
                  <JsonEditor name={k} value={v} depth={v && typeof v === 'object' && !Array.isArray(v) ? 0 : 1} onChange={(nv) => setData({ ...data, [k]: nv })} />
                </div>
              </details>
            ))}
        </div>
      )}
    </div>
  );
}
