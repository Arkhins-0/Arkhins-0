import rehypeShiki from "@shikijs/rehype"
import { MarkdownAsync } from "react-markdown"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"

interface Props {
  children: string
  className?: string
}

const isExternal = (href?: string) => !!href && /^https?:\/\//.test(href)

export default async function Markdown({ children, className = "" }: Props) {
  return (
    <div
      className={`prose max-w-none prose-stone dark:prose-invert prose-headings:font-heading prose-headings:tracking-tight prose-a:decoration-1 prose-a:underline-offset-4 prose-img:rounded-md prose-img:border ${className}`}
    >
      <MarkdownAsync
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeShiki, { themes: { light: "github-light", dark: "github-dark" }, defaultColor: false }],
        ]}
        components={{
          a: ({ href, children }) =>
            isExternal(href) ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ) : (
              <a href={href}>{children}</a>
            ),
          // eslint-disable-next-line @next/next/no-img-element
          img: ({ src, alt }) => <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} loading="lazy" />,
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {children}
      </MarkdownAsync>
    </div>
  )
}

/** Drops a leading `# Title` so a document embedded under a page heading doesn't repeat it. */
export const stripTitle = (markdown: string) => markdown.replace(/^\s*#\s+[^\n]*\n/, "")
