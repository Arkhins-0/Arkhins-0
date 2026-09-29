# Content data model

Everything the site shows is a row in Postgres (Neon), except two small JSON documents. When
`DATABASE_URL` is missing or a query fails, every reader falls back to the bundled JSON under
`src/data`, so the site always builds.

| Table (schema.sql) | Seed | Shown as |
|---|---|---|
| `profile` (one row) | `src/data/db/profile.json` | name, headline, bio, contact details, page metadata |
| `social_links` | `social_links.json` | contact chips and footer links |
| `experience` | `experience.json` | Story arcs timeline |
| `education` | `education.json` | Training grounds on the profile card |
| `skill_categories`, `skills` | `skill_categories.json`, `skills.json` | Power-level cards (a skill joins its card by category name) |
| `tech_stack` | `tech_stack.json` | the scrolling equipment belt |
| `certifications` | `certifications.json` | Achievements unlocked (a credential URL = SSR + Verified; an ID = SR) |
| `volunteering`, `workshops` | `volunteering.json`, `workshops.json` | Side quests |
| `interests`, `languages` | `interests.json`, `languages.json` | Likes chips and language stars |
| `projects` | `projects.json` | cards on / and /projects, and each /projects/<slug> page |
| `cast_members` | `cast_members.json` | the "What are you hiring for?" role picker |
| `guests` | `guests.json` | one guest character per project slug; rows without a slug are spares |
| `assets` | (uploads) | bookkeeping for files in object storage |
| `site_documents` | `src/data/anime.json`, `src/data/copy.json` | `anime`: theme pictures and labels; `copy`: interface strings |

Column names are the snake_case form of the camelCase fields in `src/types/content.ts`;
`src/lib/tables.ts` converts mechanically and lists each table's fields, casts and blank row. To add
a column: one line in `schema.sql`, the field in the row type, and the field name in `tables.ts`.

## Setup and seeding

```
npm run db:setup            # apply schema.sql, seed every empty table and document
npm run db:setup -- --force # overwrite everything with the bundled JSON
```

The script also cleans up after the single-document era: the old `portfolio` document is removed
(its content lives in the tables now) and the characters leave the `anime` document.

## Projects

A project row holds the card-level fields as columns and the whole page as one `content` JSON
document (`jsonb`). It is versioned and made of typed blocks, so each project can have a different
page without a schema change:

```
content = {
  version: 1,
  theme:   { look, accent, accent2, watermark?, backdrop? },  // per-project look, scoped CSS variables
  screens: { default: "dark" | "light" },                     // which screenshot variant to show first
  hero:    { title, accent, lede, badges, facts, stage: { center, left, right } },
  sections: [ { type: "stats" | "overview" | "cards" | "table" | "tabs" | "steps" | "duo" | "marquee"
                    | "compare" | "phones" | "gallery" | "columns" | "markdown" | "outro", ... } ]
}
```

Looks: `clinic`, `ledger`, `folio`, `pitwall`, `tower`, `blueprint` and `plain` (see
`src/components/showcase/showcase.css`). Screenshots are `{ light, dark, alt }` pairs. A project whose
`content` is `null` still gets a page: hero from the row, its images as a gallery, the markdown case
study inline, and the outro. The admin's code editor checks a page document against
`src/components/admin/validate.ts` before it can be saved.

## /admin

- Every table has a page with a reorderable list and a form; the profile is a single form.
- JSON fields (a project's page) get a code editor with line numbers and error positions; any row or
  document can also be edited as one JSON object.
- Saving revalidates the site, so edits are live on the next request.
- Uploads go to the S3-compatible bucket in `S3_BUCKET` / `AWS_*` and are served through
  `/api/media/<key>`, so the bucket stays private.
- There is no login yet. `src/lib/admin.ts` (`guard`) is the single place to add auth;
  `ADMIN_DISABLED=true` turns the dashboard and its API off.
