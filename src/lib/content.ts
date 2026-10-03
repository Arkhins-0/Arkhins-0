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

/**
 * /public is laid out like the page (brand, projects, experience, education, certifications), but the JSON is
 * copied from the anime site, which keeps its logos under /images. Old paths from a fresh copy are moved here.
 */
const MOVED_ASSETS: Record<string, string> = {
  "/projects/ctr/logo.png": "/experience/chennai-turbo-riders.png",
  "/images/companies/gdsc.png": "/experience/gdsc.png",
  "/images/companies/teachnook.png": "/experience/teachnook.png",
  "/images/companies/tt.png": "/experience/tt-infotech.png",
  "/images/education/Bharath.png": "/education/bharath.png",
  "/images/education/SSV.png": "/education/ssv.png",
  "/images/certifications/ai.png": "/certifications/edunet-microsoft.png",
  "/images/certifications/aicte.png": "/certifications/aicte-eduskills.png",
  "/images/certifications/bigdata.png": "/certifications/nptel-big-data.png",
  "/images/certifications/cdac.png": "/certifications/cdac-iit-roorkee.png",
  "/images/certifications/google-ux.png": "/certifications/google-ux.png",
  "/images/certifications/guvi.png": "/certifications/guvi.png",
  "/images/certifications/iot.png": "/certifications/nptel-iot.png",
  "/images/certifications/japan.svg": "/certifications/jlpt.svg",
  "/images/certifications/teachnook.png": "/certifications/teachnook.png",
  "/images/certifications/wipro.png": "/certifications/wipro.png",
}

const asset = (src: string | null) => (src ? (MOVED_ASSETS[src] ?? src) : src)

/** "June 2025" -> a sortable timestamp. */
const toTime = (value: string) => new Date(`1 ${value}`).getTime() || 0

export const getProjects = (): Project[] =>
  (projects as unknown as Project[]).filter((p) => p.published).sort(bySortOrder)

export const getProject = (slug: string) => getProjects().find((p) => p.slug === slug) ?? null

export const getExperiences = (): Experience[] =>
  (experience as Experience[]).map((e) => ({ ...e, logo: asset(e.logo) })).sort(bySortOrder)

export const getEducation = (): Education[] =>
  (education as Education[]).map((e) => ({ ...e, logo: asset(e.logo) ?? e.logo }))

export const getCertifications = (): Certification[] =>
  (certifications as Certification[])
    .map((c) => ({ ...c, badge: asset(c.badge) }))
    .sort((a, b) => toTime(b.date) - toTime(a.date))

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
