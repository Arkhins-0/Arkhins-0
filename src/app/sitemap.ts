import type { MetadataRoute } from 'next';
import portfolioData from '@/data/portfolio.json';
import { listProjectSlugs } from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { siteUrl } = portfolioData.meta;
  const now = new Date();
  const slugs = await listProjectSlugs();

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
