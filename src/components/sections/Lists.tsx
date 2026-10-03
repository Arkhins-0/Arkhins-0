import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  AwardIcon,
  BookOpenIcon,
  BriefcaseIcon,
  DownloadIcon,
  FileTextIcon,
  FolderGitIcon,
  GraduationCapIcon,
  LanguagesIcon,
} from "lucide-react"
import NextLink from "next/link"

import PostCard from "@/components/cards/PostCard"
import ProjectCard from "@/components/cards/ProjectCard"
import { CertificationCard, EducationCard, ExperienceCard, LanguageCard } from "@/components/cards/ResumeCards"
import SectionHeading from "@/components/SectionHeading"
import { resume } from "@/data/site"
import { getRecentBlogPosts } from "@/lib/blog"
import { getCertifications, getEducation, getExperiences, getLanguages, getProjects } from "@/lib/content"

export function Writing() {
  return (
    <section id="writing" className="space-y-6">
      <SectionHeading icon={BookOpenIcon}>writing</SectionHeading>
      <div>
        {getRecentBlogPosts().map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <NextLink href="/blog">
        all posts
        <ArrowRightIcon size={14} strokeWidth={1.5} className="inline" aria-hidden />
      </NextLink>
    </section>
  )
}

export function Projects() {
  return (
    <section id="projects" className="space-y-6">
      <SectionHeading icon={FolderGitIcon}>projects</SectionHeading>
      <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
        {getProjects().map((project, i) => (
          <ProjectCard key={project.slug} project={project} priority={i < 2} />
        ))}
      </div>
    </section>
  )
}

export function Experience() {
  return (
    <section id="experience" className="space-y-6">
      <SectionHeading icon={BriefcaseIcon}>experience</SectionHeading>
      <div>
        {getExperiences().map((item) => (
          <ExperienceCard key={`${item.company}-${item.startDate}`} experience={item} />
        ))}
      </div>
    </section>
  )
}

export function Education() {
  return (
    <section id="education" className="space-y-6">
      <SectionHeading icon={GraduationCapIcon}>education</SectionHeading>
      <div>
        {getEducation().map((item) => (
          <EducationCard key={item.degree} education={item} />
        ))}
      </div>
    </section>
  )
}

export function Certifications() {
  return (
    <section id="certifications" className="space-y-6">
      <SectionHeading icon={AwardIcon}>certifications</SectionHeading>
      <div>
        {getCertifications().map((item) => (
          <CertificationCard key={item.name} certification={item} />
        ))}
      </div>
    </section>
  )
}

export function Languages() {
  return (
    <section id="languages" className="space-y-6">
      <SectionHeading icon={LanguagesIcon}>languages</SectionHeading>
      <div>
        {getLanguages().map((item) => (
          <LanguageCard key={item.name} language={item} />
        ))}
      </div>
    </section>
  )
}

export function Resume() {
  const { filename, detail, openUrl, downloadUrl } = resume

  return (
    <section id="resume" className="space-y-8">
      <SectionHeading icon={FileTextIcon}>resume</SectionHeading>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <p className="max-w-lg leading-relaxed text-pretty">
          Looking for a printable format or want to know more about my experience, skills and certifications?
        </p>
        <div className="flex flex-col items-start gap-y-3 sm:items-end">
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-x-6 rounded-md border px-5 py-3 no-underline! hover:border-foreground"
          >
            <div className="space-y-1">
              <span className="block font-heading text-base leading-none font-semibold tracking-tight">{filename}</span>
              <span className="block text-xs leading-none text-muted uppercase">{detail}</span>
            </div>
            <ArrowUpRightIcon size={20} strokeWidth={1.5} aria-hidden />
          </a>
          <a href={downloadUrl} className="text-sm">
            download
            <DownloadIcon size={14} strokeWidth={1.5} aria-hidden />
          </a>
        </div>
      </div>
    </section>
  )
}
