import dynamic from 'next/dynamic';
import { Navigation } from '@/components/layout/Navigation';
import { Hero } from '@/components/sections/Hero';

// Below-fold sections: excluded from the initial JS bundle via ssr:false
// Splash screen covers the page during first load, so the blank HTML is invisible.
const About        = dynamic(() => import('@/components/sections/About').then(m => ({ default: m.About })), { ssr: false, loading: () => null });
const Projects     = dynamic(() => import('@/components/sections/Projects').then(m => ({ default: m.Projects })), { ssr: false, loading: () => null });
const Experience   = dynamic(() => import('@/components/sections/Experience').then(m => ({ default: m.Experience })), { ssr: false, loading: () => null });
const Skills       = dynamic(() => import('@/components/sections/Skills').then(m => ({ default: m.Skills })), { ssr: false, loading: () => null });
const Certifications = dynamic(() => import('@/components/sections/Certifications').then(m => ({ default: m.Certifications })), { ssr: false, loading: () => null });
const Volunteering = dynamic(() => import('@/components/sections/Volunteering').then(m => ({ default: m.Volunteering })), { ssr: false, loading: () => null });
const Contact      = dynamic(() => import('@/components/sections/Contact').then(m => ({ default: m.Contact })), { ssr: false, loading: () => null });
const Footer       = dynamic(() => import('@/components/layout/Footer').then(m => ({ default: m.Footer })), { ssr: false, loading: () => null });

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
    </>
  );
}
