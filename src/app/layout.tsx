import "./globals.css"

import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata, Viewport } from "next"
import { Fraunces, IBM_Plex_Mono, Lora } from "next/font/google"

import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import { themeScript } from "@/components/layout/ThemeToggle"
import { site, websiteSchema } from "@/data/site"

const lora = Lora({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-lora", display: "swap" })
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", preload: false })
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
  preload: false,
})

const defaultTitle = `${site.name} · ${site.tagline}`

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: defaultTitle, template: "%s · krishna vijay g" },
  description: site.description,
  keywords: [...site.keywords],
  authors: [{ name: site.name, url: site.url }],
  alternates: {
    canonical: "./",
    types: { "application/rss+xml": [{ url: "/rss.xml", title: site.name }] },
  },
  openGraph: { type: "website", siteName: site.name, locale: site.locale, url: "./" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={site.locale}
      suppressHydrationWarning
      className={`${lora.variable} ${fraunces.variable} ${plexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      </head>
      <body>
        <Header />
        <main className="mx-auto max-w-3xl px-4 lg:px-0">{children}</main>
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  )
}
