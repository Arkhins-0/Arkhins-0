import Image from "next/image"
import NextLink from "next/link"

import SlashList from "@/components/layout/SlashList"
import { splitTitle } from "@/lib/content"
import type { Project } from "@/lib/types"

export function projectLinks(project: Project) {
  return [
    project.liveUrl && { label: "live", href: project.liveUrl },
    project.githubUrl && { label: "source", href: project.githubUrl.replace(/\.git$/, "") },
  ].filter((link): link is { label: string; href: string } => !!link)
}

export const projectMeta = (project: Project) =>
  [project.year, project.category, project.status].filter(Boolean).join(" · ")

export default function ProjectCard({ project, priority }: { project: Project; priority?: boolean }) {
  const href = `/projects/${project.slug}`
  const [name, subtitle] = splitTitle(project.title)
  const image = project.thumbnail ?? project.cover

  return (
    <article className="flex flex-col gap-y-3">
      {image && (
        <NextLink href={href} className="block" aria-label={`${name}, case study`}>
          <Image
            src={image}
            alt={`Screenshot of ${name}`}
            width={1600}
            height={1000}
            sizes="(min-width: 768px) 368px, 100vw"
            priority={priority}
            className="aspect-[16/10] w-full rounded-lg border object-cover transition-opacity hover:opacity-90"
          />
        </NextLink>
      )}

      <p className="mt-1 font-mono text-xs tracking-wide text-muted uppercase">{projectMeta(project)}</p>

      <div className="space-y-0.5">
        <h3 className="text-xl font-semibold tracking-tight">
          <NextLink href={href}>{name}</NextLink>
        </h3>
        {subtitle && <p className="text-sm text-muted italic">{subtitle}</p>}
      </div>

      <p className="line-clamp-4 leading-relaxed text-pretty">{project.summary}</p>

      <SlashList
        links={[{ label: "case study", href }, ...projectLinks(project)]}
        className="mt-1 flex items-center gap-x-3 text-sm"
      />
    </article>
  )
}
