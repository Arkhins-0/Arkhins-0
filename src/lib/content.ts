import "server-only"

import fs from "node:fs"
import path from "node:path"

import certifications from "@/content/certifications.json"
import education from "@/content/education.json"
import experience from "@/content/experience.json"
import languages from "@/content/languages.json"
import projects from "@/content/projects.json"

import type { Certification, Education, Experience, Language, Project } from "./types"

const bySortOrder = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder

/** "June 2025" -> a sortable timestamp. */
const toTime = (value: string) => new Date(`1 ${value}`).getTime() || 0

export const getProjects = (): Project[] =>
  (projects as unknown as Project[]).filter((p) => p.published).sort(bySortOrder)

export const getProject = (slug: string) => getProjects().find((p) => p.slug === slug) ?? null

export const getExperiences = (): Experience[] => [...(experience as Experience[])].sort(bySortOrder)

export const getEducation = (): Education[] => education as Education[]

export const getCertifications = (): Certification[] =>
  [...(certifications as Certification[])].sort((a, b) => toTime(b.date) - toTime(a.date))

export const getLanguages = (): Language[] => [...(languages as Language[])].sort(bySortOrder)

/** A markdown file shipped under /public, e.g. a project's case study. */
export function readPublicText(src: string): string | null {
  const file = path.join(process.cwd(), "public", src)
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null
}

/** "Spartan: Open-Source Motorsport Management" -> ["Spartan", "Open-Source Motorsport Management"] */
export function splitTitle(title: string): [string, string | null] {
  const at = title.indexOf(": ")
  return at === -1 ? [title, null] : [title.slice(0, at), title.slice(at + 2)]
}
