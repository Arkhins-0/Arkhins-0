import NextLink from "next/link"

import { socialLinks } from "@/data/site"

import Logo from "./Logo"
import SlashList from "./SlashList"

export default function Footer() {
  return (
    <footer className="mx-auto flex max-w-4xl items-center justify-between border-t px-4 py-12 lg:px-0">
      <NextLink href="/" className="gap-x-3.5 no-underline">
        <Logo size={18} />
        <span className="font-heading text-lg font-semibold tracking-tight">krishna vijay g</span>
      </NextLink>

      <nav className="hidden sm:block" aria-label="Social">
        <SlashList links={socialLinks} className="flex items-center gap-x-3 text-sm" />
      </nav>
    </footer>
  )
}
