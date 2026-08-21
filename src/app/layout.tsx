import type { Metadata, Viewport } from 'next';
import { Syne, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
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

const { meta, basics } = portfolioData;

export const metadata: Metadata = {
  metadataBase: new URL(meta.siteUrl),
  title: {
    default: meta.title,
    template: `%s — ${basics.name}`,
  },
  description: meta.description,
  keywords: meta.keywords,
  authors: [{ name: meta.author }],
  icons: { icon: basics.profilePicture },
  openGraph: {
    title: meta.title,
    description: meta.description,
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
        <UIProvider>
          <Backdrop />
          <ScrollRail />
          <Cursor />
          <Boot />
          {children}
        </UIProvider>
      </body>
    </html>
  );
}
