# Content data model

The portfolio's editable content is organised as database rows, even though it is served from JSON today.

| Table (schema.sql) | Today | Read through |
|---|---|---|
| `education` | `src/data/db/education.json` | `listEducation()` in `src/lib/content.ts` |
| `projects` | `src/data/db/projects.json` | `listProjects()`, `getProject(slug)` |
| `assets` | not yet (images live in `public/projects/<slug>/`) | planned |

Everything else (profile, experience, skills, certifications, …) still lives in `src/data/portfolio.json`.

## Projects

A project row holds the card-level fields as columns and the whole page as one `content` JSON document
(`jsonb` in Postgres). The document is versioned and made of typed blocks, so each project can have a
different page without a schema change:

```
content = {
  version: 1,
  theme:   { look, accent, accent2, watermark? },      // per-project look, scoped CSS variables
  screens: { default: "dark" | "light" },              // which screenshot variant to show first
  hero:    { title, accent, lede, badges, facts, stage: { center, left, right } },
  sections: [ { type: "stats" | "overview" | "cards" | "table" | "tabs" | "steps"
                    | "compare" | "phones" | "gallery" | "columns" | "markdown" | "outro", … } ]
}
```

Screenshots are `{ light, dark, alt }` pairs. The page renders one variant at a time and offers a
"Screens: light / dark" switch instead of listing every screen twice. A `compare` block shows both
side by side with a slider. Types live in `src/types/content.ts`; the renderer in `src/components/showcase/`.

A project whose `content` is `null` still gets a page at `/projects/<slug>`: hero from the row, its
images as a gallery, the markdown case study inline, and the outro.

## Moving to Neon + object storage + admin

1. Run `schema.sql` against the Neon database.
2. Import the two JSON files (rows map 1:1; convert camelCase keys to snake_case).
3. Replace the JSON reads in `src/lib/content.ts` with queries. The function signatures are already
   async and return the same row types, so pages and components do not change.
4. Upload images to the bucket, write `assets` rows, and point `content` URLs at them.
5. The admin dashboard edits rows; `content` can be edited as a JSON document per block.
