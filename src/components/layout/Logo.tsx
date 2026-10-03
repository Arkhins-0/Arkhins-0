import Image from "next/image"

interface Props {
  size?: number
  className?: string
}

export default function Logo({ size = 24, className = "" }: Props) {
  return (
    <Image
      src="/brand/emblem.png"
      width={Math.round(size * (473 / 512))}
      height={size}
      alt="Arkhins - Emblem"
      priority
      className={`invert dark:invert-0 ${className}`}
    />
  )
}
