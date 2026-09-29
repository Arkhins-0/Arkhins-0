'use client';

import { useCallback, useEffect, useState } from 'react';
import { Braces, ChevronDown, ChevronUp, ExternalLink, Eye, EyeOff, GripVertical, Loader2, Plus, Save, Star, Trash2 } from 'lucide-react';
import type { TableKey, TableSpec } from '@/lib/tables';
import { cn } from '@/lib/utils';
import { type Json, api } from './api';
import { CodeEditor, locateJsonError } from './CodeEditor';
import { JsonEditor } from './JsonEditor';
import { useToast } from './Toast';
import { validateShowcase } from './validate';

type Row = Record<string, Json> & { id: string };

const pretty = (v: Json | undefined) => (v == null ? '' : JSON.stringify(v, null, 2));

/**
 * List-and-form editor for one table. Plain fields are a form; JSON fields (a project's `content`,
 * the whole showcase page) get a code editor; the whole row can also be edited as one JSON object.
 * A singleton table (the profile) skips the list and always edits its one row.
 */
export function RowsEditor({ table, spec }: { table: TableKey; spec: TableSpec }) {
  const jsonFields = spec.json ?? [];
  const formFields = spec.fields.filter((f) => !jsonFields.includes(f));
  const [rows, setRows] = useState<Row[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, Json> | null>(null);
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [rowRaw, setRowRaw] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const toast = useToast();

  const load = useCallback(
    async (keep?: string) => {
      try {
        let r = await api<{ rows: Row[] }>(`/api/admin/rows/${table}`);
        if (spec.singleton && r.rows.length === 0) {
          await api(`/api/admin/rows/${table}`, { method: 'POST', body: '{}' });
          r = await api<{ rows: Row[] }>(`/api/admin/rows/${table}`);
        }
        setRows(r.rows);
        const pick = r.rows.find((x) => x.id === keep) ?? r.rows[0] ?? null;
        setSelected(pick?.id ?? null);
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [table, spec.singleton]
  );

  useEffect(() => {
    setRows(null);
    load();
  }, [load]);

  const original = rows?.find((r) => r.id === selected) ?? null;

  useEffect(() => {
    setDraft(original ? Object.fromEntries(formFields.map((f) => [f, original[f] ?? null])) : null);
    setDocs(original ? Object.fromEntries(jsonFields.map((f) => [f, pretty(original[f])])) : {});
    setRowRaw(null);
    // formFields / jsonFields are derived from the stable spec
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [original]);

  const rawProblem = rowRaw !== null ? locateJsonError(rowRaw) : null;
  const docProblems = jsonFields.map((f) => (docs[f]?.trim() ? locateJsonError(docs[f]) : null));
  const invalid = !!rawProblem || docProblems.some(Boolean);

  const dirty =
    !!draft &&
    !!original &&
    (rowRaw !== null
      ? true
      : formFields.some((f) => JSON.stringify(draft[f] ?? null) !== JSON.stringify(original[f] ?? null)) ||
        jsonFields.some((f) => docs[f] !== pretty(original[f])));

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  /** The row as one object: form fields plus parsed JSON fields. Throws on bad JSON. */
  const assemble = (): Record<string, Json> => {
    if (rowRaw !== null) {
      if (rawProblem) throw new Error(`line ${rawProblem.line}, column ${rawProblem.col}: ${rawProblem.message}`);
      const parsed = JSON.parse(rowRaw) as Record<string, Json>;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('the row must be a JSON object');
      delete parsed.id;
      return parsed;
    }
    const body: Record<string, Json> = { ...draft };
    jsonFields.forEach((f, i) => {
      const p = docProblems[i];
      if (p) throw new Error(`${f}: line ${p.line}, column ${p.col}: ${p.message}`);
      body[f] = docs[f]?.trim() ? (JSON.parse(docs[f]) as Json) : null;
    });
    return body;
  };

  const save = async () => {
    if (!original) return;
    let body: Record<string, Json>;
    try {
      body = assemble();
    } catch (e) {
      return toast(`Fix the JSON first: ${(e as Error).message}`, 'error');
    }
    setBusy(true);
    try {
      await api(`/api/admin/rows/${table}/${original.id}`, { method: 'PUT', body: JSON.stringify(body) });
      toast('Saved. The site is updated.');
      await load(original.id);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const create = async () => {
    setBusy(true);
    try {
      const extra = table === 'projects' ? { slug: `new-project-${Date.now().toString(36)}` } : {};
      const r = await api<{ row: Row }>(`/api/admin/rows/${table}`, { method: 'POST', body: JSON.stringify(extra) });
      toast('Created. Fill it in and save.');
      await load(r.row.id);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!original || !confirm(`Delete this ${spec.singular} (“${String(original[spec.titleField])}”)? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await api(`/api/admin/rows/${table}/${original.id}`, { method: 'DELETE' });
      toast('Deleted.');
      await load();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  /** Moves a row in the list and saves the whole order at once (sort order 10, 20, 30 …). */
  const reorder = async (from: number, to: number) => {
    if (!rows || from === to || to < 0 || to >= rows.length) return;
    if (dirty) return toast('Save or discard your changes before reordering.', 'error');
    const next = [...rows];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const previous = rows;
    setRows(next.map((r, i) => ({ ...r, sortOrder: (i + 1) * 10 })));
    try {
      await api(`/api/admin/rows/${table}/reorder`, { method: 'POST', body: JSON.stringify({ ids: next.map((r) => r.id) }) });
      toast('Order saved. The site is updated.');
    } catch (e) {
      setRows(previous);
      toast((e as Error).message, 'error');
    }
  };

  const toggleRowJson = () => {
    if (rowRaw === null) {
      try {
        setRowRaw(JSON.stringify(assemble(), null, 2));
      } catch (e) {
        toast(`Fix the JSON first: ${(e as Error).message}`, 'error');
      }
      return;
    }
    if (rawProblem) return;
    const parsed = JSON.parse(rowRaw) as Record<string, Json>;
    setDraft(Object.fromEntries(formFields.map((f) => [f, parsed[f] ?? null])));
    setDocs(Object.fromEntries(jsonFields.map((f) => [f, pretty(parsed[f])])));
    setRowRaw(null);
  };

  if (error) return <p className="mt-8 font-bold text-red-600">{error}</p>;
  if (!rows) return <p className="mt-8 flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading…</p>;

  const list = !spec.singleton;

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-4 mb-6 flex flex-wrap items-center gap-2 border-b-2 border-[#1c1633]/10 bg-[#fff7ea]/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="mr-auto">
          <h1 className="text-xl font-extrabold">{spec.label}</h1>
          <p className="text-xs text-[#1c1633]/60">{spec.hint}</p>
        </div>
        {original && typeof original.slug === 'string' && (
          <a href={`/projects/${original.slug}`} target="_blank" rel="noopener noreferrer" className="adm-btn">
            {original.published === false ? <EyeOff size={14} /> : <Eye size={14} />} View <ExternalLink size={12} />
          </a>
        )}
        {original && (
          <button type="button" className="adm-btn" onClick={toggleRowJson} disabled={rowRaw !== null && !!rawProblem}>
            <Braces size={14} /> {rowRaw === null ? 'Edit as JSON' : 'Back to form'}
          </button>
        )}
        {list && (
          <button type="button" className="adm-btn" onClick={create} disabled={busy}>
            <Plus size={14} /> New {spec.singular}
          </button>
        )}
        {list && original && (
          <button type="button" className="adm-btn hover:!bg-red-50 hover:!text-red-700" onClick={remove} disabled={busy}>
            <Trash2 size={14} /> Delete
          </button>
        )}
        <button type="button" className={cn('adm-btn adm-btn-primary', (!dirty || invalid) && 'opacity-50')} onClick={save} disabled={busy || !dirty || invalid} title={invalid ? 'Fix the JSON to save' : undefined}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {dirty ? 'Save changes' : 'Saved'}
        </button>
      </div>

      <div className={cn('grid gap-6', list && 'lg:grid-cols-[260px_1fr]')}>
        {list && (
          <div className="h-fit lg:sticky lg:top-20">
            <p className="mb-2 px-1 text-[0.7rem] font-bold text-[#1c1633]/50">Drag rows or use the arrows to reorder. The site shows them in this order.</p>
            <ul className="adm-card divide-y-2 divide-[#1c1633]/10 overflow-hidden">
              {rows.map((r, i) => (
                <li
                  key={r.id}
                  draggable
                  onDragStart={(e) => {
                    setDragFrom(i);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(i);
                  }}
                  onDragLeave={() => setDragOver((o) => (o === i ? null : o))}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragFrom !== null) reorder(dragFrom, i);
                    setDragFrom(null);
                    setDragOver(null);
                  }}
                  onDragEnd={() => {
                    setDragFrom(null);
                    setDragOver(null);
                  }}
                  className={cn(
                    'group flex items-center transition-colors',
                    r.id === selected ? 'bg-[#ffd3e2]' : 'hover:bg-[#1c1633]/5',
                    dragFrom === i && 'opacity-40',
                    dragOver === i && dragFrom !== null && dragFrom !== i && (dragFrom < i ? 'shadow-[inset_0_-3px_0_#ff4f8b]' : 'shadow-[inset_0_3px_0_#ff4f8b]')
                  )}
                >
                  <span className="flex cursor-grab items-center self-stretch pl-2 text-[#1c1633]/30 active:cursor-grabbing" aria-hidden="true">
                    <GripVertical size={14} />
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (dirty && !confirm('Discard unsaved changes?')) return;
                      setSelected(r.id);
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 py-3 pl-1.5 pr-1 text-left text-sm font-bold"
                  >
                    <span className="w-5 shrink-0 text-[0.65rem] tabular-nums text-[#1c1633]/40">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate">{String(r[spec.titleField] ?? 'Untitled')}</span>
                    {r.featured === true && <Star size={13} className="shrink-0 fill-[#ffcc29]" />}
                    {r.published === false && <EyeOff size={13} className="shrink-0 text-[#1c1633]/40" />}
                  </button>
                  <span className="flex flex-col pr-1.5">
                    <button type="button" aria-label={`Move ${String(r[spec.titleField])} up`} disabled={i === 0} onClick={() => reorder(i, i - 1)} className="rounded p-0.5 text-[#1c1633]/40 hover:bg-white hover:text-[#1c1633] disabled:invisible">
                      <ChevronUp size={14} />
                    </button>
                    <button type="button" aria-label={`Move ${String(r[spec.titleField])} down`} disabled={i === rows.length - 1} onClick={() => reorder(i, i + 1)} className="rounded p-0.5 text-[#1c1633]/40 hover:bg-white hover:text-[#1c1633] disabled:invisible">
                      <ChevronDown size={14} />
                    </button>
                  </span>
                </li>
              ))}
              {rows.length === 0 && <li className="p-4 text-sm text-[#1c1633]/60">Nothing yet. Add the first {spec.singular} above.</li>}
            </ul>
          </div>
        )}

        {draft && original && (
          <div className="min-w-0 space-y-5">
            {rowRaw !== null ? (
              <CodeEditor value={rowRaw} onChange={setRowRaw} onSave={save} minHeight={520} />
            ) : (
              <>
                <div className="adm-card p-5">
                  <JsonEditor name="row" value={draft} depth={0} onChange={(v) => setDraft(v as Record<string, Json>)} />
                </div>
                {jsonFields.map((f) => (
                  <div key={f} className="adm-card p-5">
                    <p className="text-sm font-extrabold">{f === 'content' ? 'Showcase page' : f}</p>
                    {f === 'content' && (
                      <p className="mb-3 mt-1 text-xs text-[#1c1633]/60">
                        The full project page: theme, hero and blocks (see src/types/content.ts). Leave it empty for the generic page built from the fields above.
                        Image paths inside can be bucket URLs from the Media tab.
                      </p>
                    )}
                    <CodeEditor
                      value={docs[f] ?? ''}
                      onChange={(v) => setDocs((d) => ({ ...d, [f]: v }))}
                      onSave={save}
                      allowEmpty
                      placeholder="Empty: the generic page"
                      validate={f === 'content' ? validateShowcase : undefined}
                      minHeight={420}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
