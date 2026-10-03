"use client"

import { SlashIcon } from "lucide-react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { Fragment } from "react"

import { navLinks } from "@/data/site"

import Logo from "./Logo"
import ThemeToggle from "./ThemeToggle"

export default function Header() {
  const pathname = usePathname()

  const isCurrentPath = (href: string) => {
    if (href.includes("#")) return false
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5 lg:px-0">
      <NextLink href="/" aria-label="Home">
        <Logo />
      </NextLink>

      <nav className="flex items-center gap-x-4 text-sm">
        <ul className="flex items-center gap-x-4">
          {navLinks.map((item, i) => (
            <Fragment key={item.href}>
              {i > 0 && <SlashIcon size={8} aria-hidden />}
              <li>
                <NextLink href={item.href} aria-current={isCurrentPath(item.href) ? "page" : undefined}>
                  {item.label}
                </NextLink>
              </li>
            </Fragment>
          ))}
        </ul>

        {/* Holds the toggle's place while the header still reaches the window edge, so the links never sit under it. */}
        <span className="size-8 shrink-0 lg:hidden" aria-hidden />
      </nav>

      {/* Pinned to the window's top-right corner, so the theme can change from anywhere on the page. */}
      <div className="fixed top-2.5 right-4 z-20 rounded-md bg-background/85 backdrop-blur-sm lg:right-6">
        <ThemeToggle />
      </div>
    </header>
  )
}
