import { NextResponse } from 'next/server';
import { fail, guard, refreshSite } from '@/lib/admin';
import { execute, hasDb } from '@/lib/db';
import { TABLES, fromDb, isTableKey, toDb } from '@/lib/tables';

export const dynamic = 'force-dynamic';

type Ctx = { params: { table: string } };

/** Every row, published or not, in display order. */
export async function GET(_req: Request, { params }: Ctx) {
  const blocked = guard();
  if (blocked) return blocked;
  if (!isTableKey(params.table)) return fail('Unknown table', 404);
  if (!hasDb) return fail('DATABASE_URL is not configured', 503);
  try {
    const spec = TABLES[params.table];
    const rows = await execute(`select * from ${spec.name} order by sort_order, created_at`);
    return NextResponse.json({ rows: rows.map((r) => fromDb(spec, r)) });
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req: Request, { params }: Ctx) {
  const blocked = guard();
  if (blocked) return blocked;
  if (!isTableKey(params.table)) return fail('Unknown table', 404);
  if (!hasDb) return fail('DATABASE_URL is not configured', 503);
  try {
    const spec = TABLES[params.table];
    const body = (await req.json()) as Record<string, unknown>;
    const { cols, marks, values } = toDb(spec, { ...spec.blank, ...body });
    const [row] = await execute(
      `insert into ${spec.name} (${cols.join(', ')}) values (${marks.join(', ')}) returning *`,
      values
    );
    refreshSite();
    return NextResponse.json({ row: fromDb(spec, row) });
  } catch (err) {
    return fail(err);
  }
}
