'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LEGACY_HASH } from './sections';

export function AdminRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/admin/${LEGACY_HASH[window.location.hash.slice(1)] ?? 'profile'}`);
  }, [router]);
  return null;
}
