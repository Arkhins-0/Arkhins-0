# Scholar Track: PhD Scholar Tracking Portal

## Summary

Scholar Track is a web portal that carries a PhD scholar from admission to degree through four Doctoral Committee (DC) reviews and a degree stage. Every milestone has a fixed set of required documents and a two-step approval: the supervisor first, then the Research & Development (R&D) section. The portal replaces paper files and email threads with one source of truth: server-enforced stage gating, mandatory remarks on every rejection, an audit row for every transition, and templated email at each step.

**Highlights**
- **Three roles, one portal:** scholar, supervisor (also co-supervisor for other scholars) and the R&D section.
- **Five gated milestones:** DC1 to DC4 and Degree, each unlocked only when the previous meeting is recorded.
- **Twelve notification emails** covering onboarding, reviews, allocations, meetings, degree issuance and password flows.
- **GitHub-inspired interface** with first-class light and dark themes and a serif editorial voice.

---

## 1. The problem

Research offices track dozens of scholars across multi-year programmes. Documents arrive by email, approvals happen in person, and nobody can answer "what is this scholar waiting on?" without opening a folder. Scholars, in turn, rarely know which step is next or why an application was returned.

## 2. The workflow

```
PROPOSAL → DC1 → DC2 → DC3 → DC4 → DEGREE → COMPLETED

per milestone:
DRAFT → SUBMITTED → SUPERVISOR_APPROVED → RND_APPROVED → MEETING_COMPLETED (or DEGREE_ISSUED)
              ↖ SUPERVISOR_REJECTED / RND_REJECTED → scholar revises and resubmits
```

1. **Onboarding.** The R&D section generates a one-time portal key; the scholar registers with it.
2. **Proposal.** Title, research domain and a proposed-work PDF, then a request for a supervisor.
3. **Allocation.** R&D allocates a supervisor from the staff pool; this locks the proposal and opens DC1.
4. **Committee.** The supervisor picks two to five DC members from a curated pool and, optionally, a co-supervisor.
5. **Milestones.** The scholar uploads the required documents and submits; the supervisor approves or returns with remarks; R&D gives the final decision; R&D records the meeting, which unlocks the next stage.
6. **Degree.** The last stage ends with the degree issued and a completion record on the scholar's overview.

## 3. Roles and screens

- **Scholar overview:** a "next step" alert, a six-stage journey list with a completion meter, supervision and committee panels, research title.
- **Milestone page:** one upload slot per required document with progress, a submit gate that lists what is missing, and a four-step tracker with dates and remarks.
- **Supervisor scholar page:** proposal, committee picker, co-supervisor, every application with its documents, and the approve/return form.
- **R&D overview:** queue tiles with live counters, scholars-by-stage chart, recent activity; dedicated pages for supervisor requests, approvals, meetings, the scholar register (filterable, CSV export), staff, DC members and portal keys.

## 4. Design system

The interface borrows GitHub's calm, information-dense language: hairline borders, quiet surfaces, a single blue accent, a green primary action and semantic state colours (success, attention, danger, done). Headings are set in Source Serif 4 for an academic tone, the interface in Inter, and keys and codes in JetBrains Mono. Light and dark are generated from the same tokens, follow the system by default and can be toggled from the header. Contextual alerts use soft tinted cards with a circular icon badge, a title and a description, and are dismissible.

## 5. Architecture

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript), server components for every data page |
| Data | Neon Postgres via Prisma; pooled connection for the app, direct connection for migrations |
| Auth | NextAuth credentials with JWT sessions, role-based middleware |
| Files | S3-compatible object storage (Neon); presigned browser uploads, authenticated streaming proxies |
| Email | Brevo transactional API with HTML and text templates |
| Validation | Zod on client and server |
| Hosting | Vercel |

**Uploads** are two-step: the server mints a five-minute presigned PUT URL only for the scholar who owns an editable target, the browser uploads straight to the bucket, and the server verifies the object (existence, type, size) with HeadObject before recording it. Only object keys are stored; files are read through proxies that check the viewer's relationship to the scholar.

## 6. Security model

- Server-side stage gating is the single source of truth; the UI only mirrors it.
- Portal keys and password-reset tokens are stored as SHA-256 hashes; reset links are single-use, expire in one hour and are rate limited.
- Passwords use bcrypt (cost 12); accounts lock for fifteen minutes after five failed sign-ins; staff accounts start with a temporary password that must be changed on first login.
- Strict security headers and a Content-Security-Policy that allows connections only to the app and the storage origin.
- Every transition writes an audit row with actor, action, entity and details.

## 7. Outcome

A scholar can always see the next step and the reason for any return. Supervisors and the R&D section see exactly what is waiting for them, with counters in the navigation. The office keeps a complete, searchable record of every scholar's journey, from portal key to degree.

*All people shown in the screenshots are fictional demo data.*
