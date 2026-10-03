import "server-only"

import fs from "node:fs"
import path from "node:path"

export const OG_SIZE = { width: 1200, height: 630 }

export const STONE = {
  950: "#0c0a09",
  900: "#1c1917",
  800: "#292524",
  700: "#44403c",
  500: "#78716c",
  400: "#a8a29e",
  300: "#d6d3d1",
  200: "#e7e5e4",
  100: "#f5f5f4",
  50: "#fafaf9",
}

/** A Google font cut down to the glyphs used; null if the fetch fails, so the build falls back to the built-in face. */
async function loadFont(query: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${query}&text=${encodeURIComponent(text)}`).then(
      (r) => r.text()
    )
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1]
    return url ? await fetch(url).then((r) => r.arrayBuffer()) : null
  } catch {
    return null
  }
}

/** The site's three faces, subset to whatever text the image actually draws. */
export async function ogFonts({ heading, italic, body }: { heading: string; italic: string; body: string }) {
  const [fraunces, loraItalic, lora] = await Promise.all([
    loadFont("Fraunces:wght@600", heading),
    loadFont("Lora:ital@1", italic),
    loadFont("Lora", body),
  ])

  return [
    fraunces && { name: "Fraunces", data: fraunces, weight: 600 as const, style: "normal" as const },
    loraItalic && { name: "Lora", data: loraItalic, weight: 400 as const, style: "italic" as const },
    lora && { name: "Lora", data: lora, weight: 400 as const, style: "normal" as const },
  ].filter((font) => !!font)
}

/** A file under /public as a data URI, since the image renderer can't fetch relative paths. */
export function dataUri(src: string) {
  const file = path.join(process.cwd(), "public", src)
  return `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`
}
