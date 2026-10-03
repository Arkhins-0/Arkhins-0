/**
 * Content shapes. The JSON under src/content is exported from the anime site's tables,
 * so these mirror its row types (only the fields this site reads).
 */

export interface ThemedImage {
  light: string
  dark?: string
  alt: string
  caption?: string
}

export interface Head {
  index: string
  label: string
  title: string
  accentWord?: string
  lede?: string
}

export interface Action {
  label: string
  href: string
  external?: boolean
  kind?: "solid" | "ghost"
}

export type Block =
  | { type: "stats"; items: { value: string; label: string }[] }
  | {
      type: "overview"
      head: Head
      paragraphs: string[]
      features?: { icon: string; title: string; description: string }[]
    }
  | {
      type: "cards"
      head: Head
      items: { title: string; subtitle?: string; value?: string; valueLabel?: string; meta?: string }[]
    }
  | { type: "table"; head?: Head; columns: string[]; rows: string[][] }
  | {
      type: "tabs"
      head: Head
      tabs: {
        id: string
        label: string
        subtitle?: string
        steps: { title: string; description: string }[]
        detailsTitle?: string
        details?: string[]
      }[]
    }
  | { type: "steps"; head: Head; items: { title: string; body: string; ticks?: string[]; image: ThemedImage }[] }
  | { type: "compare"; head: Head; image: ThemedImage }
  | { type: "phones"; head: Head; items: ThemedImage[] }
  | { type: "gallery"; head: Head; items: ThemedImage[] }
  | { type: "columns"; head: Head; columns: { title: string; style: "chips" | "ticks"; items: string[] }[] }
  | {
      type: "duo"
      head: Head
      sides: {
        eyebrow: string
        title: string
        body: string
        device: "browser" | "phone"
        image: ThemedImage
        url?: string
        points: string[]
      }[]
      shared?: { title: string; items: string[] }
    }
  | { type: "marquee"; items: string[] }
  | { type: "markdown"; head: Head; file: string }
  | { type: "outro"; title: string; accentWord?: string; actions: Action[] }

export interface ShowcaseDoc {
  hero: {
    eyebrow?: string
    title: string
    accent?: string
    lede: string
    facts?: { label: string; value: string }[]
  }
  sections: Block[]
}

export interface Project {
  slug: string
  title: string
  tagline: string | null
  summary: string
  description: string | null
  category: string
  role: string | null
  year: string
  date: string | null
  status: string
  featured: boolean
  published: boolean
  sortOrder: number
  tags: string[]
  thumbnail: string | null
  cover: string | null
  githubUrl: string | null
  liveUrl: string | null
  markdownFile: string | null
  content?: ShowcaseDoc | null
}

export interface Experience {
  company: string
  position: string
  location: string | null
  startDate: string
  endDate: string | null
  current: boolean
  type: string | null
  description: string | null
  logo: string | null
  url: string | null
  sortOrder: number
}

export interface Education {
  degree: string
  institution: string
  location: string
  score: string
  startYear: string
  endYear: string
  logo: string
}

/** A certificate file on the `assets` branch: where it opens, and the preview rendered from its first page. */
export interface CertificateFile {
  url: string
  preview: string
}

export interface Certification {
  name: string
  issuer: string
  date: string
  credentialUrl: string | null
  badge: string | null
  sortOrder: number
  certificate?: CertificateFile | null
}

export interface Workshop {
  name: string
  organizer: string
  date: string
  description: string | null
  certificateUrl: string | null
  sortOrder: number
  certificate?: CertificateFile | null
}

export interface Language {
  name: string
  proficiency: string
  sortOrder: number
}
