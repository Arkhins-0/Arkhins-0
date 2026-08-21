# Krishna Vijay G — Portfolio

A dark, glass-and-neon personal site built with Next.js 14 (App Router), Tailwind CSS
and Framer Motion. Content is data-driven; the visual system lives in CSS variables.

Live: **arkhins.com**

---

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

---

## Add your portrait

The hero composites a **transparent cut-out PNG** of you — rim glow, duotone echo
and a scan sweep are all masked from that same file.

```
public/images/hero/portrait.png
```

Guidance:

- Transparent background, subject cropped tight, **facing/lit from the left**
  (the accent echo is offset to the right).
- Roughly 3:4, at least 1200 px tall, ideally under ~600 KB.
- Until the file exists the hero shows a dashed "portrait slot" placeholder — the
  layout does not break, and nothing else needs changing.

The path is configurable at `basics.portrait` in `src/data/portfolio.json`.

---

## Structure

```
src/
  app/
    layout.tsx                    root shell: fonts, providers, backdrop, boot
    page.tsx                      the one-page site
    globals.css                   the whole design system
    projects/
      page.tsx                    /projects — archive index
      hygieia/                    one folder per case study
        page.tsx                  /projects/hygieia
        layout.tsx                per-project metadata
        hygieia.json              all of that project's copy and data
    api/submit-google-form/       contact form relay
  components/
    fx/                           design primitives (see below)
    layout/                       Navigation, Footer, Boot, ProjectBar
    sections/                     Hero, About, Projects, Experience,
                                  Skills, Certifications, Beyond, Contact
  context/UIContext.tsx           accent palette + effects toggle
  data/portfolio.json             all site content
public/
  projects/<slug>/                per-project assets, co-located
  images/                         shared assets (skills, certs, logos, hero)
```

### Adding a project

1. Add an entry to `projects` in `src/data/portfolio.json`. It shows up in the
   home index and on `/projects` automatically.
2. Drop its assets in `public/projects/<slug>/`.
3. For a full case study, copy `src/app/projects/hygieia/` to
   `src/app/projects/<slug>/`, swap the JSON, and set `"pageUrl":
   "/projects/<slug>"` on the project entry. Without `pageUrl` the card links
   straight to the live site or repo instead.

`/hygieia` permanently redirects to `/projects/hygieia`, so old links keep working.

---

## Design system

Everything is driven by CSS custom properties in `src/app/globals.css`.

**Palette** — four neon hues (`rose`, `cyan`, `lime`, `violet`). One is promoted
to `--accent` at a time via `data-accent` on `<html>`; the swatch control in the
nav switches it live and the whole site recolours. `--accent-2` is the paired
secondary.

**Effects budget** — `--fx` is `1` or `0`. Every glow, blur, sweep and particle
multiplies its intensity by it, so the lightning-bolt toggle in the nav (and
`prefers-reduced-motion`) genuinely turns the spectacle down rather than just
stopping one animation.

**Primitives** (`src/components/fx/`)

| | |
|---|---|
| `Backdrop` | fixed stack: vignette → aurora → grid → flow field → halftone → grain |
| `FlowField` | canvas particles advected through a sine flow field, additive neon trails |
| `Panel` | the structural surface — 1px gradient edge clipped to a chamfer, frosted fill inset |
| `SectionHead` | the schematic sheet header every band opens with |
| `Scramble` | decode-on-scroll heading text |
| `Reveal` / `Stack` | scroll-entrance wrappers |
| `Magnetic`, `Cursor`, `Ticker`, `NeonButton`, `ScrollRail` | interaction bits |

**Type** — Syne (display), Space Grotesk (UI), JetBrains Mono (HUD labels).

The site is dark-only by design; neon over glass has no honest light-mode
counterpart.

---

## The boot screen

`ARKHINS` is an exact anagram of `KRISHNA`. The intro holds the handle, glitches
it, then flies the same seven letter elements into their new slots — no
cross-fade, the letters actually travel. Runs once per tab in production, and on
every refresh in development.

---

## Contact form

Submissions relay to a Google Form. Two paths, picked automatically:

- `POST /api/submit-google-form` when a server runtime is available (Vercel).
- A direct browser POST into a hidden iframe when `NEXT_PUBLIC_GOOGLE_FORM_DIRECT=true`,
  for static hosting.

Entry IDs live in both `src/app/api/submit-google-form/route.ts` and
`src/components/sections/Contact.tsx` — keep them in sync.

`.env`:

```
GOOGLE_FORM_ACTION=...
NEXT_PUBLIC_GOOGLE_FORM_ACTION=...
NEXT_PUBLIC_GOOGLE_FORM_DIRECT=true
```

---

## Deploy

Vercel picks up the App Router build as-is. `npm run predeploy` + `npm run deploy`
publishes to GitHub Pages, but note the contact API route needs a server runtime —
on a static host, keep `NEXT_PUBLIC_GOOGLE_FORM_DIRECT=true`.
