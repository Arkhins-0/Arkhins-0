import { NextResponse } from 'next/server';
import { fail, guard, refreshSite } from '@/lib/admin';
import { execute, hasDb } from '@/lib/db';
import { TABLES, isTableKey } from '@/lib/tables';

export const dynamic = 'force-dynamic';

/** Body { ids: [...] } in the new display order; rewrites sort_order as 10, 20, 30 … in one statement. */
export async function POST(req: Request, { params }: { params: { table: string } }) {
  const blocked = guard();
  if (blocked) return blocked;
  if (!isTableKey(params.table)) return fail('Unknown table', 404);
  if (!hasDb) return fail('DATABASE_URL is not configured', 503);
  try {
    const { ids } = (await req.json()) as { ids?: unknown };
    if (!Array.isArray(ids) || !ids.length || !ids.every((x) => typeof x === 'string')) {
      return fail('Body must be { ids: string[] }', 400);
    }
    await execute(
      `update ${TABLES[params.table].name} t set sort_order = o.pos * 10
       from unnest($1::uuid[]) with ordinality as o(id, pos)
       where t.id = o.id`,
      [ids]
    );
    refreshSite();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
