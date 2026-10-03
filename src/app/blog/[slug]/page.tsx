import { DotIcon } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import Markdown from "@/components/Markdown"
import { personEntity, site } from "@/data/site"
import { getBlogPost, getBlogPosts } from "@/lib/blog"

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPost((await params).slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.description,
    openGraph: { type: "article", publishedTime: post.date },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = getBlogPost((await params).slug)
  if (!post) notFound()

  const url = new URL(`/blog/${post.slug}`, site.url).toString()
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    author: personEntity,
    publisher: personEntity,
    datePublished: post.date,
    url,
    mainEntityOfPage: url,
    inLanguage: site.locale,
  }

  return (
    <article className="my-18 space-y-8 sm:my-30 sm:space-y-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <header className="flex flex-col gap-y-4">
        <p className="flex items-center gap-x-1 font-mono text-xs tracking-wide uppercase">
          <time dateTime={post.date}>{post.formattedDate}</time>
          <DotIcon size={14} className="shrink-0" aria-hidden />
          <span>{post.readingTime}</span>
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{post.title}</h1>
        <p className="max-w-prose text-base/relaxed text-pretty text-muted sm:text-lg/relaxed">{post.description}</p>
      </header>

      <hr />

      <Markdown>{post.body}</Markdown>
    </article>
  )
}
