import type { Metadata } from "next"

import PostCard from "@/components/cards/PostCard"
import { getBlogPosts } from "@/lib/blog"

export const metadata: Metadata = {
  title: "blog",
  description: "notes on design, code, models and the web.",
}

export default function BlogPage() {
  return (
    <section className="my-18 space-y-18 sm:my-30 sm:space-y-30">
      <header className="space-y-3">
        <h1 className="text-5xl leading-none font-semibold tracking-tight">blog</h1>
        <p className="max-w-prose leading-relaxed text-pretty text-muted">notes on design, code, models and the web.</p>
      </header>

      <div>
        {getBlogPosts().map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  )
}
