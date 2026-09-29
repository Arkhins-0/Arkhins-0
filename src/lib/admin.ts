import 'server-only';
import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { DB_TAG } from '@/lib/db';

/*
 * The admin has no login yet (by request). Every admin route goes through `guard`, which is the
 * one place to add auth later: set ADMIN_DISABLED=true to switch the dashboard off entirely.
 */
export function guard(): NextResponse | null {
  if (process.env.ADMIN_DISABLED === 'true') {
    return NextResponse.json({ error: 'Admin is disabled' }, { status: 403 });
  }
  return null;
}

/** Drops every cached page so edits show up on the next request. */
export function refreshSite() {
  revalidateTag(DB_TAG);
  revalidatePath('/', 'layout');
}

export function fail(err: unknown, status = 500) {
  const message = err instanceof Error ? err.message : String(err);
  return NextResponse.json({ error: message }, { status });
}
