'use client';

import Image from 'next/image';
import { ArrowUpRight, Flag, GraduationCap } from 'lucide-react';
import portfolioData from '@/data/portfolio.json';
import { Panel, Reveal, SectionHead } from '@/components/fx';

const VOLUNTEERING = portfolioData.volunteering.filter(
  (v) => !v.id.includes('placeholder')
);
const WORKSHOPS = portfolioData.workshops.filter(
  (w) => !w.id.includes('placeholder')
);

function LaneHeader({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-white/8 pb-4">
      <span className="grid h-8 w-8 place-items-center border border-accent/35 text-accent">
        {icon}
      </span>
      <h3 className="hud text-ink">{label}</h3>
      <span className="neon-line ml-auto h-px w-10 opacity-60" />
      <span className="hud text-ink-faint">{String(count).padStart(2, '0')}</span>
    </div>
  );
}

export function Beyond() {
  return (
    <section id="beyond" className="band">
      <div className="shell">
        <SectionHead
          index="07"
          label="Off the clock"
          title="Outside the"
          accentWord="editor"
          lede="Track marshalling, workshops, and the community work that keeps the learning honest."
        />

        <Reveal className="mt-14">
          <Panel cut={26} className="overflow-hidden">
            <div className="relative grid gap-0 lg:grid-cols-2">
              {/* hazard divider between the two lanes */}
              <span
                aria-hidden="true"
                className="hazard absolute left-1/2 top-0 hidden h-full w-1 -translate-x-1/2 opacity-40 lg:block"
              />

              {/* ------------------------------------------ volunteering */}
              <div className="p-7 md:p-9">
                <LaneHeader
                  icon={<Flag size={14} />}
                  label="Volunteering"
                  count={VOLUNTEERING.length}
                />
                <ul className="mt-6 space-y-5">
                  {VOLUNTEERING.map((v) => (
                    <li key={v.id} className="group flex gap-4">
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden border border-white/12 bg-white/5">
                        <Image
                          src={v.logo}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-contain p-1.5 transition-transform duration-500 group-hover:scale-110"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="font-display text-base font-bold leading-tight">
                          {v.role}
                          <span className="text-accent"> @ </span>
                          {v.organization}
                        </p>
                        <p className="hud mt-1 text-ink-faint">
                          {v.startDate}
                          {v.endDate !== v.startDate && ` — ${v.endDate}`}
                        </p>
                        <p className="mt-2 text-[0.83rem] leading-relaxed text-ink-dim">
                          {v.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ------------------------------------------ workshops */}
              <div className="border-t border-white/8 p-7 md:p-9 lg:border-l lg:border-t-0">
                <LaneHeader
                  icon={<GraduationCap size={14} />}
                  label="Workshops attended"
                  count={WORKSHOPS.length}
                />
                <ol className="mt-6 space-y-4">
                  {WORKSHOPS.map((w, i) => {
                    const linked = Boolean(w.certificateUrl);
                    const Row: any = linked ? 'a' : 'div';
                    return (
                      <li key={w.id}>
                        <Row
                          {...(linked
                            ? {
                                href: w.certificateUrl,
                                target: '_blank',
                                rel: 'noopener noreferrer',
                              }
                            : {})}
                          className="group grid grid-cols-[2rem_1fr_auto] items-start gap-3 border-b border-white/6 pb-4 transition-colors"
                        >
                          <span className="hud pt-0.5 text-accent/70">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-snug transition-colors group-hover:text-accent">
                              {w.name}
                            </p>
                            <p className="hud mt-1 text-ink-faint">
                              {w.organizer} · {w.date}
                            </p>
                            <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-dim">
                              {w.description}
                            </p>
                          </div>
                          {linked && (
                            <ArrowUpRight
                              size={15}
                              className="mt-0.5 text-ink-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                            />
                          )}
                        </Row>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </Panel>
        </Reveal>
      </div>
    </section>
  );
}
