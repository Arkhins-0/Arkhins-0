# arkhins.com

The simple corner of the web for Krishna Vijay G, also known as Arkhins. A Next.js port of the v3 Astro site,
carrying the projects, screenshots and résumé from the anime portfolio at [ani.arkhins.com](https://ani.arkhins.com).

```sh
npm install
npm run dev        # http://localhost:3000
npm run build      # every page is prerendered
```

## Where things live

| What | Where |
| --- | --- |
| Name, tagline, links, résumé, contact form | `src/data/site.ts` |
| About copy | `src/components/sections/About.tsx` |
| Projects, experience, certifications, languages | `src/content/*.json`, exported from the anime site's tables |
| Education | `src/content/education.json` |
| Blog posts | `src/content/blog/*.md` (front matter: `title`, `description`, `publishedAt`) |
| Résumé PDF | `assets` branch, served by jsDelivr (links in `src/data/site.ts`) |
| Workshops | `src/content/workshops.json`, exported from the anime site |
| Certificate files | `assets` branch; `src/content/documents.json` maps each certification or workshop name to its file |

## Certificate previews

Hovering a certification or workshop row flips in a preview of the certificate; clicking it opens the file from the
`assets` branch in the browser's viewer, as the résumé does. To add one:

1. Put the PDF (or image) in the sibling `assets` folder as `<section>/<slug>.pdf`, named like the row
   (`certifications/jlpt-n3.pdf`, `workshops/fundamentals-of-laravel.pdf`), then commit and push the `assets` branch.
2. Map the row's exact `name` to that path in `src/content/documents.json`.
3. Run `npm run previews` to render `public/<section>/previews/<slug>.webp` from its first page.

## `public/`, laid out like the page

```
public/
├── brand/            emblem.png: header, footer, share images
├── projects/<slug>/  thumbnail.png, cover.png, mock/{desktop,mobile}/*, case-study.md
├── experience/       one logo per employer, named after it
├── education/        one logo per institution
├── certifications/   one badge per issuer, named after it; previews/ holds the rendered certificates
└── workshops/        previews/ of the workshop certificates
```

Names are lowercase and say whose mark it is (`nptel-iot.png`, `tt-infotech.png`), not what it was called in the
anime site. When the JSON is copied over from there, `src/lib/content.ts` maps its old `/images/...` paths onto
these, so a fresh copy still finds every logo.

Project pages render each project's showcase document (`content` in `projects.json`) as plain reading:
overview, stats, tables, steps, galleries and phone screens. Screenshots that have light and dark captures follow
the site theme. Projects without a showcase fall back to their `markdownFile` case study.

To refresh the data after editing it in the anime site's admin, run `npm run db:pull` there and copy
`src/data/db/{projects,experience,certifications,languages}.json` into `src/content/`.
