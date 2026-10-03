import type { MetadataRoute } from "next"

import { site } from "@/data/site"
import { getBlogPosts } from "@/lib/blog"
import { getProjects } from "@/lib/content"

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, site.url).toString()

  return [
    { url: url("/"), changeFrequency: "monthly", priority: 1 },
    { url: url("/projects"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/blog"), changeFrequency: "weekly", priority: 0.7 },
    ...getProjects().map((p) => ({ url: url(`/projects/${p.slug}`), priority: 0.6 })),
    ...getBlogPosts().map((post) => ({ url: url(`/blog/${post.slug}`), lastModified: post.publishedAt, priority: 0.5 })),
  ]
}
