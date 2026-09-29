import { NextResponse } from 'next/server';
import { fail, guard } from '@/lib/admin';
import { execute, hasDb } from '@/lib/db';
import { deleteObject } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/** Removes the file from the bucket and its bookkeeping row. Pages still pointing at it will 404. */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const blocked = guard();
  if (blocked) return blocked;
  if (!hasDb) return fail('DATABASE_URL is not configured', 503);
  try {
    const [row] = await execute<{ storage_key: string }>('delete from assets where id = $1::uuid returning storage_key', [params.id]);
    if (!row) return fail('Asset not found', 404);
    await deleteObject(row.storage_key);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
