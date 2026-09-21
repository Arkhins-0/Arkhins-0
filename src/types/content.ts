/**
 * Row types for the content tables (db/schema.sql) and the ShowcaseDoc stored in `projects.content`.
 * JSON files under src/data/db mirror these exactly; src/lib/content.ts is the only reader.
 */

// ---------------------------------------------------------------- education

export interface EducationRow {
  id: string;
  institution: string;
  degree: string;
  field: string;
  score: string | null;
  startYear: string;
  endYear: string | null;
  current: boolean;
  description: string | null;
  logo: string | null;
  sortOrder: number;
}

// ------------------------------------------------------------------ projects

export interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  summary: string;
  description: string | null;
  category: string;
  role: string | null;
  year: string | null;
  date: string | null;
  status: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  tags: string[];
  thumbnail: string;
  cover: string | null;
  /** Extra stills for projects without a content document (rendered as a gallery). */
  images: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  markdownFile: string | null;
  content: ShowcaseDoc | null;
}

// --------------------------------------------------------------- showcase doc

export type ScreenVariant = 'light' | 'dark';

/** A screenshot with an optional dark counterpart. `dark` falls back to `light`. */
export interface ThemedImage {
  light: string;
  dark?: string;
  alt: string;
  /** Optional caption shown under gallery thumbnails and in the lightbox. */
  caption?: string;
}

export interface Rgb {
  hex: string;
  /** Space-separated channels, e.g. "52 211 153", for rgb(var(--x) / a). */
  rgb: string;
}

export type Look = 'clinic' | 'ledger' | 'folio' | 'plain';

export interface ShowcaseTheme {
  /** Visual treatment: surfaces, radii, background motif. */
  look: Look;
  accent: Rgb;
  accent2: Rgb;
  /** Large faded emblem placed behind the hero. */
  watermark?: string;
  /** Photograph behind the hero. The folio look renders the hero as a night band over it. */
  backdrop?: string;
}

export interface Action {
  label: string;
  href: string;
  external?: boolean;
  kind?: 'solid' | 'ghost';
}

export interface Head {
  index: string;
  label: string;
  title: string;
  accentWord?: string;
  lede?: string;
}

export interface Hero {
  eyebrow?: string;
  title: string;
  /** Second line, rendered in the accent colour. */
  accent?: string;
  lede: string;
  badges?: { label: string; tone?: 'accent' | 'muted' }[];
  actions?: Action[];
  facts?: { label: string; value: string }[];
  /** Perspective stage: one large centre screen with two angled wings. */
  stage?: { center: ThemedImage; left?: ThemedImage; right?: ThemedImage; url?: string };
}

export type Block =
  | { type: 'stats'; items: { value: string; label: string }[] }
  | {
      type: 'overview';
      head: Head;
      paragraphs: string[];
      features?: { icon: string; title: string; description: string }[];
    }
  | {
      type: 'cards';
      head: Head;
      items: {
        title: string;
        subtitle?: string;
        hue?: string;
        icon?: string;
        value?: string;
        valueLabel?: string;
        meta?: string;
      }[];
    }
  | { type: 'table'; head?: Head; columns: string[]; rows: string[][]; hues?: string[] }
  | {
      type: 'tabs';
      head: Head;
      tabs: {
        id: string;
        label: string;
        hue?: string;
        subtitle?: string;
        steps: { title: string; description: string }[];
        detailsTitle?: string;
        details?: string[];
      }[];
    }
  | {
      type: 'steps';
      head: Head;
      items: { title: string; body: string; ticks?: string[]; image: ThemedImage; tall?: boolean }[];
    }
  | { type: 'compare'; head: Head; image: ThemedImage }
  | { type: 'phones'; head: Head; items: ThemedImage[] }
  | { type: 'gallery'; head: Head; items: ThemedImage[] }
  | {
      type: 'columns';
      head: Head;
      columns: { title: string; style: 'chips' | 'ticks'; items: string[] }[];
    }
  | {
      /** Two builds of one product side by side, e.g. the web app in a browser and the native app in a phone. */
      type: 'duo';
      head: Head;
      sides: {
        eyebrow: string;
        title: string;
        body: string;
        device: 'browser' | 'phone';
        image: ThemedImage;
        url?: string;
        points: string[];
      }[];
      /** What both builds have in common, shown as a strip of chips under them. */
      shared?: { title: string; items: string[] };
    }
  | { type: 'markdown'; head: Head; file: string }
  | { type: 'outro'; title: string; accentWord?: string; actions: Action[] };

export interface ShowcaseDoc {
  version: 1;
  theme: ShowcaseTheme;
  screens: { default: ScreenVariant };
  hero: Hero;
  sections: Block[];
}
