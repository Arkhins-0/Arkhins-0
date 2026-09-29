-- Portfolio content schema (Postgres / Neon).
--
-- Read by src/lib/content.ts (projects, education) and src/lib/site.ts (site_documents); written by
-- the /admin dashboard. Apply and seed with `npm run db:setup`. Column names are snake_case here;
-- src/lib/tables.ts maps them to the camelCase row types in src/types/content.ts.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------ site documents
-- Whole JSON documents edited as a unit: `portfolio` (profile, experience, skills …),
-- `anime` (theme images, labels, section titles) and `copy` (interface strings).
-- Defaults live in src/data/{portfolio,anime,content}.json.
create table if not exists site_documents (
  key         text primary key,
  data        jsonb       not null,
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- education
create table if not exists education (
  id           uuid primary key default gen_random_uuid(),
  institution  text        not null,
  degree       text        not null,
  field        text        not null,
  score        text,                          -- "87.0%", "9.1 CGPA" … free text
  start_year   text        not null,          -- kept as text: "2022", "Jun 2022"
  end_year     text,                          -- null while current
  current      boolean     not null default false,
  description  text,
  logo         text,                          -- object-storage URL or /images/... path
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ------------------------------------------------------------------ projects
-- One row per project. Card-level fields are real columns (filterable, sortable);
-- the page itself lives in `content`, a versioned document whose blocks differ per project.
create table if not exists projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text        not null unique,      -- /projects/<slug>
  title         text        not null,
  tagline       text,                             -- one line under the title
  summary       text        not null,             -- card copy
  description   text,                             -- longer copy, used in metadata
  category      text        not null,             -- "AI/ML", "Web" … drives the filter chips
  role          text,
  year          text,
  date          text,                             -- display string, e.g. "November 2025"
  status        text        not null default 'Completed',
  featured      boolean     not null default false,
  published     boolean     not null default true,
  sort_order    integer     not null default 0,
  tags          text[]      not null default '{}',
  thumbnail     text        not null,
  cover         text,
  images        text[]      not null default '{}', -- extra stills for projects without a content doc
  github_url    text,
  live_url      text,
  markdown_file text,                             -- long-form case study (markdown), rendered inline
  content       jsonb,                            -- ShowcaseDoc (src/types/content.ts); null = generic page
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists projects_published_sort_idx on projects (published, sort_order);
create index if not exists projects_category_idx       on projects (category);
create index if not exists projects_content_gin        on projects using gin (content jsonb_path_ops);

-- -------------------------------------------------------------------- assets
-- Uploaded files (screenshots, logos, covers) once object storage is in place. `content`
-- documents reference assets by URL, so a row here is bookkeeping for the admin UI, not a join.
create table if not exists assets (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid references projects (id) on delete set null,
  storage_key  text        not null unique,       -- key inside the bucket
  url          text        not null,              -- public or proxied URL used in content
  kind         text        not null default 'image',
  width        integer,
  height       integer,
  bytes        integer,
  label        text,                              -- "dashboard-dark", free text for the picker
  created_at   timestamptz not null default now()
);

create index if not exists assets_project_idx on assets (project_id);

-- keep updated_at fresh
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists education_touch on education;
create trigger education_touch before update on education for each row execute function touch_updated_at();
drop trigger if exists projects_touch on projects;
create trigger projects_touch  before update on projects  for each row execute function touch_updated_at();
