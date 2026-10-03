import Contact from "@/components/contact/Contact"
import About from "@/components/sections/About"
import Hero from "@/components/sections/Hero"
import {
  Certifications,
  Education,
  Experience,
  Languages,
  Projects,
  Resume,
  Writing,
} from "@/components/sections/Lists"
import { personSchema } from "@/data/site"

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />

      <div className="my-18 space-y-18 sm:my-30 sm:space-y-30">
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Writing />
        <Education />
        <Certifications />
        <Languages />
        <Resume />
        <Contact />
      </div>
    </>
  )
}
