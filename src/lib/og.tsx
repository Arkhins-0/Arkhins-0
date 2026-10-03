import "server-only"

import fs from "node:fs"
import path from "node:path"

import { ImageResponse } from "next/og"
import sharp from "sharp"

export const OG_SIZE = { width: 1200, height: 630 }

export const STONE = {
  950: "#0c0a09",
  900: "#1c1917",
  800: "#292524",
  700: "#44403c",
  600: "#57534e",
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

/**
 * The full emblem, margins trimmed and shrunk to a size the renderer handles comfortably
 * (emblem-black.png is a 10240px square), with its width at the height it will be drawn.
 */
async function emblem(src: string, drawHeight: number) {
  const { data, info } = await sharp(path.join(process.cwd(), "public", src), { limitInputPixels: false })
    .trim()
    .resize({ height: drawHeight * 2, withoutEnlargement: true })
    .png()
    .toBuffer({ resolveWithObject: true })

  return {
    src: `data:image/png;base64,${data.toString("base64")}`,
    width: Math.round((drawHeight * info.width) / info.height),
    height: drawHeight,
  }
}

/** Light is the site's own palette; inverted is the same card on the dark theme, with the white emblem. */
const HOME_THEMES = {
  light: {
    background: STONE[100],
    name: STONE[900],
    soft: STONE[600],
    foot: STONE[500],
    rule: STONE[400],
    emblem: "/brand/emblem-black.png",
  },
  inverted: {
    background: STONE[950],
    name: STONE[50],
    soft: STONE[300],
    foot: STONE[400],
    rule: STONE[600],
    emblem: "/brand/emblem-white.png",
  },
} as const

/** The home page's share card: name and roles on the left, the full emblem on the right. */
export async function homeCard(theme: keyof typeof HOME_THEMES) {
  const colors = HOME_THEMES[theme]
  const name = ["krishna", "vijay g"]
  const roles = ["designer · full-stack developer", "app & software artisan · web developer"]
  const place = "· Chennai, India"

  const [mark, fonts] = await Promise.all([
    emblem(colors.emblem, 500),
    ogFonts({ heading: `${name.join("")}arkhins.com`, italic: `hi, my name is${place}`, body: roles.join("") }),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: colors.background,
          color: colors.name,
          fontFamily: "Lora",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 88,
            top: 0,
            bottom: 0,
            width: 640,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", fontSize: 30, fontStyle: "italic", color: colors.soft }}>hi, my name is</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 6 }}>
            {name.map((line) => (
              <div
                key={line}
                style={{
                  display: "flex",
                  fontFamily: "Fraunces",
                  fontSize: 108,
                  fontWeight: 600,
                  lineHeight: 0.95,
                  letterSpacing: "-0.03em",
                }}
              >
                {line}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 28, fontSize: 26, color: colors.soft }}>
            {roles.map((line) => (
              <div key={line} style={{ display: "flex", lineHeight: 1.45 }}>
                {line}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 88,
            bottom: 56,
            display: "flex",
            alignItems: "center",
            fontSize: 24,
            color: colors.foot,
          }}
        >
          <div style={{ display: "flex", width: 56, height: 1, background: colors.rule, marginRight: 18 }} />
          <div style={{ display: "flex", fontFamily: "Fraunces", fontWeight: 600, marginRight: 18 }}>arkhins.com</div>
          <div style={{ display: "flex", fontStyle: "italic" }}>{place}</div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mark.src}
          width={mark.width}
          height={mark.height}
          alt=""
          style={{ position: "absolute", right: 84, top: (OG_SIZE.height - mark.height) / 2 }}
        />
      </div>
    ),
    { ...OG_SIZE, fonts }
  )
}
