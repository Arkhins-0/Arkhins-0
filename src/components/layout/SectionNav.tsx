"use client"

import {
  AwardIcon,
  BookOpenIcon,
  BriefcaseIcon,
  FileTextIcon,
  FolderGitIcon,
  GraduationCapIcon,
  LanguagesIcon,
  type LucideIcon,
  MailIcon,
  PresentationIcon,
  UserIcon,
} from "lucide-react"
import { useEffect, useState } from "react"

/** The home page's sections, in page order, with the same icons as their headings. */
const SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "about", label: "about", icon: UserIcon },
  { id: "projects", label: "projects", icon: FolderGitIcon },
  { id: "experience", label: "experience", icon: BriefcaseIcon },
  { id: "writing", label: "writing", icon: BookOpenIcon },
  { id: "education", label: "education", icon: GraduationCapIcon },
  { id: "certifications", label: "certifications", icon: AwardIcon },
  { id: "workshops", label: "workshops", icon: PresentationIcon },
  { id: "languages", label: "languages", icon: LanguagesIcon },
  { id: "resume", label: "resume", icon: FileTextIcon },
  { id: "contact", label: "contact", icon: MailIcon },
]

/**
 * A rail on the right edge: the section you are reading shows its name beside its icon, the rest show the icon
 * alone. Only where there is room beside the column (xl and up).
 */
export default function SectionNav() {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const visible = new Map<string, boolean>()

    // A section counts as current while it crosses a thin band a little above the middle of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting)
        const current = SECTIONS.find((s) => visible.get(s.id))
        setActive(current?.id ?? null)
      },
      { rootMargin: "-40% 0px -55% 0px" }
    )

    for (const { id } of SECTIONS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    // The last section can be too short to reach the band; at the very bottom, it is the one being read.
    const onScroll = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      if (atBottom) setActive(SECTIONS[SECTIONS.length - 1].id)
    }
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return (
    <nav
      aria-label="Sections"
      className="fixed top-1/2 right-6 z-10 hidden -translate-y-1/2 xl:block 2xl:right-10"
    >
      <ul className="flex flex-col items-end gap-y-1">
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const current = id === active
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-label={label}
                aria-current={current ? "location" : undefined}
                title={label}
                className={`gap-x-2.5 rounded-md px-2 py-1.5 text-sm no-underline transition-colors ${
                  current ? "text-foreground" : "text-muted/70 hover:text-foreground"
                }`}
              >
                <span
                  className={`font-heading font-semibold tracking-tight whitespace-nowrap transition-all duration-300 ${
                    current ? "max-w-40 opacity-100" : "max-w-0 overflow-hidden opacity-0"
                  }`}
                >
                  {label}
                </span>
                <Icon size={18} strokeWidth={current ? 2 : 1.5} aria-hidden className="shrink-0" />
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
