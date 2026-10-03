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
| Project screenshots and case studies | `public/projects/<slug>/` |

Project pages render each project's showcase document (`content` in `projects.json`) as plain reading:
overview, stats, tables, steps, galleries and phone screens. Screenshots that have light and dark captures follow
the site theme. Projects without a showcase fall back to their `markdownFile` case study.

To refresh the data after editing it in the anime site's admin, run `npm run db:pull` there and copy
`src/data/db/{projects,experience,certifications,languages}.json` into `src/content/`.
