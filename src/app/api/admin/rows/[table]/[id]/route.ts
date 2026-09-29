import { NextResponse } from 'next/server';
import { fail, guard, refreshSite } from '@/lib/admin';
import { execute, hasDb } from '@/lib/db';
import { TABLES, fromDb, isTableKey, toDb } from '@/lib/tables';

export const dynamic = 'force-dynamic';

type Ctx = { params: { table: string; id: string } };

export async function PUT(req: Request, { params }: Ctx) {
  const blocked = guard();
  if (blocked) return blocked;
  if (!isTableKey(params.table)) return fail('Unknown table', 404);
  if (!hasDb) return fail('DATABASE_URL is not configured', 503);
  try {
    const spec = TABLES[params.table];
    const body = (await req.json()) as Record<string, unknown>;
    const { cols, marks, values } = toDb(spec, body);
    if (!cols.length) return fail('Nothing to update', 400);
    values.push(params.id);
    const [row] = await execute(
      `update ${spec.name} set ${cols.map((c, i) => `${c} = ${marks[i]}`).join(', ')}
       where id = $${values.length}::uuid returning *`,
      values
    );
    if (!row) return fail('Row not found', 404);
    refreshSite();
    return NextResponse.json({ row: fromDb(spec, row) });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const blocked = guard();
  if (blocked) return blocked;
  if (!isTableKey(params.table)) return fail('Unknown table', 404);
  if (!hasDb) return fail('DATABASE_URL is not configured', 503);
  try {
    await execute(`delete from ${TABLES[params.table].name} where id = $1::uuid`, [params.id]);
    refreshSite();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
