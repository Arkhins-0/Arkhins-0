import { ArrowRightIcon } from "lucide-react"
import NextLink from "next/link"

export default function NotFound() {
  return (
    <section className="my-18 space-y-6 sm:my-30">
      <h1 className="text-5xl leading-none font-semibold tracking-tight">not found</h1>
      <p className="max-w-prose leading-relaxed text-pretty text-muted">
        That page isn&apos;t here. It may have moved, or it never existed.
      </p>
      <NextLink href="/">
        back home
        <ArrowRightIcon size={14} strokeWidth={1.5} aria-hidden />
      </NextLink>
    </section>
  )
}
