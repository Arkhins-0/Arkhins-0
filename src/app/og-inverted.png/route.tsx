import { homeCard } from "@/lib/og"

export const dynamic = "force-static"

/**
 * Backup share card: the home card in inverted colours (dark background, white emblem).
 * Nothing links to it; to use it, call homeCard("inverted") in src/app/opengraph-image.tsx.
 */
export function GET() {
  return homeCard("inverted")
}
