import type { ProjectRow, ShowcaseDoc } from '@/types/content';

/** The project's guest character, whose pose pictures appear throughout its page. */
export type PageGuest = { name: string; series: string; poses: string[] };

/**
 * Every project has its own page component under pages/<slug>/Page.tsx. It receives the project row
 * and its showcase document (the row's `content`, or the generated default) and renders everything
 * from them, so edits made in /admin keep showing up whatever the design. `guest` carries the guest
 * character's pose pictures; place them with `castSpots` from ./cast so every pose is used.
 */
export type ShowcasePageProps = { project: ProjectRow; doc: ShowcaseDoc; guest?: PageGuest };
