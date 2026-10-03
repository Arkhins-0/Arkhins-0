import fs from "node:fs"
import path from "node:path"

import { ImageResponse } from "next/og"

import { site } from "@/data/site"

export const alt = `${site.name}: ${site.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

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

const dataUri = (src: string) => {
  const file = path.join(process.cwd(), "public", src)
  return `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`
}

/** Three recent builds, fanned like prints on a desk. Back to front. */
const SHOTS = [
  { src: "/projects/bookisham/thumbnail.png", rotate: 9, top: 70, left: 700 },
  { src: "/projects/ctr-unified/thumbnail.png", rotate: -7, top: 300, left: 640 },
  { src: "/projects/spartan/thumbnail.png", rotate: 2, top: 180, left: 610 },
]

const STONE = { 950: "#0c0a09", 700: "#44403c", 400: "#a8a29e", 300: "#d6d3d1", 50: "#fafaf9" }

export default async function OpengraphImage() {
  const name = ["krishna", "vijay g"]
  const roles = ["designer · full-stack developer", "ai/ml practitioner · web developer"]

  const [fraunces, loraItalic, lora] = await Promise.all([
    loadFont("Fraunces:wght@600", `${name.join("")}arkhins.com`),
    loadFont("Lora:ital@1", "hi, my name is"),
    loadFont("Lora", roles.join("")),
  ])
  const fonts = [
    fraunces && { name: "Fraunces", data: fraunces, weight: 600 as const, style: "normal" as const },
    loraItalic && { name: "Lora", data: loraItalic, weight: 400 as const, style: "italic" as const },
    lora && { name: "Lora", data: lora, weight: 400 as const, style: "normal" as const },
  ].filter((font) => !!font)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: STONE[950],
          color: STONE[50],
          fontFamily: "Lora",
        }}
      >
        {SHOTS.map((shot) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={shot.src}
            src={dataUri(shot.src)}
            width={520}
            height={325}
            alt=""
            style={{
              position: "absolute",
              top: shot.top,
              left: shot.left,
              transform: `rotate(${shot.rotate}deg)`,
              borderRadius: 12,
              border: `1px solid ${STONE[700]}`,
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
            }}
          />
        ))}

        {/* Fades the prints into the page so the type always sits on solid ground. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background: `linear-gradient(90deg, ${STONE[950]} 0%, ${STONE[950]} 44%, rgba(12, 10, 9, 0.55) 62%, rgba(12, 10, 9, 0) 80%)`,
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 620,
            padding: "72px 0 64px 88px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUri("/emblem.png")} width={46} height={50} alt="" />

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontStyle: "italic", color: STONE[300] }}>hi, my name is</div>
            {name.map((line) => (
              <div
                key={line}
                style={{ fontFamily: "Fraunces", fontSize: 104, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 0.98 }}
              >
                {line}
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", marginTop: 26, fontSize: 26, color: STONE[300] }}>
              {roles.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </div>

          <div style={{ fontFamily: "Fraunces", fontSize: 26, fontWeight: 600, color: STONE[400] }}>arkhins.com</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  )
}
