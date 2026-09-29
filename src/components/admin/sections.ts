import { BookOpen, FolderKanban, GraduationCap, Image as ImageIcon, Palette, UserRound, type LucideIcon } from 'lucide-react';

export type GroupInfo = { label: string; hint?: string };

type Base = { slug: string; label: string; icon: LucideIcon; hint: string };

export type DocSection = Base & {
  kind: 'doc';
  docKey: 'portfolio' | 'anime' | 'copy';
  /** Friendly names and help text for top-level groups. */
  groups: Record<string, GroupInfo>;
  /** Groups the current design never reads. Kept in the saved data, just not shown. */
  hidden: string[];
};
export type RowsSection = Base & { kind: 'rows'; table: 'projects' | 'education'; titleField: string };
export type MediaSection = Base & { kind: 'media' };
export type Section = DocSection | RowsSection | MediaSection;

/** The admin's pages, in sidebar order. Each lives at /admin/<slug>. */
export const SECTIONS: Section[] = [
  {
    slug: 'profile',
    kind: 'doc',
    docKey: 'portfolio',
    label: 'Profile & résumé',
    icon: UserRound,
    hint: 'Who you are and everything on the résumé side of the site.',
    groups: {
      meta: { label: 'Search & sharing', hint: 'Page title, description and preview image used by Google and link previews.' },
      basics: { label: 'Basics', hint: 'Name, headline, roles typed in the hero, bio, email, résumé link, availability.' },
      socialLinks: { label: 'Social links', hint: 'Shown in the contact section and the footer.' },
      experience: { label: 'Experience', hint: 'The “Story arcs” timeline.' },
      skills: { label: 'Skills', hint: 'Power-level bars (categories) and the scrolling equipment belt (tech stack).' },
      certifications: { label: 'Certifications', hint: 'The “Achievements unlocked” cards. A credential URL makes a card SSR.' },
      volunteering: { label: 'Volunteering', hint: 'Side quests: volunteer work.' },
      workshops: { label: 'Workshops', hint: 'Side quests: training sessions.' },
      interests: { label: 'Interests', hint: 'The “Likes” chips on the profile card.' },
      languages: { label: 'Languages', hint: 'Stars on the profile card (level 1–5).' },
    },
    hidden: ['awards', 'publications', 'testimonials'],
  },
  {
    slug: 'theme',
    kind: 'doc',
    docKey: 'anime',
    label: 'Anime theme',
    icon: Palette,
    hint: 'Characters, section titles, Japanese labels and every picture on the home page.',
    groups: {
      series: { label: 'Series name', hint: 'The wordmark in the nav and footer, and its katakana.' },
      nav: { label: 'Navigation', hint: 'Menu items (id = section anchor) and the Hire me button.' },
      hero: { label: 'Hero', hint: 'Main picture, episode tag, greeting bubble, stickers, ribbon words and the three stats.' },
      cast: { label: 'Role picker', hint: '“What are you hiring for?”: one character per role, with skills (names from Profile → Skills) and project slugs.' },
      projectCast: { label: 'Project guest stars', hint: 'One character per project slug, with the pose pictures shown throughout its page; spares go to new projects automatically, never repeated.' },
      sections: { label: 'Section titles', hint: 'Episode number, Japanese label, title and intro line for each section.' },
      about: { label: 'Profile card', hint: 'Character picture and labels on the profile card.' },
      story: { label: 'Story arcs', hint: 'Side character and bubble next to the experience timeline.' },
      skills: { label: 'Power levels', hint: 'Side character, tip bubble and the equipment label.' },
      proof: { label: 'Achievements', hint: 'Stamp labels and rarity names.' },
      beyond: { label: 'Side quests', hint: 'Column titles.' },
      contact: { label: 'Contact', hint: 'Sign-holding character, the text on the sign and where it sits (percent of the image).' },
      footer: { label: 'Footer', hint: 'Ending card, bowing character and art credits.' },
    },
    hidden: [],
  },
  {
    slug: 'projects',
    kind: 'rows',
    table: 'projects',
    titleField: 'title',
    label: 'Projects',
    icon: FolderKanban,
    hint: 'Cards on the home page and /projects, and each /projects/<slug> page.',
  },
  {
    slug: 'education',
    kind: 'rows',
    table: 'education',
    titleField: 'institution',
    label: 'Education',
    icon: GraduationCap,
    hint: '“Training grounds” on the profile card.',
  },
  { slug: 'media', kind: 'media', label: 'Media', icon: ImageIcon, hint: 'Files in object storage. Upload here or from any image field.' },
  {
    slug: 'copy',
    kind: 'doc',
    docKey: 'copy',
    label: 'Interface copy',
    icon: BookOpen,
    hint: 'Buttons, labels, form fields and other small strings.',
    groups: {
      brand: { label: 'Brand', hint: 'Domain, and the words used to pick your alias.' },
      nav: { label: 'Navigation', hint: 'Footer navigation label.' },
      hero: { label: 'Hero', hint: 'Intro paragraph ({tagline}, {city} are filled in), button labels and links.' },
      about: { label: 'Profile card', hint: 'QR code link and timezone label.' },
      work: { label: 'Work', hint: 'Filter, card and outro labels.' },
      stack: { label: 'Skills', hint: 'Where skill icons are found ({icon} = the skill’s icon name).' },
      proof: { label: 'Achievements', hint: 'Verify link label.' },
      contact: { label: 'Contact form', hint: 'Field labels and placeholders, button states, and the Google Form entry ids.' },
      footer: { label: 'Footer', hint: 'Column labels and the copyright line.' },
      projectsIndex: { label: '/projects page', hint: 'Title, intro and page metadata.' },
    },
    hidden: ['fx', 'theme', 'storage', 'path', 'beyond', 'projectPage'],
  },
];

export const sectionBySlug = (slug: string) => SECTIONS.find((s) => s.slug === slug);

/** Old single-page tab ids (#anime …) mapped to their new pages. */
export const LEGACY_HASH: Record<string, string> = {
  portfolio: 'profile',
  anime: 'theme',
  projects: 'projects',
  education: 'education',
  media: 'media',
  copy: 'copy',
};
