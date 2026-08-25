import type { Metadata } from 'next';
import data from './hygieia.json';

export const metadata: Metadata = {
  title: `${data.meta.name} — ${data.meta.title}`,
  description: data.meta.tagline,
  openGraph: {
    title: `${data.meta.name} — ${data.meta.title}`,
    description: data.meta.tagline,
    images: [{ url: data.meta.cover }],
  },
};

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
