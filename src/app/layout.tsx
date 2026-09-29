import type { Metadata, Viewport } from 'next';
import { Syne, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import './anime.css';
import { UIProvider } from '@/context/UIContext';
import { getSiteDoc, type Portfolio } from '@/lib/site';
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

/** Title, description and sharing tags come from the profile document, so they are editable in /admin. */
export async function generateMetadata(): Promise<Metadata> {
  const { meta, basics } = await getSiteDoc('portfolio');
  return {
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
}

// Person schema so search engines associate "Krishna Vijay" / "Krishna Vijay G." queries with this site
const personJsonLd = ({ meta, basics, socialLinks }: Portfolio) => ({
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
});

export const viewport: Viewport = {
  themeColor: '#ff4f8b',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const portfolio = await getSiteDoc('portfolio');
  return (
    <html
      lang="en"
      data-accent={content.theme.accents[0].id}
      data-fx="on"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(portfolio)) }}
        />
        <UIProvider>
          {children}
        </UIProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
