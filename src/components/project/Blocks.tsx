import { CheckIcon, SlashIcon } from "lucide-react"
import { Fragment } from "react"

import Markdown, { stripTitle } from "@/components/Markdown"
import ThemedImage from "@/components/ThemedImage"
import { readPublicText } from "@/lib/content"
import type { Block, Head, ThemedImage as Themed } from "@/lib/types"

import Lightbox, { type LightboxItem } from "./Lightbox"

function SectionHead({ head }: { head: Head }) {
  return (
    <header className="space-y-2">
      <p className="font-mono text-xs tracking-wide text-muted uppercase">
        {head.index} · {head.label}
      </p>
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {head.title} {head.accentWord && <em className="font-medium">{head.accentWord}</em>}
      </h2>
      {head.lede && <p className="max-w-prose leading-relaxed text-pretty text-muted">{head.lede}</p>}
    </header>
  )
}

function Ticks({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-x-2.5 text-sm leading-relaxed">
          <CheckIcon size={14} strokeWidth={1.5} className="mt-1 shrink-0 text-muted" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item} className="rounded-sm border px-2 py-0.5 font-mono text-xs">
          {item}
        </li>
      ))}
    </ul>
  )
}

/** Every desktop capture sits in the same 16:10 frame, every phone capture in the same phone-shaped one. */
const WIDE = "aspect-[16/10] rounded-md border"
const TALL = "aspect-[9/19.5] rounded-xl border"

const FULL_SIZES = "(min-width: 1280px) 1200px, 94vw"

function zoomable(image: Themed, thumbSizes: string, phone = false): LightboxItem {
  return {
    alt: image.alt,
    caption: image.caption ?? (phone ? image.alt : undefined),
    thumb: <ThemedImage image={image} sizes={thumbSizes} />,
    full: (
      <ThemedImage
        image={image}
        sizes={phone ? "400px" : FULL_SIZES}
        className={phone ? "mx-auto max-w-sm rounded-xl border" : "rounded-md border"}
      />
    ),
  }
}

function Figure({ image }: { image: Themed }) {
  return <Lightbox items={[zoomable(image, "(min-width: 768px) 768px, 100vw")]} frameClassName={WIDE} />
}

function Phones({ items }: { items: Themed[] }) {
  return (
    <Lightbox
      items={items.map((image) => zoomable(image, "(min-width: 640px) 180px, 45vw", true))}
      className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      frameClassName={TALL}
      captionClassName="text-center text-xs"
    />
  )
}

export function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "stats":
      return (
        <dl className="grid grid-cols-2 gap-6 border-y py-6 sm:grid-cols-4">
          {block.items.map((item) => (
            <div key={item.label} className="space-y-1">
              <dt className="font-heading text-3xl font-semibold tracking-tight">{item.value}</dt>
              <dd className="text-sm text-muted">{item.label}</dd>
            </div>
          ))}
        </dl>
      )

    case "marquee":
      return (
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tracking-wide text-muted uppercase">
          {block.items.map((item, i) => (
            <Fragment key={item}>
              {i > 0 && <SlashIcon size={8} aria-hidden />}
              <li>{item}</li>
            </Fragment>
          ))}
        </ul>
      )

    case "overview":
      return (
        <section className="space-y-6">
          <SectionHead head={block.head} />
          <div className="max-w-prose space-y-4 leading-relaxed text-pretty">
            {block.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {block.features && (
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {block.features.map((f) => (
                <div key={f.title} className="space-y-1 border-t pt-4">
                  <dt className="font-heading text-lg font-semibold tracking-tight">{f.title}</dt>
                  <dd className="text-sm leading-relaxed text-pretty text-muted">{f.description}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      )

    case "cards":
      return (
        <section className="space-y-6">
          <SectionHead head={block.head} />
          <div>
            {block.items.map((item) => (
              <article
                key={item.title}
                className="flex items-start justify-between gap-4 border-t py-4 first:border-t-0 first:pt-0 last:pb-0"
              >
                <div className="space-y-0.5">
                  <h3 className="font-body font-medium">{item.title}</h3>
                  <p className="text-sm text-muted">{[item.subtitle, item.meta].filter(Boolean).join(" · ")}</p>
                </div>
                {item.value && (
                  <div className="shrink-0 text-right">
                    <p className="font-heading text-xl font-semibold tracking-tight">{item.value}</p>
                    {item.valueLabel && <p className="text-xs text-muted italic">{item.valueLabel}</p>}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )

    case "table":
      return (
        <section className="space-y-6">
          {block.head && <SectionHead head={block.head} />}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  {block.columns.map((c) => (
                    <th key={c} className="py-2 pr-4 font-mono text-xs font-normal tracking-wide text-muted uppercase">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((r) => (
                  <tr key={r.join("|")} className="border-b last:border-b-0">
                    {r.map((cell, i) => (
                      <td key={i} className={`py-2.5 pr-4 ${i === 0 ? "font-medium" : ""}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )

    case "tabs":
      return (
        <section className="space-y-6">
          <SectionHead head={block.head} />
          <div>
            {block.tabs.map((tab) => (
              <details key={tab.id} className="group border-t py-4 first:border-t-0 first:pt-0">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4">
                  <span className="space-y-0.5">
                    <span className="block font-heading text-lg font-semibold tracking-tight">{tab.label}</span>
                    {tab.subtitle && <span className="block text-sm text-muted">{tab.subtitle}</span>}
                  </span>
                  <span className="shrink-0 text-sm text-muted italic group-open:hidden">show</span>
                  <span className="hidden shrink-0 text-sm text-muted italic group-open:inline">hide</span>
                </summary>
                <ol className="mt-4 space-y-2.5">
                  {tab.steps.map((step, i) => (
                    <li key={step.title} className="flex gap-x-3 text-sm leading-relaxed">
                      <span className="w-5 shrink-0 font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                      <span>
                        <span className="font-medium">{step.title}.</span> {step.description}
                      </span>
                    </li>
                  ))}
                </ol>
                {tab.details && (
                  <div className="mt-4 space-y-2">
                    {tab.detailsTitle && <h4 className="text-sm font-semibold">{tab.detailsTitle}</h4>}
                    <Ticks items={tab.details} />
                  </div>
                )}
              </details>
            ))}
          </div>
        </section>
      )

    case "steps":
      return (
        <section className="space-y-6">
          <SectionHead head={block.head} />
          <div className="space-y-12">
            {block.items.map((item) => (
              <article key={item.title} className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold tracking-tight">{item.title}</h3>
                  <p className="max-w-prose leading-relaxed text-pretty">{item.body}</p>
                </div>
                {item.ticks && <Ticks items={item.ticks} />}
                <Figure image={item.image} />
              </article>
            ))}
          </div>
        </section>
      )

    case "compare":
      return (
        <section className="space-y-6">
          <SectionHead head={{ ...block.head, lede: "Switch the site theme to see the other one." }} />
          <Figure image={block.image} />
        </section>
      )

    case "phones":
      return (
        <section className="space-y-6">
          <SectionHead head={{ ...block.head, lede: undefined }} />
          <Phones items={block.items} />
        </section>
      )

    case "gallery":
      return (
        <section className="space-y-6">
          <SectionHead head={{ ...block.head, lede: "Open any screen to see it full size." }} />
          <Lightbox
            items={block.items.map((image) => zoomable(image, "(min-width: 640px) 372px, 100vw"))}
            className="grid gap-x-6 gap-y-8 sm:grid-cols-2"
            frameClassName={WIDE}
          />
        </section>
      )

    case "columns":
      return (
        <section className="space-y-6">
          <SectionHead head={block.head} />
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {block.columns.map((col) => (
              <div key={col.title} className="space-y-3 border-t pt-4">
                <h3 className="font-heading text-lg font-semibold tracking-tight">{col.title}</h3>
                {col.style === "chips" ? <Chips items={col.items} /> : <Ticks items={col.items} />}
              </div>
            ))}
          </div>
        </section>
      )

    case "duo":
      return (
        <section className="space-y-6">
          <SectionHead head={block.head} />
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {block.sides.map((side) => (
              <article key={side.title} className="space-y-3">
                {side.device === "phone" ? (
                  <Lightbox
                    items={[zoomable(side.image, "220px", true)]}
                    className="mx-auto max-w-[220px] [&_figcaption]:hidden"
                    frameClassName={TALL}
                  />
                ) : (
                  <Lightbox items={[zoomable(side.image, "(min-width: 640px) 372px, 100vw")]} frameClassName={WIDE} />
                )}
                <p className="font-mono text-xs tracking-wide text-muted uppercase">{side.eyebrow}</p>
                <h3 className="text-xl font-semibold tracking-tight">{side.title}</h3>
                <p className="leading-relaxed text-pretty">{side.body}</p>
                <Ticks items={side.points} />
              </article>
            ))}
          </div>
          {block.shared && (
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-heading text-lg font-semibold tracking-tight">{block.shared.title}</h3>
              <Chips items={block.shared.items} />
            </div>
          )}
        </section>
      )

    case "markdown": {
      const text = readPublicText(block.file)
      if (!text) return null
      return (
        <section className="space-y-6">
          <SectionHead head={block.head} />
          <Markdown>{stripTitle(text)}</Markdown>
        </section>
      )
    }

    // The page ends with its own links, so the showcase outro is not repeated.
    case "outro":
      return null
  }
}
