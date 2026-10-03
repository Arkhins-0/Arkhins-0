"use client"

import { MoonIcon, SunIcon } from "lucide-react"

export default function ThemeToggle() {
  const toggle = () => {
    const nextTheme = document.documentElement.classList.contains("dark") ? "light" : "dark"
    document.documentElement.classList.toggle("dark", nextTheme === "dark")
    try {
      localStorage.setItem("theme", nextTheme)
    } catch {
      // Storage blocked: the choice lasts for this page only.
    }
  }

  return (
    <button onClick={toggle} aria-label="Toggle color theme" className="size-8 rounded-md p-2 hover:bg-muted/20">
      <MoonIcon size={16} strokeWidth={1.5} className="hidden dark:block" />
      <SunIcon size={16} strokeWidth={1.5} className="block dark:hidden" />
    </button>
  )
}

/** Runs before paint so the page never flashes the wrong theme. */
export const themeScript = `(() => {
  let stored = null
  try { stored = localStorage.getItem("theme") } catch {}
  const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  const theme = stored === "dark" || stored === "light" ? stored : preferred
  document.documentElement.classList.toggle("dark", theme === "dark")
})()`
