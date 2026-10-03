import { ArrowRightIcon, UserIcon } from "lucide-react"
import NextLink from "next/link"

import SectionHeading from "@/components/SectionHeading"

export default function About() {
  return (
    <section id="about" className="space-y-6">
      <SectionHeading icon={UserIcon}>about</SectionHeading>

      <div className="max-w-prose space-y-4 leading-relaxed text-pretty">
        <p className="drop-cap">
          I&apos;m a full-stack developer and designer from Chennai, with a B.Tech in Computer Science and an AI
          specialisation. Right now I build and run the web systems behind Chennai Turbo Riders, a Formula 4 team: the
          team site, the console that edits it, and the official portal of the Indian National Car Racing Championship.
        </p>

        <p>
          I design interfaces and then build them. Research and Figma come first, then Next.js and Postgres, and Kotlin
          when a project needs to live on a phone. Lately that has meant Spartan, an open-source platform for running
          motorsport championships, and Bookisham, a private reading room on the web and Android. Online I go by
          Arkhins, an anagram of Krishna.
        </p>

        <p>
          If any of that resonates,{" "}
          <NextLink href="/#contact">
            get in touch
            <ArrowRightIcon size={14} strokeWidth={1.5} className="inline" aria-hidden />
          </NextLink>
        </p>
      </div>
    </section>
  )
}
