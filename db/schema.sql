-- Portfolio content schema (Postgres / Neon).
--
-- One table per kind of résumé row, plus projects and their guest characters. Column names are the
-- snake_case form of the camelCase fields in src/types/content.ts; src/lib/tables.ts converts
-- mechanically, so a new column needs a line here, a field in the type, and nothing else.
-- Apply and seed with `npm run db:setup` (see db/setup.mjs).

create extension if not exists pgcrypto;

-- ------------------------------------------------------------ site documents
-- Whole JSON documents edited as a unit. Two remain: `anime` (theme pictures, section titles,
-- Japanese labels, credits) and `copy` (interface strings). Defaults: src/data/{anime,content}.json.
create table if not exists site_documents (
  key         text primary key,
  data        jsonb       not null,
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------------- profile
-- A single row: who the site is about, plus the search / sharing metadata.
create table if not exists profile (
  id                uuid primary key default gen_random_uuid(),
  name              text        not null,
  headline          text        not null,
  tagline           text,
  email             text        not null,
  city              text        not null,
  state             text,
  country           text        not null,
  bio               text        not null,
  roles             text[]      not null default '{}',   -- typed out in the hero
  resume_url        text,
  availability      text        not null default 'Open to opportunities',
  portrait          text,
  profile_picture   text,
  meta_title        text        not null,
  meta_description  text        not null,
  keywords          text[]      not null default '{}',
  site_url          text        not null,
  og_image          text,
  og_alt            text,
  sort_order        integer     not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- -------------------------------------------------------------- social links
create table if not exists social_links (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  username    text        not null,
  url         text        not null,
  icon        text        not null,              -- github, linkedin, instagram, google, discord, telegram
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- experience
create table if not exists experience (
  id            uuid primary key default gen_random_uuid(),
  company       text        not null,
  position      text        not null,
  location      text,
  start_date    text        not null,            -- display strings: "Sep 2024"
  end_date      text,                            -- null while current
  current       boolean     not null default false,
  type          text,                            -- Internship, Student club, ...
  description   text,
  highlights    text[]      not null default '{}',
  technologies  text[]      not null default '{}',
  logo          text,
  url           text,
  sort_order    integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------- education
create table if not exists education (
  id           uuid primary key default gen_random_uuid(),
  institution  text        not null,
  degree       text        not null,
  field        text        not null,
  score        text,                          -- "87.0%", "9.1 CGPA" ... free text
  start_year   text        not null,
  end_year     text,                          -- null while current
  current      boolean     not null default false,
  description  text,
  logo         text,
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ------------------------------------------------------------------- skills
-- Categories are the "power level" cards; each skill names its category. A skill whose category
-- has no row still shows, under a card with that name and no description.
create table if not exists skill_categories (
  id           uuid primary key default gen_random_uuid(),
  name         text        not null unique,
  description  text,
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists skills (
  id          uuid primary key default gen_random_uuid(),
  category    text        not null,
  name        text        not null,
  icon        text        not null,              -- icon name (/images/skills/<icon>.png) or a full path
  level       integer     not null default 50 check (level between 0 and 100),
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- The scrolling "equipment" belt.
create table if not exists tech_stack (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null unique,
  icon        text        not null,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------ certifications
create table if not exists certifications (
  id              uuid primary key default gen_random_uuid(),
  name            text        not null,
  issuer          text        not null,
  date            text        not null,
  category        text        not null,
  description     text,
  credential_id   text,
  credential_url  text,                         -- present = "Verified" stamp and SSR rarity
  badge           text,
  sort_order      integer     not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- -------------------------------------------------------------- side quests
create table if not exists volunteering (
  id            uuid primary key default gen_random_uuid(),
  organization  text        not null,
  role          text        not null,
  start_date    text        not null,
  end_date      text,
  current       boolean     not null default false,
  description   text,
  logo          text,
  sort_order    integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists workshops (
  id               uuid primary key default gen_random_uuid(),
  name             text        not null,
  organizer        text        not null,
  date             text        not null,
  description      text,
  certificate_url  text,
  sort_order       integer     not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ------------------------------------------------------- interests, languages
create table if not exists interests (
  id           uuid primary key default gen_random_uuid(),
  name         text        not null,
  description  text,
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists languages (
  id           uuid primary key default gen_random_uuid(),
  name         text        not null,
  proficiency  text        not null,
  level        integer     not null default 3 check (level between 1 and 5),
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ------------------------------------------------------------------ projects
-- Card-level fields are columns; the page itself is `content`, a versioned ShowcaseDoc whose
-- blocks differ per project. null = the generic page built from the row.
create table if not exists projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text        not null unique,      -- /projects/<slug>
  title         text        not null,
  tagline       text,
  summary       text        not null,             -- card copy
  description   text,                             -- longer copy, used in metadata
  category      text        not null,             -- drives the filter chips
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
  images        text[]      not null default '{}',
  github_url    text,
  live_url      text,
  markdown_file text,
  theme_color   text,                             -- browser tab / address-bar tint on the project page
  content       jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists projects_published_sort_idx on projects (published, sort_order);
create index if not exists projects_category_idx       on projects (category);

-- ---------------------------------------------------------------- characters
-- The role picker: one character per role, with the skills (by name) and project slugs it stands for.
create table if not exists cast_members (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  kana        text,
  series      text        not null,
  role        text        not null,
  pitch       text        not null,
  skills      text[]      not null default '{}',
  projects    text[]      not null default '{}',
  image       text        not null,              -- full figure
  face        text,                              -- square crop for the tabs
  color       text        not null default '#ff4f8b',
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Guest stars: a character per project, on its card and in the corner of its page.
-- project_slug null = a spare, handed to the next project without one (never repeated).
create table if not exists guests (
  id            uuid primary key default gen_random_uuid(),
  project_slug  text        unique,
  name          text        not null,
  series        text        not null,
  line          text        not null,
  image         text        not null,
  face          text,
  poses         text[]      not null default '{}',
  sort_order    integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -------------------------------------------------------------------- assets
-- Uploaded files. Documents reference assets by URL, so a row here is bookkeeping for the admin.
create table if not exists assets (
  id           uuid primary key default gen_random_uuid(),
  storage_key  text        not null unique,
  url          text        not null,
  kind         text        not null default 'image',
  width        integer,
  height       integer,
  bytes        integer,
  label        text,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------- updated_at
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

do $$
declare t text;
begin
  foreach t in array array['profile','social_links','experience','education','skill_categories','skills','tech_stack',
                           'certifications','volunteering','workshops','interests','languages','projects','cast_members','guests']
  loop
    execute format('drop trigger if exists %I on %I', t || '_touch', t);
    execute format('create trigger %I before update on %I for each row execute function touch_updated_at()', t || '_touch', t);
  end loop;
end $$;

-- Columns added after the first release.
alter table projects add column if not exists theme_color text;

-- Leftover from the single-document era.
alter table if exists assets drop column if exists project_id;
