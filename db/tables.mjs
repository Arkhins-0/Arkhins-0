// Shared by db/setup.mjs (JSON -> database) and db/pull.mjs (database -> JSON).

/** Row tables in seeding order; each has a file at src/data/db/<table>.json. */
export const TABLES = [
  'profile', 'social_links', 'experience', 'education', 'skill_categories', 'skills', 'tech_stack',
  'certifications', 'volunteering', 'workshops', 'interests', 'languages', 'projects', 'cast_members', 'guests',
];

/** Whole JSON documents in site_documents, and the file each one mirrors. */
export const DOCS = { anime: 'src/data/anime.json', copy: 'src/data/copy.json' };

/** Columns the database manages itself; never written to the seed files. */
export const SERVER_COLUMNS = ['id', 'created_at', 'updated_at'];

export const snake = (s) => s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
export const camel = (s) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
