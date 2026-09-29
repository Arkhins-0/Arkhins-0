import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Exo_2, Fraunces, IBM_Plex_Sans, Rajdhani } from 'next/font/google';
import { AnimeFooter } from '@/components/anime/Footer';
import { Backdrop, ScrollRail } from '@/components/fx';
import { Showcase } from '@/components/showcase/Showcase';
import { loadShowcasePage } from '@/components/showcase/pages';
import { defaultShowcase, getProject, listProjectSlugs } from '@/lib/content';
import { ShowcaseGuest } from '@/components/anime/ShowcaseGuest';
import { getSite, guestsFor } from '@/lib/site';

/** Serif display face, exposed as --font-serif for looks that want one (the folio look uses it). */
const serif = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

/** Condensed technical face, exposed as --font-condensed (the pitwall look uses it). */
const condensed = Rajdhani({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-condensed',
  display: 'swap',
});

/** Wide technical grotesque, exposed as --font-exo (the tower look uses it, upright and italic). */
const exo = Exo_2({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-exo',
  display: 'swap',
});

/** Neutral engineering grotesque, exposed as --font-plex (the blueprint look uses it). */
const plex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-plex',
  display: 'swap',
});

/** New slugs saved from /admin render on first request instead of 404ing until the next build. */
export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams() {
  return (await listProjectSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProject(params.slug);
  if (!p) return {};
  const title = p.tagline ? `${p.title.split(':')[0].trim()} — ${p.tagline}` : p.title;
  const description = p.description ?? p.summary;
  return {
    title,
    description,
    openGraph: { title, description, images: p.cover ? [{ url: p.cover }] : undefined },
  };
}

/** Every project lives at /projects/<slug>; the page is rendered from the row's content document. */
export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const project = await getProject(params.slug);
  if (!project) notFound();
  const doc = project.content ?? defaultShowcase(project);
  // Same assignment as the project grids, so a project keeps its guest everywhere.
  const [{ anime }, slugs, Custom] = await Promise.all([getSite(), listProjectSlugs(), loadShowcasePage(project.slug)]);
  const guest = guestsFor(slugs, anime.projectCast)[project.slug];
  return (
    <div className={`${serif.variable} ${condensed.variable} ${exo.variable} ${plex.variable}`}>
      {Custom ? (
        <Custom
          project={project}
          doc={doc}
          guest={guest ? { name: guest.name, series: guest.series, poses: guest.poses ?? [] } : undefined}
        />
      ) : (
        <>
          <Backdrop />
          <ScrollRail />
          <Showcase project={project} doc={doc} />
        </>
      )}
      <AnimeFooter />
      {guest && (
        <ShowcaseGuest guest={guest} label={anime.projectCast.label} closeLabel={anime.nav.closeMenu} />
      )}
    </div>
  );
}
