import type { LucideIcon } from "lucide-react"

interface Props {
  icon: LucideIcon
  children: React.ReactNode
}

export default function SectionHeading({ icon: Icon, children }: Props) {
  return (
    <div className="flex items-center gap-x-4">
      <Icon size={20} strokeWidth={1.5} aria-hidden />
      <h2 className="text-3xl font-semibold tracking-tight">{children}</h2>
    </div>
  )
}
