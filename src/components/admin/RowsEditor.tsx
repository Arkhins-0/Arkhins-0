'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Eye, EyeOff, GripVertical, Loader2, Plus, Save, Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Json, api } from './api';
import { JsonEditor, inputCls } from './JsonEditor';
import { useToast } from './Toast';

type Row = Record<string, Json> & { id: string };

/**
 * List-and-form editor for a table (projects, education). A project's `content` is the whole
 * showcase page document, so it is edited as JSON; `null` gives the generic project page.
 */
export function RowsEditor({ table, title, titleField, hint }: { table: string; title: string; titleField: string; hint: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<Row | null>(null);
  const [contentRaw, setContentRaw] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const toast = useToast();

  const load = useCallback(async (keep?: string) => {
    try {
      const r = await api<{ rows: Row[] }>(`/api/admin/rows/${table}`);
      setRows(r.rows);
      const pick = r.rows.find((x) => x.id === keep) ?? r.rows[0] ?? null;
      setSelected(pick?.id ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [table]);

  useEffect(() => {
    setRows(null);
    load();
  }, [load]);

  useEffect(() => {
    const row = rows?.find((r) => r.id === selected) ?? null;
    setDraft(row ? structuredClone(row) : null);
    setContentRaw(row && 'content' in row ? (row.content === null ? '' : JSON.stringify(row.content, null, 2)) : '');
  }, [selected, rows]);

  const original = rows?.find((r) => r.id === selected);
  const hasContent = draft ? 'content' in draft : false;
  const contentChanged = hasContent && contentRaw !== (original?.content == null ? '' : JSON.stringify(original.content, null, 2));
  const dirty = !!draft && (contentChanged || JSON.stringify({ ...draft, content: null }) !== JSON.stringify({ ...original, content: null }));

  const save = async () => {
    if (!draft) return;
    const body: Record<string, Json> = { ...draft };
    if (hasContent) {
      try {
        body.content = contentRaw.trim() ? JSON.parse(contentRaw) : null;
      } catch (e) {
        toast(`Page JSON error: ${(e as Error).message}`, 'error');
        return;
      }
    }
    delete body.id;
    setBusy(true);
    try {
      await api(`/api/admin/rows/${table}/${draft.id}`, { method: 'PUT', body: JSON.stringify(body) });
      toast('Saved. The site is updated.');
      await load(draft.id);
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
    if (!draft || !confirm(`Delete “${String(draft[titleField])}”? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await api(`/api/admin/rows/${table}/${draft.id}`, { method: 'DELETE' });
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
    if (dirty) {
      toast('Save or discard your changes before reordering.', 'error');
      return;
    }
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

  if (error) return <p className="font-bold text-red-600">{error}</p>;
  if (!rows) return <p className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading…</p>;

  const fields = draft ? Object.fromEntries(Object.entries(draft).filter(([k]) => k !== 'id' && k !== 'content')) : {};

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-xl font-extrabold">{title}</h1>
          <p className="text-xs text-[#1c1633]/60">{hint}</p>
        </div>
        <button type="button" className="adm-btn" onClick={create} disabled={busy}>
          <Plus size={14} /> New
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="h-fit lg:sticky lg:top-4">
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
                <span className="min-w-0 flex-1 truncate">{String(r[titleField] ?? 'Untitled')}</span>
                {r.featured === true && <Star size={13} className="shrink-0 fill-[#ffcc29]" />}
                {r.published === false && <EyeOff size={13} className="shrink-0 text-[#1c1633]/40" />}
              </button>
              <span className="flex flex-col pr-1.5">
                <button
                  type="button"
                  aria-label={`Move ${String(r[titleField])} up`}
                  disabled={i === 0}
                  onClick={() => reorder(i, i - 1)}
                  className="rounded p-0.5 text-[#1c1633]/40 hover:bg-white hover:text-[#1c1633] disabled:invisible"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  aria-label={`Move ${String(r[titleField])} down`}
                  disabled={i === rows.length - 1}
                  onClick={() => reorder(i, i + 1)}
                  className="rounded p-0.5 text-[#1c1633]/40 hover:bg-white hover:text-[#1c1633] disabled:invisible"
                >
                  <ChevronDown size={14} />
                </button>
              </span>
            </li>
          ))}
          {rows.length === 0 && <li className="p-4 text-sm text-[#1c1633]/60">No rows yet.</li>}
        </ul>
        </div>

        {draft && (
          <div className="space-y-5">
            <div className="sticky top-0 z-20 -mx-1 flex flex-wrap items-center gap-2 rounded-xl bg-[#fff7ea]/95 px-1 py-2 backdrop-blur">
              <p className="mr-auto truncate font-extrabold">{String(draft[titleField])}</p>
              {typeof draft.slug === 'string' && (
                <a href={`/projects/${draft.slug}`} target="_blank" rel="noopener noreferrer" className="adm-btn">
                  {draft.published ? <Eye size={14} /> : <EyeOff size={14} />} View <ExternalLink size={12} />
                </a>
              )}
              <button type="button" className="adm-btn hover:!bg-red-50 hover:!text-red-700" onClick={remove} disabled={busy}>
                <Trash2 size={14} /> Delete
              </button>
              <button type="button" className={cn('adm-btn adm-btn-primary', !dirty && 'opacity-50')} onClick={save} disabled={busy}>
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {dirty ? 'Save changes' : 'Saved'}
              </button>
            </div>

            <div className="adm-card p-5">
              <JsonEditor name="row" value={fields} depth={0} onChange={(v) => setDraft({ ...(v as Record<string, Json>), id: draft.id, ...(hasContent ? { content: draft.content } : {}) } as Row)} />
            </div>

            {hasContent && (
              <div className="adm-card p-5">
                <p className="text-sm font-extrabold">Showcase page (JSON)</p>
                <p className="mb-3 mt-1 text-xs text-[#1c1633]/60">
                  The full project page: theme, hero and blocks (see src/types/content.ts). Leave empty for the generic page built from the fields above.
                  Image paths inside can be bucket URLs from the Media tab.
                </p>
                <textarea
                  className={cn(inputCls, 'min-h-[420px] font-mono text-xs leading-relaxed')}
                  spellCheck={false}
                  value={contentRaw}
                  placeholder="null — generic page"
                  onChange={(e) => setContentRaw(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
