import { About } from '@/components/home/About';
import { SideQuests } from '@/components/home/SideQuests';
import { Roles } from '@/components/home/Roles';
import { Contact } from '@/components/home/Contact';
import { AnimeFooter } from '@/components/home/Footer';
import { Hero } from '@/components/home/Hero';
import { Nav } from '@/components/home/Nav';
import { Proof } from '@/components/home/Proof';
import { Skills } from '@/components/home/Skills';
import { Story } from '@/components/home/Story';
import { EpisodeHead } from '@/components/home/primitives';
import { Work } from '@/components/home/Work';
import { listEducation, listProjects, listRows } from '@/lib/content';
import { getSite, guestsFor } from '@/lib/site';

/** Rebuilt at most every five minutes; saves in /admin revalidate it immediately. */
export const revalidate = 300;

export default async function Home() {
  const [site, projects, education, cast, guests] = await Promise.all([
    getSite(),
    listProjects(),
    listEducation(),
    listRows('cast_members'),
    listRows('guests'),
  ]);
  const { anime, copy, portfolio } = site;
  // The home page shows the featured projects; /projects lists every published one.
  const featured = projects.filter((p) => p.featured);
  const shown = featured.length ? featured : projects;

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
        <Roles site={site} members={cast} projects={projects} />
        <About site={site} education={education} />

        <section id="work" className="ak-section bg-[color:var(--ak-sky-soft)]">
          <div className="ak-shell">
            <EpisodeHead copy={anime.sections.work} />
            <Work
              projects={shown}
              copy={copy.work}
              githubUrl={portfolio.socialLinks.find((s) => s.icon === 'github')?.url}
              allHref="/projects"
              allLabel={copy.projectsIndex.allLabel}
              guests={guestsFor(projects.map((p) => p.slug), guests)}
              guestLabel={anime.projectCast.label}
            />
          </div>
        </section>

        <Story site={site} />
        <Skills site={site} />
        <Proof site={site} />
        <SideQuests site={site} />
        <Contact site={site} />
      </main>
      <AnimeFooter />
    </div>
  );
}
