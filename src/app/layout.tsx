import type { Metadata, Viewport } from 'next';
import { Syne, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@/styles/globals.css';
import '@/styles/home.css';
import { listRows } from '@/lib/content';
import { getProfile, getSiteDoc } from '@/lib/site';
import type { ProfileRow, SocialLinkRow } from '@/types/content';

const display = Syne({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-display', display: 'swap' });
const sans = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-mono', display: 'swap' });

/** Title, description and sharing tags come from the profile row, so they are editable in /admin. */
export async function generateMetadata(): Promise<Metadata> {
  const p = await getProfile();
  const ogImage = p.ogImage ?? p.profilePicture ?? undefined;
  return {
    metadataBase: new URL(p.siteUrl),
    title: { default: p.metaTitle, template: `%s — ${p.name}` },
    description: p.metaDescription,
    keywords: p.keywords,
    authors: [{ name: p.name, url: p.siteUrl }],
    creator: p.name,
    publisher: p.name,
    alternates: { canonical: p.siteUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    openGraph: {
      title: p.metaTitle,
      description: p.metaDescription,
      url: p.siteUrl,
      siteName: p.metaTitle,
      type: 'website',
      images: ogImage ? [{ url: ogImage, alt: p.ogAlt ?? p.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: p.metaTitle,
      description: p.metaDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

/** Person schema so search engines associate the name and the alias with this site. */
const personJsonLd = (p: ProfileRow, links: SocialLinkRow[], alias: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: p.name,
  alternateName: Array.from(new Set([p.name.split(' ').slice(0, 2).join(' '), alias])).filter(Boolean),
  url: p.siteUrl,
  ...(p.profilePicture ? { image: `${p.siteUrl}${p.profilePicture}` } : {}),
  jobTitle: p.headline,
  description: p.metaDescription,
  email: `mailto:${p.email}`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: p.city,
    ...(p.state ? { addressRegion: p.state } : {}),
    addressCountry: p.country,
  },
  sameAs: links.map((l) => l.url),
});

export const viewport: Viewport = {
  themeColor: '#ff4f8b',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [profile, links, anime] = await Promise.all([getProfile(), listRows('social_links'), getSiteDoc('anime')]);
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Anime theme faces (Dela Gothic One, M PLUS Rounded 1c). Both carry Japanese glyphs split into
            hundreds of unicode-range slices, so they load from Google on demand instead of via next/font. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- loaded once in the root layout */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=M+PLUS+Rounded+1c:wght@400;500;700;800;900&display=swap"
        />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-bg text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(profile, links, anime.series.title)) }}
        />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
