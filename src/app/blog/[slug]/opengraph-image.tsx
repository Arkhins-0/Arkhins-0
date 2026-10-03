import { ImageResponse } from "next/og"

import { getBlogPost, getBlogPosts } from "@/lib/blog"
import { dataUri, OG_SIZE, ogFonts, STONE } from "@/lib/og"

export const size = OG_SIZE
export const contentType = "image/png"
export const alt = "A post from krishna vijay g"

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }))
}

/** A browser window with an address bar, the frame both sites are drawn in. */
function Window({
  url,
  bar,
  border,
  urlColor,
  style,
  children,
}: {
  url: string
  bar: string
  border: string
  urlColor: string
  style: React.CSSProperties
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        width: 440,
        height: 300,
        borderRadius: 14,
        border: `1px solid ${border}`,
        overflow: "hidden",
        boxShadow: "0 28px 70px rgba(0, 0, 0, 0.55)",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", height: 36, padding: "0 14px", background: bar }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: 999, background: c, marginRight: 6 }} />
        ))}
        <div style={{ display: "flex", marginLeft: 14, fontSize: 15, color: urlColor }}>{url}</div>
      </div>
      {children}
    </div>
  )
}

/** The quiet site in front, the loud one behind it: the two portfolios the post is about. */
function TwoPortfolios() {
  return (
    <div style={{ position: "absolute", top: 0, right: 0, width: 560, height: 630, display: "flex" }}>
      {/* ani.arkhins.com: colour, halftone, sparkles, a shout. */}
      <Window
        url="ani.arkhins.com"
        bar="#2a0f3d"
        border="#7c3aed"
        urlColor="#f0abfc"
        style={{ top: 70, left: 120, transform: "rotate(7deg)" }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            flex: 1,
            backgroundImage: "linear-gradient(135deg, #ff4fa3 0%, #a855f7 55%, #22d3ee 100%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 2px, transparent 2.5px)",
              backgroundSize: "16px 16px",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 34,
              top: 6,
              display: "flex",
              fontFamily: "Fraunces",
              fontSize: 112,
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "-0.04em",
              textShadow: "5px 5px 0 #1e0b2e",
            }}
          >
            ANI
          </div>
          <div
            style={{
              position: "absolute",
              top: 26,
              right: 30,
              display: "flex",
              padding: "10px 18px",
              borderRadius: 999,
              background: "#ffffff",
              border: "3px solid #1e0b2e",
              fontFamily: "Fraunces",
              fontSize: 30,
              fontWeight: 600,
              color: "#1e0b2e",
            }}
          >
            !?
          </div>
          {/* Sparkles: two thin diamonds crossed, drawn as shapes so no font has to carry the glyph. */}
          {[
            { top: 150, left: 300, size: 34 },
            { top: 118, left: 250, size: 18 },
            { top: 196, left: 372, size: 16 },
          ].map((s) => (
            <div key={s.left} style={{ position: "absolute", top: s.top, left: s.left, display: "flex", width: s.size, height: s.size }}>
              <div
                style={{
                  position: "absolute",
                  left: s.size * 0.4,
                  top: 0,
                  width: s.size * 0.2,
                  height: s.size,
                  borderRadius: s.size,
                  background: "#fef08a",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: s.size * 0.4,
                  width: s.size,
                  height: s.size * 0.2,
                  borderRadius: s.size,
                  background: "#fef08a",
                }}
              />
            </div>
          ))}
        </div>
      </Window>

      {/* arkhins.com: paper, serif, nothing else. */}
      <Window
        url="arkhins.com"
        bar={STONE[200]}
        border={STONE[500]}
        urlColor={STONE[700]}
        style={{ top: 290, left: 40, transform: "rotate(-5deg)" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "30px 34px",
            background: STONE[100],
            color: STONE[900],
          }}
        >
          <div style={{ display: "flex", fontSize: 17, fontStyle: "italic", color: STONE[700] }}>hi, my name is</div>
          <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 44, fontWeight: 600, letterSpacing: "-0.03em" }}>
            krishna vijay g
          </div>
          {[300, 340, 220].map((w) => (
            <div key={w} style={{ display: "flex", width: w, height: 9, borderRadius: 9, background: STONE[300], marginTop: 16 }} />
          ))}
        </div>
      </Window>
    </div>
  )
}

/** Posts without their own art get the emblem, large and faint. */
function Watermark({ emblem }: { emblem: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={emblem} width={420} height={455} alt="" style={{ position: "absolute", right: -40, top: 90, opacity: 0.12 }} />
  )
}

export default async function PostOpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getBlogPost((await params).slug)
  const emblem = dataUri("/emblem.png")
  const title = post?.title ?? "krishna vijay g"
  const description = post?.description ?? ""
  const meta = post ? `writing · ${post.formattedDate.toLowerCase()}` : "writing"
  const hasArt = post?.slug === "two-portfolios"

  const fonts = await ogFonts({
    heading: `${title}krishna vijay g!?ANIarkhins.com/blog`,
    italic: `${meta}hi, my name is`,
    body: `${description}ani.arkhins.comarkhins.com`,
  })

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
        {hasArt ? <TwoPortfolios /> : <Watermark emblem={emblem} />}

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: hasArt ? 640 : 860,
            height: "100%",
            padding: "64px 0 60px 80px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={emblem} width={74} height={80} alt="" />

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 26, fontStyle: "italic", color: STONE[400] }}>{meta}</div>
            <div
              style={{
                display: "flex",
                marginTop: 14,
                fontFamily: "Fraunces",
                fontSize: 62,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              {title}
            </div>
            {description && (
              <div style={{ display: "flex", marginTop: 22, fontSize: 25, lineHeight: 1.4, color: STONE[300] }}>
                {description}
              </div>
            )}
          </div>

          <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 24, fontWeight: 600, color: STONE[400] }}>
            arkhins.com/blog
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts }
  )
}
