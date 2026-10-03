import { site } from "@/data/site"
import { homeCard, OG_SIZE } from "@/lib/og"

export const alt = `${site.name}: ${site.tagline}`
export const size = OG_SIZE
export const contentType = "image/png"

/** Light, on the site's own palette. The inverted card is kept as a backup at /og-inverted.png. */
export default function OpengraphImage() {
  return homeCard("light")
}
