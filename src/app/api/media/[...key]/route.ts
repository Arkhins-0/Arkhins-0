import { getObject, hasStorage } from '@/lib/storage';

/** Streams an uploaded file out of the private bucket. Keys are content-addressed, so they cache forever. */
export async function GET(_req: Request, { params }: { params: { key: string[] } }) {
  if (!hasStorage) return new Response('Storage not configured', { status: 404 });
  const key = params.key.join('/');
  try {
    const obj = await getObject(key);
    if (!obj.Body) return new Response('Not found', { status: 404 });
    return new Response(obj.Body.transformToWebStream(), {
      headers: {
        'Content-Type': obj.ContentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
        // Uploaded SVGs are served from this origin; never let one run script.
        'Content-Security-Policy': "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
        'X-Content-Type-Options': 'nosniff',
        ...(obj.ContentLength ? { 'Content-Length': String(obj.ContentLength) } : {}),
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
