import type { Metadata } from "next"

import ProjectCard from "@/components/cards/ProjectCard"
import { getProjects } from "@/lib/content"

export const metadata: Metadata = {
  title: "projects",
  description: "Production web platforms, apps and models, each with screenshots and the story behind it.",
}

export default function ProjectsPage() {
  return (
    <section className="my-18 space-y-18 sm:my-30 sm:space-y-30">
      <header className="space-y-3">
        <h1 className="text-5xl leading-none font-semibold tracking-tight">projects</h1>
        <p className="max-w-prose leading-relaxed text-pretty text-muted">
          production web platforms, apps and models, each with screenshots and the story behind it.
        </p>
      </header>

      <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
        {getProjects().map((project, i) => (
          <ProjectCard key={project.slug} project={project} priority={i < 2} />
        ))}
      </div>
    </section>
  )
}
