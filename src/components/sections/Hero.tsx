import SlashList from "@/components/layout/SlashList"
import { site, socialLinks } from "@/data/site"

export default function Hero() {
  return (
    <section id="hero" className="space-y-6">
      <div className="-space-y-2">
        <p className="text-sm italic sm:text-base">hi, my name is</p>
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">krishna vijay g</h1>
      </div>

      <p className="text-base text-muted italic sm:text-lg">{site.tagline}</p>

      <nav aria-label="Social">
        <SlashList links={socialLinks} className="flex flex-wrap items-center gap-x-3 gap-y-1" />
      </nav>
    </section>
  )
}
