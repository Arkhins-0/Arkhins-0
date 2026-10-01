import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { fail, guard } from '@/lib/admin';

export const dynamic = 'force-dynamic';

/** Names of the skill icons in public/images/skills ("nextjs" for nextjs.png), for the admin icon picker. */
export async function GET() {
  const blocked = guard();
  if (blocked) return blocked;
  try {
    const files = await readdir(path.join(process.cwd(), 'public/images/skills'));
    const icons = files.filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4)).sort();
    return NextResponse.json({ icons });
  } catch (err) {
    return fail(err);
  }
}
