'use client';

/* eslint-disable @next/next/no-img-element -- previews of arbitrary uploaded files */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api, upload } from './api';

export type Asset = { id: string; url: string; storage_key: string; kind: string; bytes: number | null; label: string | null; created_at: string };

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [storage, setStorage] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api<{ assets: Asset[]; storage: boolean }>('/api/admin/assets');
      setAssets(r.assets);
      setStorage(r.storage);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { assets, storage, loading, error, reload };
}

/** Drop zone plus a grid of everything in the bucket. `onPick` turns it into a picker. */
export function MediaLibrary({ onPick }: { onPick?: (url: string) => void }) {
  const { assets, storage, loading, error, reload } = useAssets();
  const [busy, setBusy] = useState(0);
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState('');
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const send = async (files: FileList | File[]) => {
    const list = Array.from(files);
    setBusy(list.length);
    setMsg('');
    const results = await Promise.allSettled(list.map((f) => upload(f)));
    const failed = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
    if (failed.length) setMsg(failed.map((f) => (f.reason as Error).message).join(' · '));
    setBusy(0);
    if (inputRef.current) inputRef.current.value = '';
    reload();
  };

  const remove = async (a: Asset) => {
    if (!confirm(`Delete ${a.label ?? a.storage_key}? Pages using it will show a broken image.`)) return;
    try {
      await api(`/api/admin/assets/${a.id}`, { method: 'DELETE' });
      reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="space-y-5">
      {!storage && (
        <p className="rounded-lg border-2 border-amber-400 bg-amber-50 p-3 text-sm font-bold">
          Object storage is not configured. Set S3_BUCKET and the AWS_* variables in .env.
        </p>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files.length) send(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-[3px] border-dashed p-8 text-center transition-colors',
          drag ? 'border-[#ff4f8b] bg-[#ffd3e2]/40' : 'border-[#1c1633]/20 hover:border-[#ff4f8b]'
        )}
      >
        {busy ? <Loader2 className="animate-spin" /> : <Upload />}
        <p className="font-extrabold">{busy ? `Uploading ${busy} file${busy > 1 ? 's' : ''}…` : 'Drop images here or click to upload'}</p>
        <p className="text-xs text-[#1c1633]/60">PNG, JPG, WebP, GIF, SVG, AVIF, MP4, PDF · up to 15 MB each</p>
        <input ref={inputRef} type="file" multiple className="hidden" accept="image/*,video/mp4,video/webm,application/pdf" onChange={(e) => e.target.files && send(e.target.files)} />
      </div>

      {(msg || error) && <p className="text-sm font-bold text-red-600">{msg || error}</p>}

      {loading ? (
        <p className="flex items-center gap-2 text-sm"><Loader2 size={16} className="animate-spin" /> Loading…</p>
      ) : assets.length === 0 ? (
        <p className="text-sm text-[#1c1633]/60">Nothing uploaded yet. Images under /public still work anywhere a path is asked for.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {assets.map((a) => (
            <li key={a.id} className="group overflow-hidden rounded-xl border-2 border-[#1c1633]/15 bg-white">
              <button
                type="button"
                onClick={() => onPick?.(a.url)}
                className={cn('flex aspect-square w-full items-center justify-center bg-[repeating-conic-gradient(#f1f1f1_0_25%,#fff_0_50%)] bg-[length:14px_14px] p-2', onPick && 'cursor-pointer hover:outline hover:outline-[3px] hover:outline-[#ff4f8b]')}
                disabled={!onPick}
                title={onPick ? 'Use this image' : a.label ?? ''}
              >
                {a.kind === 'image' ? <img src={a.url} alt={a.label ?? ''} loading="lazy" className="max-h-full max-w-full object-contain" /> : <FileText size={32} />}
              </button>
              <div className="flex items-center gap-1 border-t-2 border-[#1c1633]/10 p-2">
                <span className="min-w-0 flex-1 truncate text-xs font-bold" title={a.storage_key}>{a.label ?? a.storage_key}</span>
                <button
                  type="button"
                  aria-label="Copy URL"
                  onClick={async () => {
                    await navigator.clipboard.writeText(a.url).catch(() => {});
                    setCopied(a.id);
                    setTimeout(() => setCopied(''), 1400);
                  }}
                  className="rounded p-1 hover:bg-[#1c1633]/5"
                >
                  {copied === a.id ? <Check size={13} /> : <Copy size={13} />}
                </button>
                {!onPick && (
                  <button type="button" aria-label="Delete" onClick={() => remove(a)} className="rounded p-1 hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
