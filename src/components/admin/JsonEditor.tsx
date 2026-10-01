'use client';

/* eslint-disable @next/next/no-img-element -- previews of arbitrary uploaded images */
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronRight, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Json, blankLike, humanize, isImageField, upload } from './api';
import { MediaPicker } from './MediaPicker';

export const inputCls =
  'w-full rounded-lg border-2 border-[#1c1633]/15 bg-white px-3 py-2 text-sm text-[#1c1633] outline-none transition-colors placeholder:text-[#1c1633]/35 focus:border-[#ff4f8b]';

type Props = {
  name: string;
  value: Json;
  onChange: (v: Json) => void;
  depth?: number;
  /** Allowed values per field name; those fields render as a dropdown. */
  options?: Record<string, string[]>;
  /** Available skill icon names per field name; those fields get an icon picker with a preview. */
  icons?: Record<string, string[]>;
};

/** Edits any JSON value: text, numbers, switches, image fields with upload, lists and nested groups. */
export function JsonEditor({ name, value, onChange, depth = 0, options, icons }: Props) {
  if (Array.isArray(value)) return <ArrayEditor name={name} value={value} onChange={onChange} depth={depth} />;
  if (value && typeof value === 'object') return <ObjectEditor name={name} value={value} onChange={onChange} depth={depth} options={options} icons={icons} />;
  if (icons?.[name] && (value === null || typeof value === 'string')) {
    return (
      <Field label={humanize(name)}>
        <IconField value={value ?? ''} onChange={onChange} available={icons[name]} />
      </Field>
    );
  }
  return (
    <Field label={humanize(name)}>
      <ScalarEditor name={name} value={value} onChange={onChange} choices={options?.[name]} />
    </Field>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#1c1633]/60">{label}</span>
      {children}
    </label>
  );
}

export function ScalarEditor({ name, value, onChange, choices }: { name: string; value: Json; onChange: (v: Json) => void; choices?: string[] }) {
  if (choices && (value === null || typeof value === 'string')) {
    const current = value ?? '';
    return (
      <select className={inputCls} value={current} onChange={(e) => onChange(e.target.value)}>
        {!choices.includes(current) && <option value={current}>{current ? `${current} (not in the list)` : 'Choose…'}</option>}
        {choices.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    );
  }
  if (typeof value === 'boolean') {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn('relative h-7 w-12 rounded-full border-2 border-[#1c1633] transition-colors', value ? 'bg-[#1fcf9a]' : 'bg-[#1c1633]/10')}
      >
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full border-2 border-[#1c1633] bg-white transition-all', value ? 'left-[22px]' : 'left-0.5')} />
      </button>
    );
  }
  if (typeof value === 'number') {
    return <input type="number" className={inputCls} value={value} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} />;
  }

  const text = typeof value === 'string' ? value : '';
  if (isImageField(name, text)) return <ImageField value={text} onChange={onChange} nullable={value === null} />;

  const long = text.length > 90 || text.includes('\n');
  return (
    <div className="flex gap-2">
      {long ? (
        <textarea className={cn(inputCls, 'min-h-[110px] resize-y leading-relaxed')} value={text} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={inputCls} value={text} placeholder={value === null ? '(empty)' : ''} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

/** Where a bare icon name points (same rule as copy.json → stack.iconPathTemplate); a full path is used as is. */
const iconSrc = (v: string) => (v.includes('/') ? v : `/images/skills/${v}.png`);

/** A skill icon name with a live preview, and the matching icons from /images/skills to click. */
function IconField({ value, onChange, available }: { value: string; onChange: (v: Json) => void; available: string[] }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [value]);
  const q = value.trim().toLowerCase();
  const matches = available.filter((n) => n !== value && (!q || n.includes(q) || q.includes(n)));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-[#1c1633]/15 bg-white p-1.5">
          {value && !broken ? <img src={iconSrc(value)} alt="" onError={() => setBroken(true)} className="max-h-full max-w-full object-contain" /> : <ImagePlus size={18} className="text-[#1c1633]/30" />}
        </div>
        <input className={inputCls} value={value} placeholder="Type to search: react, python…" onChange={(e) => onChange(e.target.value.trim())} />
      </div>
      {value && broken && <p className="text-xs font-bold text-red-600">No icon at {iconSrc(value)}. Pick one below or add the file to public/images/skills.</p>}
      {matches.length > 0 && (
        <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
          {matches.map((n) => (
            <button key={n} type="button" onClick={() => onChange(n)} className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#1c1633]/10 bg-white px-2 py-1 text-xs font-bold hover:border-[#ff4f8b]">
              <img src={iconSrc(n)} alt="" className="h-4 w-4 object-contain" /> {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Path or URL, a preview, and buttons to upload a new file or pick one from the library. */
export function ImageField({ value, onChange, nullable }: { value: string; onChange: (v: Json) => void; nullable?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [picking, setPicking] = useState(false);
  const [broken, setBroken] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // A new path gets a fresh chance to load.
  useEffect(() => setBroken(false), [value]);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    setError('');
    try {
      onChange(await upload(f));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-[#1c1633]/15 bg-[repeating-conic-gradient(#f1f1f1_0_25%,#fff_0_50%)] bg-[length:12px_12px]">
        {value && !broken ? (
          <img src={value} alt="" onError={() => setBroken(true)} className="max-h-full max-w-full object-contain" />
        ) : (
          <ImagePlus size={20} className="text-[#1c1633]/30" />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <input className={inputCls} value={value} placeholder={nullable ? '(empty)' : '/images/… or upload'} onChange={(e) => onChange(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="adm-btn">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />} Upload
          </button>
          <button type="button" onClick={() => setPicking(true)} className="adm-btn">
            Library
          </button>
          {value && (
            <button type="button" onClick={() => onChange(nullable ? null : '')} className="adm-btn">
              <X size={14} /> Clear
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
        {error && <p className="text-xs font-bold text-red-600">{error}</p>}
      </div>
      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onPick={(url) => {
            onChange(url);
            setPicking(false);
          }}
        />
      )}
    </div>
  );
}

function ObjectEditor({ name, value, onChange, depth, options, icons }: Omit<Props, 'value'> & { value: { [k: string]: Json } }) {
  const entries = Object.entries(value);
  const body = (
    <div className={cn('grid gap-4', entries.every(([, v]) => v === null || typeof v !== 'object') && entries.length > 1 && 'md:grid-cols-2')}>
      {entries.map(([k, v]) => (
        <div key={k} className={cn((v !== null && typeof v === 'object') || (typeof v === 'string' && (v.length > 90 || isImageField(k, v))) ? 'md:col-span-2' : '')}>
          <JsonEditor name={k} value={v} depth={depth! + 1} options={options} icons={icons} onChange={(nv) => onChange({ ...value, [k]: nv })} />
        </div>
      ))}
    </div>
  );

  if (depth === 0) return body;
  return (
    <details open={depth! < 2} className="group rounded-xl border-2 border-[#1c1633]/10 bg-[#1c1633]/[0.015]">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-sm font-extrabold">
        <ChevronRight size={16} className="transition-transform group-open:rotate-90" />
        {humanize(name)}
        {summaryOf(value) && <span className="truncate font-medium text-[#1c1633]/50">{summaryOf(value)}</span>}
        {typeof value.id === 'string' && value.id.includes('placeholder') && (
          <span className="ml-auto shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-bold text-amber-800">
            Template · not shown on site
          </span>
        )}
      </summary>
      <div className="border-t-2 border-[#1c1633]/10 p-4">{body}</div>
    </details>
  );
}

/** A short label for a collapsed group: its name/title/label field if it has one. */
function summaryOf(v: { [k: string]: Json }) {
  for (const k of ['name', 'title', 'label', 'company', 'institution', 'id']) {
    if (typeof v[k] === 'string' && v[k]) return v[k] as string;
  }
  return '';
}

function ArrayEditor({ name, value, onChange, depth }: Omit<Props, 'value'> & { value: Json[] }) {
  // Lists of image paths get one image field per item; other string lists edit as chips.
  const scalarStrings = value.every((v) => typeof v === 'string') && !isImageField(name, '');
  const move = (i: number, d: number) => {
    const next = [...value];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    onChange(next);
  };
  const add = () => onChange([...value, value.length ? blankLike(value[value.length - 1]) : '']);

  if (scalarStrings) {
    return <TagList label={humanize(name)} value={value as string[]} onChange={onChange} />;
  }

  return (
    <details open={depth! < 2} className="group rounded-xl border-2 border-[#1c1633]/10">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-sm font-extrabold">
        <ChevronRight size={16} className="transition-transform group-open:rotate-90" />
        {humanize(name)}
        <span className="rounded-full bg-[#1c1633]/10 px-2 text-xs">{value.length}</span>
      </summary>
      <div className="space-y-3 border-t-2 border-[#1c1633]/10 p-4">
        {value.map((item, i) => (
          <div key={i} className="flex items-start gap-2 rounded-xl border-2 border-[#1c1633]/10 bg-white p-3">
            <div className="min-w-0 flex-1">
              <JsonEditor name={item && typeof item === 'object' ? String(i) : name} value={item} depth={depth! + 1} onChange={(nv) => onChange(value.map((x, j) => (j === i ? nv : x)))} />
            </div>
            {/* Controls sit in a row beside the item, so they never overflow a collapsed one. */}
            <div className="flex shrink-0 items-center gap-1 pt-2">
              <IconBtn label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp size={13} />
              </IconBtn>
              <IconBtn label="Move down" disabled={i === value.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown size={13} />
              </IconBtn>
              <IconBtn label="Remove" danger onClick={() => onChange(value.filter((_, j) => j !== i))}>
                <Trash2 size={13} />
              </IconBtn>
            </div>
          </div>
        ))}
        <button type="button" onClick={add} className="adm-btn">
          <Plus size={14} /> Add {humanize(name).replace(/s$/, '').toLowerCase()}
        </button>
      </div>
    </details>
  );
}

/** A list of short strings edited as removable chips plus an input. */
function TagList({ label, value, onChange }: { label: string; value: string[]; onChange: (v: Json) => void }) {
  const [draft, setDraft] = useState('');
  const long = value.some((v) => v.length > 40);
  const commit = () => {
    const t = draft.trim();
    if (t) onChange([...value, t]);
    setDraft('');
  };

  if (long) {
    return (
      <Field label={`${label} (one per line)`}>
        <textarea
          className={cn(inputCls, 'min-h-[110px] resize-y leading-relaxed')}
          value={value.join('\n')}
          onChange={(e) => onChange(e.target.value.split('\n'))}
          onBlur={(e) => onChange(e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
        />
      </Field>
    );
  }

  return (
    <Field label={label}>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border-2 border-[#1c1633]/15 bg-white p-2">
        {value.map((t, i) => (
          <span key={`${t}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-[#ffd3e2] px-2.5 py-0.5 text-xs font-bold">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((_, j) => j !== i))} className="opacity-60 hover:opacity-100">
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          className="min-w-[8rem] flex-1 bg-transparent px-1 text-sm outline-none"
          value={draft}
          placeholder="Add, then Enter"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              commit();
            } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={commit}
        />
      </div>
    </Field>
  );
}

function IconBtn({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn('flex h-7 w-7 items-center justify-center rounded-md border border-[#1c1633]/15 bg-white disabled:opacity-30', danger ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-[#1c1633]/5')}
    >
      {children}
    </button>
  );
}
