import type { Metadata, Viewport } from 'next';
import { Syne, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { UIProvider } from '@/context/UIContext';
import { Backdrop, Cursor, ScrollRail } from '@/components/fx';
import { Boot } from '@/components/layout/Boot';
import portfolioData from '@/data/portfolio.json';

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
  metadataBase: new URL('https://krishnavijayg.vercel.app'),
  title: {
    default: meta.title,
    template: `%s — ${basics.name}`,
  },
  description: meta.description,
  keywords: meta.keywords,
  authors: [{ name: meta.author }],
  icons: { icon: '/images/profile.jpg' },
  openGraph: {
    title: meta.title,
    description: meta.description,
    type: 'website',
    images: [{ url: '/images/OG.png', alt: `${basics.name} — portfolio` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: meta.title,
    description: meta.description,
    images: ['/images/OG.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#ff2d6f',
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
      data-accent="rose"
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
