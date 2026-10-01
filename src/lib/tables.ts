/**
 * The row tables the site reads and the admin edits. Fields are the camelCase names from
 * src/types/content.ts; the matching column is always the snake_case form, so this file is the
 * only place a table is described in code (db/schema.sql is the other, for Postgres).
 */
export type Cast = 'text[]' | 'jsonb' | 'integer' | 'boolean';

export type TableSpec = {
  /** Postgres table, also the key in TABLES and the segment in /api/admin/rows/<table>. */
  name: string;
  label: string;
  /** "Add a <singular>", "Delete this <singular>". */
  singular: string;
  /** Field shown in the admin list. */
  titleField: string;
  /** Editable fields in form order. `id`, `sortOrder` and the timestamps are implicit. */
  fields: readonly string[];
  /** Parameter casts for columns that are not plain text. */
  casts?: Record<string, Cast>;
  /** Fields edited as a JSON document rather than a form field. */
  json?: readonly string[];
  /** Fields picked from a dropdown of another table's values, e.g. a skill's category. */
  options?: Record<string, { table: string; field: string }>;
  /** Fields holding a skill icon name (nextjs = /images/skills/nextjs.png): a picker with a preview. */
  icons?: readonly string[];
  /** Blank row the admin starts a new entry from. */
  blank: Record<string, unknown>;
  /** Exactly one row: the admin shows a form, not a list. */
  singleton?: boolean;
  hint: string;
};

const year = () => String(new Date().getFullYear());

export const TABLES = {
  profile: {
    name: 'profile',
    label: 'Profile',
    singular: 'profile',
    titleField: 'name',
    singleton: true,
    hint: 'Who the site is about, and the title, description and preview image search engines and link previews use.',
    fields: [
      'name', 'headline', 'tagline', 'email', 'city', 'state', 'country', 'bio', 'roles', 'resumeUrl', 'availability',
      'portrait', 'profilePicture', 'metaTitle', 'metaDescription', 'keywords', 'siteUrl', 'ogImage', 'ogAlt',
    ],
    casts: { roles: 'text[]', keywords: 'text[]' },
    blank: {
      name: 'Your name', headline: 'What you do', tagline: null, email: 'you@example.com', city: 'City', state: null, country: 'Country',
      bio: 'A few lines about you.', roles: ['Developer'], resumeUrl: null, availability: 'Open to opportunities', portrait: null,
      profilePicture: null, metaTitle: 'Portfolio', metaDescription: 'Portfolio', keywords: [], siteUrl: 'https://example.com', ogImage: null, ogAlt: null,
    },
  },
  social_links: {
    name: 'social_links',
    label: 'Social links',
    singular: 'link',
    titleField: 'name',
    hint: 'Shown in the contact section and the footer. Icon: github, linkedin, instagram, google, discord or telegram.',
    fields: ['name', 'username', 'url', 'icon'],
    blank: { name: 'Network', username: 'handle', url: 'https://', icon: 'globe' },
  },
  experience: {
    name: 'experience',
    label: 'Experience',
    singular: 'role',
    titleField: 'company',
    hint: 'The "Story arcs" timeline, newest first.',
    fields: ['company', 'position', 'location', 'startDate', 'endDate', 'current', 'type', 'description', 'highlights', 'technologies', 'logo', 'url'],
    casts: { current: 'boolean', highlights: 'text[]', technologies: 'text[]' },
    blank: {
      company: 'Company', position: 'Position', location: null, startDate: 'Jan ' + year(), endDate: null, current: true, type: 'Internship',
      description: null, highlights: [], technologies: [], logo: null, url: null,
    },
  },
  education: {
    name: 'education',
    label: 'Education',
    singular: 'entry',
    titleField: 'institution',
    hint: '"Training grounds" on the profile card.',
    fields: ['institution', 'degree', 'field', 'score', 'startYear', 'endYear', 'current', 'description', 'logo'],
    casts: { current: 'boolean' },
    blank: { institution: 'Institution', degree: 'Degree', field: 'Field', score: null, startYear: year(), endYear: null, current: false, description: null, logo: null },
  },
  skill_categories: {
    name: 'skill_categories',
    label: 'Skill categories',
    singular: 'category',
    titleField: 'name',
    hint: 'One "power level" card each. Skills join a card by naming its category.',
    fields: ['name', 'description'],
    blank: { name: 'New category', description: null },
  },
  skills: {
    name: 'skills',
    label: 'Skills',
    singular: 'skill',
    titleField: 'name',
    hint: 'Level 0-100. Icon is a name under /images/skills (nextjs = /images/skills/nextjs.png) or a full path.',
    fields: ['category', 'name', 'icon', 'level'],
    casts: { level: 'integer' },
    options: { category: { table: 'skill_categories', field: 'name' } },
    icons: ['icon'],
    blank: { category: 'Frontend Development', name: 'Skill', icon: 'react', level: 70 },
  },
  tech_stack: {
    name: 'tech_stack',
    label: 'Tech stack',
    singular: 'tool',
    titleField: 'name',
    hint: 'The scrolling equipment belt under the skills.',
    fields: ['name', 'icon'],
    blank: { name: 'Tool', icon: '/images/skills/react.png' },
  },
  certifications: {
    name: 'certifications',
    label: 'Certifications',
    singular: 'certification',
    titleField: 'name',
    hint: 'The "Achievements unlocked" cards. A credential URL makes a card SSR with a Verified stamp; an ID alone makes it SR.',
    fields: ['name', 'issuer', 'date', 'category', 'description', 'credentialId', 'credentialUrl', 'badge'],
    blank: { name: 'Certification', issuer: 'Issuer', date: 'Month ' + year(), category: 'Development', description: null, credentialId: null, credentialUrl: null, badge: null },
  },
  volunteering: {
    name: 'volunteering',
    label: 'Volunteering',
    singular: 'quest',
    titleField: 'organization',
    hint: 'Side quests, left column.',
    fields: ['organization', 'role', 'startDate', 'endDate', 'current', 'description', 'logo'],
    casts: { current: 'boolean' },
    blank: { organization: 'Organisation', role: 'Volunteer', startDate: year(), endDate: null, current: false, description: null, logo: null },
  },
  workshops: {
    name: 'workshops',
    label: 'Workshops',
    singular: 'workshop',
    titleField: 'name',
    hint: 'Side quests, right column.',
    fields: ['name', 'organizer', 'date', 'description', 'certificateUrl'],
    blank: { name: 'Workshop', organizer: 'Organiser', date: 'DD Month ' + year(), description: null, certificateUrl: null },
  },
  interests: {
    name: 'interests',
    label: 'Interests',
    singular: 'interest',
    titleField: 'name',
    hint: 'The "Likes" chips on the profile card; the description shows on hover.',
    fields: ['name', 'description'],
    blank: { name: 'Interest', description: null },
  },
  languages: {
    name: 'languages',
    label: 'Languages',
    singular: 'language',
    titleField: 'name',
    hint: 'Stars on the profile card, level 1-5.',
    fields: ['name', 'proficiency', 'level'],
    casts: { level: 'integer' },
    blank: { name: 'Language', proficiency: 'Conversational', level: 3 },
  },
  projects: {
    name: 'projects',
    label: 'Projects',
    singular: 'project',
    titleField: 'title',
    hint: 'Cards on the home page and /projects, and each /projects/<slug> page. Unpublished rows are hidden everywhere.',
    fields: [
      'slug', 'title', 'tagline', 'summary', 'description', 'category', 'role', 'year', 'date', 'status', 'featured', 'published',
      'tags', 'thumbnail', 'cover', 'images', 'githubUrl', 'liveUrl', 'markdownFile', 'themeColor', 'content',
    ],
    casts: { tags: 'text[]', images: 'text[]', content: 'jsonb', featured: 'boolean', published: 'boolean' },
    json: ['content'],
    blank: {
      slug: 'new-project', title: 'New project', tagline: null, summary: 'One or two lines for the card.', description: null, category: 'Web',
      role: null, year: year(), date: null, status: 'In progress', featured: false, published: false, tags: [], thumbnail: '', cover: null,
      images: [], githubUrl: null, liveUrl: null, markdownFile: null, themeColor: null, content: null,
    },
  },
  cast_members: {
    name: 'cast_members',
    label: 'Role picker',
    singular: 'character',
    titleField: 'role',
    hint: '"What are you hiring for?": one character per role. Skills are matched by name to the Skills table; projects by slug.',
    fields: ['name', 'kana', 'series', 'role', 'pitch', 'skills', 'projects', 'image', 'face', 'color'],
    casts: { skills: 'text[]', projects: 'text[]' },
    blank: { name: 'Character', kana: null, series: 'Series', role: 'Role', pitch: 'What this role delivers.', skills: [], projects: [], image: '', face: null, color: '#ff4f8b' },
  },
  guests: {
    name: 'guests',
    label: 'Guest stars',
    singular: 'guest',
    titleField: 'name',
    hint: 'One character per project slug, with pose pictures for its page. Leave the slug empty for a spare: it goes to the next project without a guest.',
    fields: ['projectSlug', 'name', 'series', 'line', 'image', 'face', 'poses'],
    casts: { poses: 'text[]' },
    blank: { projectSlug: null, name: 'Character', series: 'Series', line: 'One line they say.', image: '', face: null, poses: [] },
  },
} as const satisfies Record<string, TableSpec>;

export type TableKey = keyof typeof TABLES;

export const TABLE_KEYS = Object.keys(TABLES) as TableKey[];

export const isTableKey = (k: string): k is TableKey => k in TABLES;

/** camelCase to snake_case ("githubUrl" becomes "github_url"). */
export const snake = (s: string) => s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());

/** Fields as read back from the database, in form order. */
export const rowFields = (spec: TableSpec) => ['id', ...spec.fields, 'sortOrder'];

export function fromDb<T>(spec: TableSpec, row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const f of rowFields(spec)) out[f] = row[snake(f)] ?? null;
  return out as T;
}

/** Column list, placeholders and values for an insert or update from a camelCase row. */
export function toDb(spec: TableSpec, row: Record<string, unknown>) {
  const cols: string[] = [];
  const marks: string[] = [];
  const values: unknown[] = [];
  for (const f of [...spec.fields, 'sortOrder']) {
    if (!(f in row)) continue;
    let v = row[f];
    const cast = spec.casts?.[f] ?? (f === 'sortOrder' ? 'integer' : undefined);
    if (cast === 'jsonb') v = v == null ? null : JSON.stringify(v);
    if (cast === 'text[]' && !Array.isArray(v)) v = [];
    if (cast === 'integer' && typeof v === 'string') v = v.trim() === '' ? null : Number(v);
    // Blank text means "not set" for optional columns; required ones keep '' and let Postgres decide.
    if (typeof v === 'string' && v.trim() === '' && !['thumbnail', 'image'].includes(f)) v = null;
    cols.push(snake(f));
    values.push(v);
    marks.push(`$${values.length}${cast ? `::${cast}` : ''}`);
  }
  return { cols, marks, values };
}
