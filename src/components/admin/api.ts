/** Thin fetch wrapper for the /api/admin routes; throws with the server's error message. */
export async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body instanceof FormData ? init?.headers : { 'Content-Type': 'application/json', ...init?.headers },
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `${res.status} ${res.statusText}`);
  return json as T;
}

export async function upload(file: File, folder = 'uploads'): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', folder);
  const { url } = await api<{ url: string }>('/api/admin/assets', { method: 'POST', body: fd });
  return url;
}

export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

/** An empty value with the same shape, used when adding an item to a list. */
export function blankLike(v: Json): Json {
  if (typeof v === 'string') return '';
  if (typeof v === 'number') return 0;
  if (typeof v === 'boolean') return false;
  if (Array.isArray(v)) return [];
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blankLike(x)]));
  return null;
}

const IMAGE_KEY = /(image|img|logo|badge|thumbnail|cover|portrait|picture|emblem|backdrop|watermark|ogimage|^src$|^light$|^dark$|^icon$)/i;
const IMAGE_VALUE = /(\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$)|^\/api\/media\//i;

export const isImageField = (key: string, value: string) =>
  IMAGE_KEY.test(key) && (value === '' || IMAGE_VALUE.test(value));

/** "sortOrder" -> "Sort order", "githubUrl" -> "Github url". */
export const humanize = (key: string) =>
  /^\d+$/.test(key)
    ? `#${Number(key) + 1}`
    : key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/^./, (c) => c.toUpperCase());
