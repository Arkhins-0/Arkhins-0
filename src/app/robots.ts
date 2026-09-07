import type { MetadataRoute } from 'next';
import portfolioData from '@/data/portfolio.json';

export default function robots(): MetadataRoute.Robots {
  const { siteUrl } = portfolioData.meta;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
