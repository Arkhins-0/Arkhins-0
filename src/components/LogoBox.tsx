import type { LucideIcon } from "lucide-react"
import Image from "next/image"

interface Props {
  src: string | null
  alt: string
  fallback: LucideIcon
}

/** A small square mark beside a résumé row: the organisation's logo, or an icon when there is none. */
export default function LogoBox({ src, alt, fallback: Fallback }: Props) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-white p-1.5 dark:bg-stone-100">
      {src ? (
        <Image src={src} alt={alt} width={40} height={40} className="size-full object-contain" />
      ) : (
        <Fallback size={18} strokeWidth={1.5} className="text-stone-500" aria-hidden />
      )}
    </span>
  )
}
