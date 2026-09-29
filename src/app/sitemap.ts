import type { MetadataRoute } from 'next';
import { listProjectSlugs } from '@/lib/content';
import { getProfile } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ siteUrl }, slugs] = await Promise.all([getProfile(), listProjectSlugs()]);
  const now = new Date();
  return [
    { url: siteUrl, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/projects`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    ...slugs.map((slug) => ({
      url: `${siteUrl}/projects/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
