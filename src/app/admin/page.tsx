import type { Metadata } from 'next';
import { AdminRedirect } from '@/components/admin/AdminRedirect';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

/** /admin opens the first section; old /admin#tab links go to their page (a hash never reaches the server). */
export default function AdminIndex() {
  return <AdminRedirect />;
}
