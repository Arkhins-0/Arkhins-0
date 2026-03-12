import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { SettingsPanel } from '@/components/layout/SettingsPanel';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Projects } from '@/components/sections/Projects';
import { Experience } from '@/components/sections/Experience';
import { Skills } from '@/components/sections/Skills';
import { Certifications } from '@/components/sections/Certifications';
import { Volunteering } from '@/components/sections/Volunteering';
import { Contact } from '@/components/sections/Contact';

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        {/* About has no background – hero blur shows through */}
        <div className="relative z-10">
          <About />
        </div>
        {/* Remaining sections have a solid background to cover the fixed video */}
        <div className="relative z-10 bg-background">
          <Projects />
          <Experience />
          <Skills />
          <Certifications />
          <Volunteering />
          <Contact />
        </div>
      </main>
      <Footer />
      <SettingsPanel />
    </>
  );
}
