import type { Metadata } from 'next';
import { AnimeFooter } from '@/components/anime/Footer';
import { Nav } from '@/components/anime/Nav';
import { Pop } from '@/components/anime/Pop';
import { ProjectPanel } from '@/components/anime/ProjectPanel';
import { Sakura } from '@/components/anime/ui';
import { listProjects } from '@/lib/content';
import { getSite, guestsFor } from '@/lib/site';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await getSite();
  return { title: copy.projectsIndex.metaTitle, description: copy.projectsIndex.metaDescription };
}

export default async function ProjectsIndex() {
  const [{ anime, copy }, projects] = await Promise.all([getSite(), listProjects()]);
  const COPY = copy.projectsIndex;
  const guests = guestsFor(projects.map((p) => p.slug), anime.projectCast);

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
        <section className="ak-sky relative overflow-hidden pb-16 pt-36 md:pt-44">
          <Sakura count={12} />
          <div className="ak-shell relative">
            <Pop>
              <span className="ak-episode">
                <span>{String(projects.length).padStart(2, '0')}</span>
                <span>{COPY.eyebrow}</span>
              </span>
              <h1 className="ak-display ak-outline-text mt-6 text-[clamp(2.8rem,9vw,6rem)] leading-[0.95]">
                {COPY.title} <span className="text-[color:var(--ak-sakura)]">{COPY.accentWord}</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-[color:var(--ak-ink-2)]">{COPY.lede}</p>
            </Pop>
          </div>
        </section>

        <section className="ak-section pt-10">
          <div className="ak-shell">
            <ul className="grid gap-7 md:grid-cols-2">
              {projects.map((p, i) => (
                <Pop as="li" key={p.id} delay={(i % 2) * 0.06}>
                  <ProjectPanel project={p} index={i} openLabel={copy.work.caseStudyAction} featuredLabel={copy.work.featuredBadge.replace(/^★\s*/, '')} guest={guests[p.slug]} guestLabel={anime.projectCast.label} />
                </Pop>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <AnimeFooter />
    </div>
  );
}
