import type { MetadataRoute } from 'next';
import { getProfile } from '@/lib/site';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { siteUrl } = await getProfile();
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
