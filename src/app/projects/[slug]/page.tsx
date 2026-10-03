import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import NextLink from "next/link"
import { notFound } from "next/navigation"

import { projectLinks, projectMeta } from "@/components/cards/ProjectCard"
import SlashList from "@/components/layout/SlashList"
import Markdown, { stripTitle } from "@/components/Markdown"
import { BlockView } from "@/components/project/Blocks"
import { getProject, getProjects, readPublicText, splitTitle } from "@/lib/content"
import { imageSize } from "@/lib/images"
import type { Project } from "@/lib/types"

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug)
  if (!project) return {}
  const [name] = splitTitle(project.title)

  return {
    title: name.toLowerCase(),
    description: project.summary,
    openGraph: { type: "article", images: project.cover ? [{ url: project.cover }] : undefined },
  }
}

/** Role, stack and dates: the showcase's own facts when it has them, otherwise built from the row. */
function factsFor(project: Project) {
  if (project.content?.hero.facts?.length) return project.content.hero.facts
  return [
    project.role && { label: "Role", value: project.role },
    project.date && { label: "Shipped", value: project.date },
    project.tags.length > 0 && { label: "Stack", value: project.tags.join(" · ") },
  ].filter((fact): fact is { label: string; value: string } => !!fact)
}

export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug)
  if (!project) notFound()

  const projects = getProjects()
  const index = projects.findIndex((p) => p.slug === project.slug)
  const previous = projects[index - 1]
  const next = projects[index + 1]

  const [name, subtitle] = splitTitle(project.title)
  const lede = project.content?.hero.lede ?? project.description ?? project.summary
  const facts = factsFor(project)
  const cover = project.cover ?? project.thumbnail
  const coverSize = cover ? imageSize(cover) : null
  const sections = project.content?.sections ?? []

  // Projects without a showcase still carry a markdown write-up.
  const caseStudy = sections.length === 0 && project.markdownFile ? readPublicText(project.markdownFile) : null

  return (
    <article className="my-18 space-y-12 sm:my-30 sm:space-y-16">
      <header className="flex flex-col gap-y-4">
        <p className="flex flex-wrap items-center gap-x-2 font-mono text-xs tracking-wide uppercase">
          <NextLink href="/projects" className="font-normal">
            projects
          </NextLink>
          <span aria-hidden>/</span>
          <span>{projectMeta(project)}</span>
        </p>
        <div className="space-y-1">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{name}</h1>
          {subtitle && <p className="text-lg text-muted italic sm:text-xl">{subtitle}</p>}
        </div>
        <p className="max-w-prose text-base/relaxed text-pretty text-muted sm:text-lg/relaxed">{lede}</p>
        {projectLinks(project).length > 0 && <SlashList links={projectLinks(project)} />}
      </header>

      {cover && coverSize && (
        <Image
          src={cover}
          alt={`${name}, cover`}
          width={coverSize.width}
          height={coverSize.height}
          sizes="(min-width: 768px) 768px, 100vw"
          priority
          className="h-auto w-full rounded-md border"
        />
      )}

      {facts.length > 0 && (
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.label} className="space-y-0.5 border-t pt-3">
              <dt className="font-mono text-xs tracking-wide text-muted uppercase">{fact.label}</dt>
              <dd className="leading-relaxed">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <hr />

      {sections.length > 0 ? (
        <div className="space-y-16 sm:space-y-20">
          {sections.map((block, i) => (
            <BlockView key={i} block={block} />
          ))}
        </div>
      ) : caseStudy ? (
        <Markdown>{stripTitle(caseStudy)}</Markdown>
      ) : (
        <p className="max-w-prose leading-relaxed text-pretty">{project.description ?? project.summary}</p>
      )}

      <nav aria-label="More projects" className="flex items-start justify-between gap-6 border-t pt-8 text-sm">
        {previous ? (
          <NextLink href={`/projects/${previous.slug}`}>
            <ArrowLeftIcon size={14} strokeWidth={1.5} aria-hidden />
            {splitTitle(previous.title)[0].toLowerCase()}
          </NextLink>
        ) : (
          <span />
        )}
        {next && (
          <NextLink href={`/projects/${next.slug}`}>
            {splitTitle(next.title)[0].toLowerCase()}
            <ArrowRightIcon size={14} strokeWidth={1.5} aria-hidden />
          </NextLink>
        )}
      </nav>
    </article>
  )
}
