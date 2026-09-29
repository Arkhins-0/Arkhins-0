/**
 * Column maps for the row tables the admin edits. Keys are the camelCase fields of
 * src/types/content.ts; values are the snake_case columns in db/schema.sql.
 */
export type TableSpec = {
  name: string;
  label: string;
  columns: Record<string, string>;
  /** Postgres casts for parameters that are not plain text. */
  casts?: Record<string, string>;
  /** Field shown in the admin list. */
  titleField: string;
  /** Blank row the admin starts a new entry from. */
  blank: Record<string, unknown>;
};

export const TABLES = {
  projects: {
    name: 'projects',
    label: 'Projects',
    titleField: 'title',
    columns: {
      id: 'id',
      slug: 'slug',
      title: 'title',
      tagline: 'tagline',
      summary: 'summary',
      description: 'description',
      category: 'category',
      role: 'role',
      year: 'year',
      date: 'date',
      status: 'status',
      featured: 'featured',
      published: 'published',
      sortOrder: 'sort_order',
      tags: 'tags',
      thumbnail: 'thumbnail',
      cover: 'cover',
      images: 'images',
      githubUrl: 'github_url',
      liveUrl: 'live_url',
      markdownFile: 'markdown_file',
      content: 'content',
    },
    casts: { tags: 'text[]', images: 'text[]', content: 'jsonb', sortOrder: 'integer', featured: 'boolean', published: 'boolean' },
    blank: {
      slug: 'new-project',
      title: 'New project',
      tagline: null,
      summary: 'One or two lines for the card.',
      description: null,
      category: 'Web',
      role: null,
      year: String(new Date().getFullYear()),
      date: null,
      status: 'In progress',
      featured: false,
      published: false,
      sortOrder: 999,
      tags: [],
      thumbnail: '',
      cover: null,
      images: [],
      githubUrl: null,
      liveUrl: null,
      markdownFile: null,
      content: null,
    },
  },
  education: {
    name: 'education',
    label: 'Education',
    titleField: 'institution',
    columns: {
      id: 'id',
      institution: 'institution',
      degree: 'degree',
      field: 'field',
      score: 'score',
      startYear: 'start_year',
      endYear: 'end_year',
      current: 'current',
      description: 'description',
      logo: 'logo',
      sortOrder: 'sort_order',
    },
    casts: { sortOrder: 'integer', current: 'boolean' },
    blank: {
      institution: 'Institution',
      degree: 'Degree',
      field: 'Field',
      score: null,
      startYear: String(new Date().getFullYear()),
      endYear: null,
      current: false,
      description: null,
      logo: null,
      sortOrder: 999,
    },
  },
} satisfies Record<string, TableSpec>;

export type TableKey = keyof typeof TABLES;

export const isTableKey = (k: string): k is TableKey => k in TABLES;

export function fromDb<T>(spec: TableSpec, row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [field, col] of Object.entries(spec.columns)) out[field] = row[col] ?? null;
  return out as T;
}

/** Column list, placeholders and values for an insert or update from a camelCase row. */
export function toDb(spec: TableSpec, row: Record<string, unknown>, { withId = false } = {}) {
  const cols: string[] = [];
  const marks: string[] = [];
  const values: unknown[] = [];
  for (const [field, col] of Object.entries(spec.columns)) {
    if (field === 'id' && !withId) continue;
    if (!(field in row)) continue;
    let v = row[field];
    const cast = spec.casts?.[field as keyof typeof spec.casts];
    if (cast === 'jsonb') v = v == null ? null : JSON.stringify(v);
    if (cast === 'text[]' && !Array.isArray(v)) v = [];
    cols.push(col);
    values.push(v);
    marks.push(`$${values.length}${cast ? `::${cast}` : ''}`);
  }
  return { cols, marks, values };
}
