import type { ComponentType } from 'react';
import type { ShowcasePageProps } from './types';

type Loader = () => Promise<{ default: ComponentType<ShowcasePageProps> }>;

/** One bespoke page per project, loaded on demand so each design ships in its own chunk. */
const PAGES: Record<string, Loader> = {
  hygieia: () => import('./hygieia/Page'),
  bookisham: () => import('./bookisham/Page'),
  'scholar-track': () => import('./scholar-track/Page'),
  spartan: () => import('./spartan/Page'),
  bidnest: () => import('./bidnest/Page'),
  ctr: () => import('./ctr/Page'),
  'ctr-unified': () => import('./ctr-unified/Page'),
  'msft-stock': () => import('./msft-stock/Page'),
};


/** The project's own page component, or null to fall back to the shared showcase renderer. */
export async function loadShowcasePage(slug: string) {
  const load = PAGES[slug];
  return load ? (await load()).default : null;
}
