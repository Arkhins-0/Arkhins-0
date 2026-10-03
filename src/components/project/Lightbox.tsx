"use client"

import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react"
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react"

export interface LightboxItem {
  /** The image cropped into its frame, as it sits on the page. */
  thumb: ReactNode
  /** The whole image, uncropped, shown once the frame is opened. */
  full: ReactNode
  alt: string
  caption?: string
}

interface Props {
  items: LightboxItem[]
  /** Layout of the frames, e.g. a grid. */
  className?: string
  /** Shape of each frame: aspect ratio, radius, border. */
  frameClassName: string
  captionClassName?: string
}

/**
 * Screenshots come in every shape, from one viewport to a whole scrolled page, so on the page each sits in a
 * frame of the same size, cropped from the top. Opening a frame shows the full image in a dialog that scrolls,
 * with arrows to step through the rest of its group.
 */
export default function Lightbox({ items, className, frameClassName, captionClassName = "text-sm" }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState<number | null>(null)

  const open = (i: number) => {
    setIndex(i)
    dialog.current?.showModal()
    document.documentElement.style.overflow = "hidden"
  }

  const close = useCallback(() => dialog.current?.close(), [])

  const step = useCallback(
    (by: number) => setIndex((i) => (i === null ? i : (i + by + items.length) % items.length)),
    [items.length]
  )

  // Each image starts from its top.
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
  }, [index])

  const current = index === null ? null : items[index]
  const many = items.length > 1

  return (
    <>
      <div className={className}>
        {items.map((item, i) => (
          <figure key={i} className="space-y-2">
            <button
              type="button"
              onClick={() => open(i)}
              aria-label={`Open ${item.alt} full size`}
              className={`block w-full cursor-zoom-in overflow-hidden no-underline transition-opacity hover:opacity-90 [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:object-top ${frameClassName}`}
            >
              {item.thumb}
            </button>
            {item.caption && <figcaption className={`text-muted italic ${captionClassName}`}>{item.caption}</figcaption>}
          </figure>
        ))}
      </div>

      <dialog
        ref={dialog}
        aria-label={current?.alt}
        onClose={() => {
          setIndex(null)
          document.documentElement.style.overflow = ""
        }}
        onClick={(e) => e.target === e.currentTarget && close()}
        onKeyDown={(e) => {
          if (!many) return
          if (e.key === "ArrowRight") step(1)
          if (e.key === "ArrowLeft") step(-1)
        }}
        className="m-auto h-[92vh] w-[min(1200px,94vw)] max-w-none overflow-hidden rounded-lg border bg-background p-0 text-foreground backdrop:bg-stone-950/85 open:flex open:flex-col"
      >
        {current && (
          <>
            <header className="flex shrink-0 items-center justify-between gap-4 border-b px-4 py-2.5">
              <p className="truncate text-sm italic">
                {current.caption ?? current.alt}
                {many && (
                  <span className="ml-3 font-mono text-xs text-muted not-italic">
                    {index! + 1} / {items.length}
                  </span>
                )}
              </p>
              <div className="flex shrink-0 items-center gap-x-1">
                {many && (
                  <>
                    <button type="button" onClick={() => step(-1)} aria-label="Previous image" className="size-8 justify-center rounded-md no-underline hover:bg-muted/20">
                      <ChevronLeftIcon size={16} strokeWidth={1.5} />
                    </button>
                    <button type="button" onClick={() => step(1)} aria-label="Next image" className="size-8 justify-center rounded-md no-underline hover:bg-muted/20">
                      <ChevronRightIcon size={16} strokeWidth={1.5} />
                    </button>
                  </>
                )}
                <button type="button" onClick={close} aria-label="Close" autoFocus className="size-8 justify-center rounded-md no-underline hover:bg-muted/20">
                  <XIcon size={16} strokeWidth={1.5} />
                </button>
              </div>
            </header>
            <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-stone-200/40 p-3 sm:p-6 dark:bg-stone-900/60">
              {current.full}
            </div>
          </>
        )}
      </dialog>
    </>
  )
}
