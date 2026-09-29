import { About } from '@/components/anime/About';
import { Beyond } from '@/components/anime/Beyond';
import { Contact } from '@/components/anime/Contact';
import { AnimeFooter } from '@/components/anime/Footer';
import { Hero } from '@/components/anime/Hero';
import { Nav } from '@/components/anime/Nav';
import { Proof } from '@/components/anime/Proof';
import { Skills } from '@/components/anime/Skills';
import { Story } from '@/components/anime/Story';
import { EpisodeHead } from '@/components/anime/ui';
import { Work } from '@/components/anime/Work';
import { listEducation, listProjects } from '@/lib/content';
import { getSite, guestsFor } from '@/lib/site';
import { Cast } from '@/components/anime/Cast';

/** Rebuilt at most every five minutes; saves in /admin revalidate it immediately. */
export const revalidate = 300;

export default async function Home() {
  const [site, projects, education] = await Promise.all([getSite(), listProjects(), listEducation()]);
  const { anime, copy, portfolio } = site;

  return (
    <div className="ak">
      <Nav
        title={anime.series.title}
        kana={anime.series.kana}
        items={anime.nav.items}
        cta={anime.nav.cta}
        ctaHref={anime.nav.ctaHref}
        openMenu={anime.nav.openMenu}
        closeMenu={anime.nav.closeMenu}
      />
      <main>
        <Hero site={site} />
        <Cast site={site} projects={projects} />
        <About site={site} education={education} />

        <section id="work" className="ak-section bg-[color:var(--ak-sky-soft)]">
          <div className="ak-shell">
            <EpisodeHead copy={anime.sections.work} />
            <Work
              projects={projects}
              copy={copy.work}
              githubUrl={portfolio.socialLinks.find((s) => s.id === 'github')?.url}
              allHref="/projects"
              allLabel={copy.projectsIndex.barName}
              guests={guestsFor(projects.map((p) => p.slug), anime.projectCast)}
              guestLabel={anime.projectCast.label}
            />
          </div>
        </section>

        <Story site={site} />
        <Skills site={site} />
        <Proof site={site} />
        <Beyond site={site} />
        <Contact site={site} />
      </main>
      <AnimeFooter />
    </div>
  );
}
