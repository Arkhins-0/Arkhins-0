# Scholar Track showcase page

Standalone showcase for the Scholar Track project, served statically from `public/` at
`/projects/scholar-track/index.html` and linked from the project entry in `src/data/portfolio.json`
(`showcaseUrl`). Plain HTML, CSS and JavaScript with no build step and no dependencies; fonts come
from Google Fonts, everything else is relative. The Hygieia showcase at
`public/projects/hygieia/showcase/` reuses the same stylesheet and script with a theme block appended.

```
scholar-track/
  index.html      page structure and copy
  styles.css      layout, 3D stage, tilted cards, compare slider, phones, gallery, lightbox
  script.js       parallax tilt, reveal on scroll, compare slider, phone auto-scroll, lightbox
  images/         25 curated screenshots (2x / 3x), emblem, hero photograph  (~12 MB)
  cover.png       4K scholar overview, used as the project header image
  thumbnail.png   scholar overview, used on the project card
  logo.png        emblem
  case-study.md   written case study, opened by the "Case notes" reader
```

## Where it is wired

- `src/data/portfolio.json`: the `scholar-track` project entry points `thumbnail`, `images`, `markdownFile`
  and `showcaseUrl` at this folder.
- `src/components/sections/Projects.tsx` and `src/app/projects/page.tsx` render a "Showcase" action and badge
  for any project that has `showcaseUrl`.

## Preview

Run the portfolio (`npm run dev`) and open `/projects/scholar-track/index.html`, or open `index.html`
straight from disk.

If you prefer to embed the sections in a React page later, the markup is plain and the CSS is scoped
by class names only, so it can be pasted into a component and the `images/` folder kept under `public/`.

All people shown in the screenshots are fictional demo data.
