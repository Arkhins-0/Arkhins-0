import { Navigation, Footer } from '@/components/layout';
import {
  Hero,
  About,
  Projects,
  Experience,
  Skills,
  Certifications,
  Beyond,
  Contact,
} from '@/components/sections';
import { listEducation, listProjects } from '@/lib/content';

export default async function Home() {
  const [projects, education] = await Promise.all([listProjects(), listEducation()]);

  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <About education={education} />
        <Projects projects={projects} />
        <Experience />
        <Skills />
        <Certifications />
        <Beyond />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
