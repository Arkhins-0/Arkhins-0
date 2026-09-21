# Hygieia · screenshot pack

Captured 21 Sep 2026 from the Hygieia app running locally (Next.js frontend in dev mode, Flask backend
with the real models), against an isolated copy of the local SQLite database. The project's own database
and files were not modified.

| Folder | Viewport (CSS px) | Pixel density | Notes |
|---|---|---|---|
| `desktop/` | 1440 × 900 | 2× | `*-viewport` files are one screen; the rest are full-page scroll captures |
| `mobile/` | 390 × 844 (iPhone 14 class) | 3× | full-page scroll captures |

Every screen exists in `-light` and `-dark`. Screens: landing, login, register, about, dashboard,
analysis hub, heart / skin / breast forms, heart / diabetes / breast results (with the generated AI
summary), history, Dr. Hygieia chat (a real Gemini conversation), profile, settings, docs, model docs,
admin blockchain verification (chain valid) and admin user management.

All people on screen are fictional demo data (Walter Chan, Julie Chan). The owner's own dev account
was aliased in the rendered page before each capture. The benchmarks page was left out because the
local dataset has no benchmark rows, and the mobile chat view was left out because the app's chat
layout does not yet adapt to phone width.

The showcase at `../showcase/index.html` is built from this set; the older 1000 px mock-ups
(`../screen-*.png`) remain for the React case-study page.
