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

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <About />
        <Projects />
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
