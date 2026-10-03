import Image from "next/image"
import NextLink from "next/link"

/**
 * The full emblem, pinned to the bottom-right corner of the window on every page: black on the light theme,
 * white on the dark one. Hidden on phones, where it would sit on top of the text.
 *
 * The frame has the emblem's own proportions (473:512). The white file is cut to that shape already; the black
 * one is a padded square, so `object-cover` trims its side margins to make both marks the same size.
 */
export default function CornerEmblem() {
  return (
    <NextLink
      href="/"
      aria-label="Arkhins, home"
      className="fixed right-6 bottom-6 z-10 hidden no-underline opacity-90 transition-opacity hover:opacity-100 sm:block 2xl:right-10 2xl:bottom-8"
    >
      <span className="relative block aspect-[473/512] h-16 lg:h-20">
        <Image src="/brand/emblem-black.png" alt="" fill sizes="80px" className="object-cover dark:hidden" />
        <Image src="/brand/emblem-white.png" alt="" fill sizes="80px" className="hidden object-cover dark:block" />
      </span>
    </NextLink>
  )
}
