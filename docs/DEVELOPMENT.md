# Development guide

Next.js 14 (App Router), Tailwind CSS and Postgres on Neon. The home page is an anime-styled
one-pager; every project has its own showcase page; `/admin` edits everything.

```bash
npm install
cp .env.example .env     # fill in DATABASE_URL, S3_* / AWS_* (see below)
npm run db:setup         # apply db/schema.sql and seed empty tables from src/data
npm run dev              # http://localhost:3000
npm run build            # production build (also type-checks and lints)
```

Without `DATABASE_URL` the site still runs, reading the bundled JSON under `src/data`.

## Structure

```
db/
  schema.sql                  every table, with comments
  setup.mjs                   applies the schema, seeds empty tables (`-- --force` overwrites)
  README.md                   the data model
design/og.html                source of the share image (public/images/og.png)
src/
  app/
    layout.tsx                fonts, metadata from the profile row, JSON-LD
    page.tsx                  the home page, section by section
    projects/                 /projects index and /projects/[slug]
    admin/                    /admin/<section>
    api/admin/                rows, site documents, uploads (all behind lib/admin.ts guard)
    api/media/[...key]        streams uploads out of the private bucket
    api/submit-google-form    contact form relay
  components/
    home/                     the one-page site: Hero, Roles (role picker), About, Work,
                              Story, Skills, Proof, SideQuests, Contact, Footer, Nav;
                              primitives.tsx holds the shared bits (episode heads, petals, ribbon)
    showcase/                 project pages: Showcase renderer, blocks, primitives, fx/ (panels,
                              buttons, reveals), ProjectBar, GuestCorner, and pages/<slug>/ for
                              projects with a bespoke design
    admin/                    the dashboard: RowsEditor (tables), DocEditor (JSON documents),
                              CodeEditor (JSON with line numbers and error positions), media
  data/
    db/<table>.json           seed rows, one file per table
    anime.json                theme document: pictures, section titles, Japanese labels, credits
    copy.json                 interface strings
  lib/
    tables.ts                 the table spec: fields, casts, blank rows (drives schema, API, admin)
    content.ts                reads rows (database or seeds); the generic project page
    site.ts                   assembles the résumé, theme and copy for the pages
    db.ts, storage.ts         Neon and S3 clients; admin.ts the auth guard and revalidation
  styles/
    globals.css               Tailwind base and the dark tokens the showcase pages use
    home.css                  the home page theme (.ak-*)
    admin.css                 the dashboard
  types/content.ts            row types and the ShowcaseDoc; types/guest.ts the guest character
public/
  projects/<slug>/            each project's thumbnail, cover, screenshots and case study
  images/anime/               section art and characters/<name>/ (figure, face, poses); see its README
  images/                     shared art: skill icons, logos, badges
_legacy/                      the previous design, kept only until it is deleted (see below)
```

## Content

Rows live in Postgres; `src/data/db/*.json` are the seeds and the fallback. Edit content in
`/admin`, or edit the JSON and run `npm run db:setup -- --force` to overwrite the database.
The data model is described in `db/README.md`.

Adding a column: one line in `db/schema.sql`, the field in `src/types/content.ts`, and its
name in `src/lib/tables.ts`. The API, the seeds and the admin form pick it up from there.

## Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon connection string (HTTP driver) |
| `S3_BUCKET`, `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | uploads from /admin |
| `GOOGLE_FORM_ACTION` | where the contact form relay posts |
| `ADMIN_DISABLED=true` | turns /admin and its API off |

`.env` is git-ignored; `.env.example` lists the keys.

## Legacy

`_legacy/` holds the previous neon design (components, the accent/effects context) and its unused
assets (hero videos, old share images). Nothing imports it and TypeScript excludes it. Delete it
whenever convenient:

```bash
git rm -r _legacy
```
