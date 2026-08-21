import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Github } from 'lucide-react';
import portfolioData from '@/data/portfolio.json';
import { ProjectBar } from '@/components/layout/ProjectBar';
import { Footer } from '@/components/layout';
import { Panel, Reveal } from '@/components/fx';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Case studies and shipped projects by Krishna Vijay G — AI/ML, full-stack and interface design.',
};

type Project = (typeof portfolioData.projects)[number] & {
  pageUrl?: string;
  role?: string;
  year?: string;
};

const PROJECTS = portfolioData.projects.filter(
  (p) => !p.id.includes('placeholder')
) as Project[];

export default function ProjectsIndex() {
  return (
    <>
      <ProjectBar name="All projects" kind="archive" backHref="/" backLabel="Home" />

      <main>
        <section className="pb-16 pt-32 md:pt-40">
          <div className="shell">
            <Reveal dir="none">
              <div className="flex items-center gap-3">
                <span className="hud border border-accent/40 px-2 py-1 text-accent">
                  {String(PROJECTS.length).padStart(2, '0')}
                </span>
                <span className="hazard h-3 w-10 opacity-70" />
                <span className="eyebrow">Archive</span>
                <span className="neon-line h-px flex-1 opacity-60" />
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-6 font-display text-[clamp(2.6rem,8vw,6rem)] font-extrabold leading-[0.88] tracking-tightest">
                Selected
                <br />
                <span className="stroke-text">work</span>
              </h1>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-6 max-w-xl leading-relaxed text-ink-dim">
                Everything below shipped, broke, or taught me something. Case
                studies get their own page; the rest link straight to the live
                build or the repo.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="pb-24">
          <div className="shell">
            <ul className="grid gap-5 md:grid-cols-2">
              {PROJECTS.map((p, i) => {
                const internal = Boolean(p.pageUrl);
                const href = p.pageUrl || p.liveUrl || p.githubUrl || '#';
                const Card: any = internal ? Link : 'a';

                return (
                  <Reveal key={p.id} as="li" delay={i * 0.06}>
                    <Panel
                      hot={internal}
                      cut={24}
                      spotlight
                      className="group/card h-full"
                    >
                      <Card
                        {...(internal
                          ? { href }
                          : {
                              href,
                              target: '_blank',
                              rel: 'noopener noreferrer',
                            })}
                        className="flex h-full flex-col"
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/30">
                          <Image
                            src={p.thumbnail}
                            alt={p.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-[1.1s] ease-swift group-hover/card:scale-[1.05]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-bg/85 via-bg/10 to-transparent" />
                          {internal && (
                            <span className="hud absolute left-4 top-4 border border-accent/50 bg-black/50 px-2 py-1 text-accent backdrop-blur-sm">
                              Case study
                            </span>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col p-6">
                          <div className="flex items-center gap-3">
                            <span className="hud text-accent">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <span className="hud text-ink-faint">
                              {p.category} · {p.year}
                            </span>
                            <ArrowUpRight
                              size={17}
                              className="ml-auto text-ink-faint transition-all duration-500 ease-swift group-hover/card:-translate-y-1 group-hover/card:translate-x-1 group-hover/card:text-accent"
                            />
                          </div>

                          <h2 className="mt-3 font-display text-xl font-bold leading-tight tracking-tight transition-colors group-hover/card:text-accent">
                            {p.title.split(':')[0]}
                          </h2>

                          <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-dim">
                            {p.description}
                          </p>

                          <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
                            {p.tags.map((t) => (
                              <li
                                key={t}
                                className="border border-white/10 px-2 py-0.5 font-mono text-[0.63rem] text-ink-faint"
                              >
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Card>
                    </Panel>
                  </Reveal>
                );
              })}
            </ul>

            <Reveal className="mt-12 flex flex-wrap items-center justify-between gap-5 border-t border-white/8 pt-8">
              <p className="text-sm text-ink-dim">
                More half-finished ideas live on GitHub.
              </p>
              <a
                href={
                  portfolioData.socialLinks.find((s) => s.id === 'github')?.url
                }
                target="_blank"
                rel="noopener noreferrer"
                className="group hud inline-flex items-center gap-2 text-ink-faint transition-colors hover:text-accent"
              >
                <Github size={14} />
                Browse the repos
                <ArrowUpRight
                  size={13}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
