import rehypeShiki from "@shikijs/rehype"
import { MarkdownAsync } from "react-markdown"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import type { ShikiTransformer } from "shiki"

interface Props {
  children: string
  className?: string
}

/** Tags each block with its language, which the editor tab in globals.css prints. */
const languageTab: ShikiTransformer = {
  pre(node) {
    node.properties["data-language"] = this.options.lang
  },
}

const isExternal =(href?: string) => !!href && /^https?:\/\//.test(href)

export default async function Markdown({ children, className = "" }: Props) {
  return (
    <div
      className={`prose max-w-none prose-stone dark:prose-invert prose-headings:font-heading prose-headings:tracking-tight prose-a:decoration-1 prose-a:underline-offset-4 prose-img:rounded-md prose-img:border ${className}`}
    >
      <MarkdownAsync
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [
            rehypeShiki,
            {
              // VS Code's Dark+ token colours; globals.css adds the Dark Modern editor around them.
              theme: "dark-plus",
              transformers: [languageTab],
            },
          ],
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
