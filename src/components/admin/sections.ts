import {
  Award,
  BookOpen,
  Briefcase,
  Drama,
  Flag,
  FolderKanban,
  Gauge,
  GraduationCap,
  Heart,
  Image as ImageIcon,
  Languages,
  Layers,
  Palette,
  Share2,
  Sparkles,
  UserRound,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { TABLES, type TableKey } from '@/lib/tables';

export type GroupInfo = { label: string; hint?: string };

type Base = { slug: string; label: string; icon: LucideIcon; hint: string; group: string };

export type DocSection = Base & {
  kind: 'doc';
  docKey: 'anime' | 'copy';
  /** Friendly names and help text for top-level groups. */
  groups: Record<string, GroupInfo>;
};
export type RowsSection = Base & { kind: 'rows'; table: TableKey };
export type MediaSection = Base & { kind: 'media' };
export type Section = DocSection | RowsSection | MediaSection;

const rows = (table: TableKey, icon: LucideIcon, group: string): RowsSection => ({
  kind: 'rows',
  table,
  slug: table.replace(/_/g, '-'),
  label: TABLES[table].label,
  hint: TABLES[table].hint,
  icon,
  group,
});

/** Sidebar order. Each section lives at /admin/<slug>. */
export const SECTIONS: Section[] = [
  rows('profile', UserRound, 'Site'),
  {
    slug: 'theme',
    kind: 'doc',
    docKey: 'anime',
    label: 'Anime theme',
    icon: Palette,
    group: 'Site',
    hint: 'Pictures, section titles, Japanese labels and the small words that make the theme.',
    groups: {
      series: { label: 'Series name', hint: 'The wordmark in the nav and footer, and its katakana.' },
      nav: { label: 'Navigation', hint: 'Menu items (id = section anchor) and the Hire me button.' },
      hero: { label: 'Hero', hint: 'Main picture, episode tag, greeting bubble, stickers, ribbon words and the three stats.' },
      sections: { label: 'Section titles', hint: 'Episode number, Japanese label, title and intro line for each section.' },
      about: { label: 'Profile card', hint: 'Character picture and the labels on the profile sheet.' },
      cast: { label: 'Role picker labels', hint: 'Button and heading text. The characters themselves are under Work → Role picker.' },
      projectCast: { label: 'Guest star label', hint: 'The word before a guest character’s name. The characters are under Work → Guest stars.' },
      story: { label: 'Story arcs', hint: 'Side character and bubble next to the experience timeline.' },
      skills: { label: 'Power levels', hint: 'Side character, tip bubble and the equipment label.' },
      proof: { label: 'Achievements', hint: 'Stamp labels and rarity names.' },
      beyond: { label: 'Side quests', hint: 'Column titles.' },
      contact: { label: 'Contact', hint: 'Sign-holding character, the text on the sign and where it sits (percent of the image).' },
      footer: { label: 'Footer', hint: 'Ending card, bowing character and art credits.' },
    },
  },
  {
    slug: 'copy',
    kind: 'doc',
    docKey: 'copy',
    label: 'Interface copy',
    icon: BookOpen,
    group: 'Site',
    hint: 'Buttons, labels, form fields and other small strings.',
    groups: {
      brand: { label: 'Brand', hint: 'The domain shown in the copyright line.' },
      nav: { label: 'Navigation', hint: 'Footer navigation label.' },
      hero: { label: 'Hero', hint: 'Intro paragraph ({tagline}, {city} are filled in) and the two buttons.' },
      about: { label: 'Profile card', hint: 'QR code link and timezone label.' },
      work: { label: 'Work', hint: 'Filter, card and outro labels.' },
      stack: { label: 'Skills', hint: 'Where skill icons are found ({icon} = the skill’s icon name).' },
      proof: { label: 'Achievements', hint: 'Verify link label.' },
      contact: { label: 'Contact form', hint: 'Field labels and placeholders, button states, and the Google Form entry ids.' },
      footer: { label: 'Footer', hint: 'Column labels and the copyright line.' },
      projectsIndex: { label: '/projects page', hint: 'Title, intro and page metadata.' },
      projectPage: { label: 'Project pages', hint: 'Back link, screens switch and lightbox labels on every project page.' },
    },
  },
  rows('experience', Briefcase, 'Résumé'),
  rows('education', GraduationCap, 'Résumé'),
  rows('skill_categories', Layers, 'Résumé'),
  rows('skills', Gauge, 'Résumé'),
  rows('tech_stack', Wrench, 'Résumé'),
  rows('certifications', Award, 'Résumé'),
  rows('volunteering', Flag, 'Résumé'),
  rows('workshops', Sparkles, 'Résumé'),
  rows('languages', Languages, 'Résumé'),
  rows('interests', Heart, 'Résumé'),
  rows('social_links', Share2, 'Résumé'),
  rows('projects', FolderKanban, 'Work'),
  rows('guests', Users, 'Work'),
  rows('cast_members', Drama, 'Work'),
  { slug: 'media', kind: 'media', label: 'Media', icon: ImageIcon, group: 'Files', hint: 'Files in object storage. Upload here or from any image field.' },
];

export const GROUPS = Array.from(new Set(SECTIONS.map((s) => s.group)));

export const sectionBySlug = (slug: string) => SECTIONS.find((s) => s.slug === slug);

/** Old single-page tab ids (#anime …) and old slugs mapped to their pages. */
export const LEGACY_HASH: Record<string, string> = {
  portfolio: 'profile',
  anime: 'theme',
  projects: 'projects',
  education: 'education',
  media: 'media',
  copy: 'copy',
};
