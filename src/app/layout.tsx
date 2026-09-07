import type { Metadata, Viewport } from 'next';
import { Syne, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { UIProvider } from '@/context/UIContext';
import { Backdrop, Cursor, ScrollRail } from '@/components/fx';
import { Boot } from '@/components/layout/Boot';
import portfolioData from '@/data/portfolio.json';
import content from '@/data/content.json';

const display = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

const { meta, basics, socialLinks } = portfolioData;

export const metadata: Metadata = {
  metadataBase: new URL(meta.siteUrl),
  title: {
    default: meta.title,
    template: `%s — ${basics.name}`,
  },
  description: meta.description,
  keywords: meta.keywords,
  authors: [{ name: meta.author, url: meta.siteUrl }],
  creator: meta.author,
  publisher: meta.author,
  alternates: {
    canonical: meta.siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: meta.siteUrl,
    siteName: meta.title,
    type: 'website',
    images: [{ url: meta.ogImage, alt: meta.ogAlt }],
  },
  twitter: {
    card: 'summary_large_image',
    title: meta.title,
    description: meta.description,
    images: [meta.ogImage],
  },
};

// Person schema so search engines associate "Krishna Vijay" / "Krishna Vijay G." queries with this site
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: basics.name,
  alternateName: ['Krishna Vijay', 'Krishna Vijay G', 'Arkhins'],
  url: meta.siteUrl,
  image: `${meta.siteUrl}${basics.profilePicture}`,
  jobTitle: basics.headline,
  description: meta.description,
  email: `mailto:${basics.email}`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: basics.location.city,
    addressRegion: basics.location.state,
    addressCountry: basics.location.country,
  },
  sameAs: socialLinks.map((link) => link.url),
};

export const viewport: Viewport = {
  themeColor: content.theme.accents[0].swatch,
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-accent={content.theme.accents[0].id}
      data-fx="on"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen overflow-x-hidden bg-bg text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <UIProvider>
          <Backdrop />
          <ScrollRail />
          <Cursor />
          <Boot />
          {children}
        </UIProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
