import { NextResponse } from 'next/server';
import { fail, guard, refreshSite } from '@/lib/admin';
import { execute, hasDb } from '@/lib/db';
import { SITE_DOCS, isSiteDocKey, readSiteDocFresh } from '@/lib/site';

export const dynamic = 'force-dynamic';

type Ctx = { params: { key: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const blocked = guard();
  if (blocked) return blocked;
  if (!isSiteDocKey(params.key)) return fail('Unknown document', 404);
  if (!hasDb) return fail('DATABASE_URL is not configured', 503);
  // No fallback to the bundled defaults here: saving that copy would overwrite the real document.
  try {
    return NextResponse.json({ data: await readSiteDocFresh(params.key) });
  } catch (err) {
    return fail(err);
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  const blocked = guard();
  if (blocked) return blocked;
  if (!isSiteDocKey(params.key)) return fail('Unknown document', 404);
  if (!hasDb) return fail('DATABASE_URL is not configured', 503);
  try {
    const { data } = await req.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) return fail('Body must be { data: {...} }', 400);
    await execute(
      `insert into site_documents (key, data) values ($1, $2::jsonb)
       on conflict (key) do update set data = excluded.data, updated_at = now()`,
      [params.key, JSON.stringify(data)]
    );
    refreshSite();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}

/** Restores the bundled JSON default for this document. */
export async function DELETE(_req: Request, { params }: Ctx) {
  const blocked = guard();
  if (blocked) return blocked;
  if (!isSiteDocKey(params.key)) return fail('Unknown document', 404);
  if (!hasDb) return fail('DATABASE_URL is not configured', 503);
  try {
    await execute(
      `insert into site_documents (key, data) values ($1, $2::jsonb)
       on conflict (key) do update set data = excluded.data, updated_at = now()`,
      [params.key, JSON.stringify(SITE_DOCS[params.key].fallback)]
    );
    refreshSite();
    return NextResponse.json({ ok: true, data: SITE_DOCS[params.key].fallback });
  } catch (err) {
    return fail(err);
  }
}
