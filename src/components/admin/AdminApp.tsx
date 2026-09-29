'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocEditor } from './DocEditor';
import { MediaLibrary } from './MediaLibrary';
import { RowsEditor } from './RowsEditor';
import { LEGACY_HASH, SECTIONS, sectionBySlug } from './sections';
import { ToastProvider } from './Toast';

/** Admin chrome (sidebar, status, warning) around the editor for one section, chosen by URL. */
export function AdminApp({ slug, dbReady, storageReady }: { slug: string; dbReady: boolean; storageReady: boolean }) {
  const router = useRouter();
  const section = sectionBySlug(slug) ?? SECTIONS[0];

  // Links from the old single-page admin (/admin#anime) land on the matching page.
  useEffect(() => {
    const target = LEGACY_HASH[window.location.hash.slice(1)];
    if (target && target !== slug) router.replace(`/admin/${target}`);
  }, [router, slug]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#fff7ea] text-[#1c1633] [font-family:var(--font-ak-body),system-ui,sans-serif]">
        <div className="flex items-center gap-2 border-b-2 border-amber-400 bg-amber-100 px-4 py-2 text-xs font-bold text-amber-900">
          <TriangleAlert size={14} className="shrink-0" />
          No login yet: anyone who finds /admin can edit the site. Add auth in src/lib/admin.ts before sharing the URL, or set ADMIN_DISABLED=true.
        </div>

        <div className="md:flex">
          <aside className="border-b-2 border-[#1c1633]/10 bg-white md:min-h-[calc(100vh-34px)] md:w-64 md:shrink-0 md:border-b-0 md:border-r-2">
            <div className="md:sticky md:top-0">
              <div className="flex items-center justify-between px-5 py-4">
                <Link href="/admin/profile" className="font-extrabold">
                  Admin<span className="text-[#ff4f8b]">.</span>
                </Link>
                <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-bold text-[#1c1633]/60 hover:text-[#1c1633]">
                  View site <ExternalLink size={12} />
                </a>
              </div>
              <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
                {SECTIONS.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/admin/${s.slug}`}
                    aria-current={s.slug === section.slug ? 'page' : undefined}
                    className={cn(
                      'flex shrink-0 items-start gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-bold transition-colors',
                      s.slug === section.slug ? 'bg-[#1c1633] text-white' : 'hover:bg-[#1c1633]/5'
                    )}
                  >
                    <s.icon size={16} className="mt-0.5 shrink-0" />
                    <span>
                      {s.label}
                      <span className={cn('hidden text-[0.68rem] font-medium leading-snug md:block', s.slug === section.slug ? 'text-white/70' : 'text-[#1c1633]/50')}>
                        {s.hint}
                      </span>
                    </span>
                  </Link>
                ))}
              </nav>
              <div className="hidden space-y-1 px-5 pb-6 pt-3 text-xs md:block">
                <p className={dbReady ? 'text-emerald-700' : 'text-red-600'}>● Database {dbReady ? 'connected' : 'not configured'}</p>
                <p className={storageReady ? 'text-emerald-700' : 'text-red-600'}>● Storage {storageReady ? 'connected' : 'not configured'}</p>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1 px-4 pb-24 md:px-8">
            {!dbReady && section.kind !== 'media' ? (
              <p className="mt-8 rounded-lg border-2 border-red-300 bg-red-50 p-4 font-bold">DATABASE_URL is not set, so nothing can be saved.</p>
            ) : section.kind === 'media' ? (
              <div className="pt-6">
                <h1 className="text-xl font-extrabold">{section.label}</h1>
                <p className="mb-6 text-xs text-[#1c1633]/60">{section.hint}</p>
                <MediaLibrary />
              </div>
            ) : section.kind === 'rows' ? (
              <div className="pt-6">
                <RowsEditor key={section.slug} table={section.table} title={section.label} hint={section.hint} titleField={section.titleField} />
              </div>
            ) : (
              <div className="pt-2">
                <DocEditor
                  key={section.slug}
                  docKey={section.docKey}
                  title={section.label}
                  hint={section.hint}
                  groups={section.groups}
                  hidden={section.hidden}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
