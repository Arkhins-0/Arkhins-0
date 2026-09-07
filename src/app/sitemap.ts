import type { MetadataRoute } from 'next';
import portfolioData from '@/data/portfolio.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const { siteUrl } = portfolioData.meta;

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${siteUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/projects/hygieia`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];
}
