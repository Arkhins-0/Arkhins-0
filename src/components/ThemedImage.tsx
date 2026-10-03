import Image from "next/image"

import { imageSize } from "@/lib/images"
import type { ThemedImage as Themed } from "@/lib/types"

interface Props {
  image: Themed
  sizes?: string
  className?: string
  priority?: boolean
}

/**
 * A screenshot that follows the site theme: the light capture in light mode, the dark one in dark mode.
 * Images with a single capture show it in both.
 */
export default function ThemedImage({ image, sizes = "(min-width: 768px) 768px, 100vw", className = "", priority }: Props) {
  const variants = image.dark
    ? [
        { src: image.light, className: "dark:hidden" },
        { src: image.dark, className: "hidden dark:block" },
      ]
    : [{ src: image.light, className: "" }]

  return (
    <>
      {variants.map(({ src, className: themeClass }) => {
        const { width, height } = imageSize(src)
        return (
          <Image
            key={src}
            src={src}
            alt={image.alt}
            width={width}
            height={height}
            sizes={sizes}
            priority={priority}
            className={`h-auto w-full ${themeClass} ${className}`}
          />
        )
      })}
    </>
  )
}
