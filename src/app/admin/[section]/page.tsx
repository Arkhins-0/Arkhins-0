import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminApp } from '@/components/admin/AdminApp';
import { sectionBySlug } from '@/components/admin/sections';
import { hasDb } from '@/lib/db';
import { hasStorage } from '@/lib/storage';
import '@/styles/admin.css';

export const dynamic = 'force-dynamic';

export function generateMetadata({ params }: { params: { section: string } }): Metadata {
  const s = sectionBySlug(params.section);
  return { title: s ? `${s.label} · Admin` : 'Admin', robots: { index: false, follow: false } };
}

export default function AdminSectionPage({ params }: { params: { section: string } }) {
  if (process.env.ADMIN_DISABLED === 'true' || !sectionBySlug(params.section)) notFound();
  return <AdminApp slug={params.section} dbReady={hasDb} storageReady={hasStorage} />;
}
