import "server-only"

import fs from "node:fs"
import path from "node:path"

import matter from "gray-matter"
import getReadingTime from "reading-time"

import { formatDate } from "./date"

export interface BlogPost {
  slug: string
  title: string
  description: string
  publishedAt: Date
  body: string
  date: string
  formattedDate: string
  readingTime: string
}

const BLOG_DIR = path.join(process.cwd(), "src/content/blog")

function readPost(file: string): BlogPost {
  const { data, content } = matter(fs.readFileSync(path.join(BLOG_DIR, file), "utf8"))
  const publishedAt = new Date(data.publishedAt)

  return {
    slug: file.replace(/\.mdx?$/, ""),
    title: String(data.title),
    description: String(data.description),
    publishedAt,
    body: content,
    date: publishedAt.toISOString(),
    formattedDate: formatDate(publishedAt),
    readingTime: getReadingTime(content).text,
  }
}

export function getBlogPosts(): BlogPost[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => /\.mdx?$/.test(file))
    .map(readPost)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
}

export const getRecentBlogPosts = (limit = 3) => getBlogPosts().slice(0, limit)

export const getBlogPost = (slug: string) => getBlogPosts().find((post) => post.slug === slug) ?? null
