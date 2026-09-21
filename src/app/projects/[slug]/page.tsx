import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Exo_2, Fraunces, Rajdhani } from 'next/font/google';
import { Footer } from '@/components/layout';
import { Showcase } from '@/components/showcase/Showcase';
import { defaultShowcase, getProject, listProjectSlugs } from '@/lib/content';

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

export const dynamicParams = false;

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
  return (
    <div className={`${serif.variable} ${condensed.variable} ${exo.variable}`}>
      <Showcase project={project} doc={doc} />
      <Footer />
    </div>
  );
}
