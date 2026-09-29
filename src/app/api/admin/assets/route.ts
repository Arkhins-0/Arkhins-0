import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { fail, guard } from '@/lib/admin';
import { execute, hasDb } from '@/lib/db';
import { hasStorage, putObject } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED = /^(image\/(png|jpe?g|webp|gif|svg\+xml|avif)|video\/(mp4|webm)|application\/pdf|text\/markdown)$/;

type AssetRow = { id: string; url: string; storage_key: string; kind: string; bytes: number | null; label: string | null; created_at: string };

export async function GET() {
  const blocked = guard();
  if (blocked) return blocked;
  if (!hasDb) return NextResponse.json({ assets: [], storage: hasStorage });
  try {
    const rows = await execute<AssetRow>('select * from assets order by created_at desc limit 500');
    return NextResponse.json({ assets: rows, storage: hasStorage });
  } catch (err) {
    return fail(err);
  }
}

/** multipart/form-data with `file` (and optional `folder`, `label`); returns the servable URL. */
export async function POST(req: Request) {
  const blocked = guard();
  if (blocked) return blocked;
  if (!hasStorage) return fail('Object storage is not configured', 503);
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return fail('No file', 400);
    if (file.size > MAX_BYTES) return fail('File is larger than 15 MB', 413);
    const type = file.type || 'application/octet-stream';
    if (!ALLOWED.test(type)) return fail(`Type ${type} is not allowed`, 415);

    const bytes = new Uint8Array(await file.arrayBuffer());
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    const folder = String(form.get('folder') || 'uploads').replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'uploads';
    const base = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 48) || 'file';
    const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? type.split('/')[1] ?? 'bin').toLowerCase();
    const key = `${folder}/${base}-${hash}.${ext}`;

    const url = await putObject(key, bytes, type);
    if (hasDb) {
      await execute(
        `insert into assets (storage_key, url, kind, bytes, label) values ($1, $2, $3, $4, $5)
         on conflict (storage_key) do nothing`,
        [key, url, type.split('/')[0], file.size, String(form.get('label') || file.name)]
      );
    }
    return NextResponse.json({ url, key });
  } catch (err) {
    return fail(err);
  }
}
