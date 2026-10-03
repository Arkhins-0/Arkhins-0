import { DotIcon } from "lucide-react"
import NextLink from "next/link"

import type { BlogPost } from "@/lib/blog"

export default function PostCard({ post }: { post: BlogPost }) {
  const href = `/blog/${post.slug}`

  return (
    <div className="flex flex-col gap-y-4 border-t py-6 first:border-t-0 first:pt-0 last:pb-0">
      <article className="flex flex-col gap-2">
        <span className="flex items-center gap-x-1 font-mono text-xs tracking-wide uppercase">
          <time dateTime={post.date}>{post.formattedDate}</time>
          <DotIcon size={14} className="shrink-0" aria-hidden />
          <span>{post.readingTime}</span>
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">
          <NextLink href={href}>{post.title}</NextLink>
        </h2>
        <p className="max-w-prose leading-relaxed text-pretty">{post.description}</p>
      </article>
    </div>
  )
}
