'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { Code, Palette, Database, Wrench } from 'lucide-react';
import portfolioData from '@/data/portfolio.json';
import { RevealOnScroll } from '@/components/ui/Animations';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { getAssetPath } from '@/lib/utils';

const categoryIcons: Record<string, React.ReactNode> = {
  'Frontend Development': <Code size={36} />,
  'Backend Development': <Code size={36} />,
  'UI/UX Design': <Palette size={36} />,
  'Data Management': <Database size={36} />,
  'Tools & Platforms': <Wrench size={36} />,
};

export function Skills() {
  const { skills } = portfolioData;
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (marquee && marquee.scrollWidth > 0) marquee.scrollLeft = 0;
  }, []);

  useEffect(() => {
    if (!autoScroll || isDragging) return;
    const marquee = marqueeRef.current;
    if (!marquee) return;
    let frame: number;
    const scroll = () => {
      const maxScroll = marquee.scrollWidth - marquee.clientWidth;
      const singleSetWidth = maxScroll / 2;
      marquee.scrollLeft += 1;
      if (marquee.scrollLeft >= singleSetWidth) marquee.scrollLeft = 0;
      frame = requestAnimationFrame(scroll);
    };
    frame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frame);
  }, [autoScroll, isDragging]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setAutoScroll(false);
    setStartX(e.clientX);
    setScrollLeft(marqueeRef.current?.scrollLeft || 0);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !marqueeRef.current) return;
    const marquee = marqueeRef.current;
    const walk = (e.clientX - startX) * 2;
    let newScroll = scrollLeft - walk;
    const singleSetWidth = (marquee.scrollWidth - marquee.clientWidth) / 2;
    while (newScroll < 0) newScroll += singleSetWidth;
    while (newScroll > singleSetWidth) newScroll -= singleSetWidth;
    marquee.scrollLeft = newScroll;
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setTimeout(() => setAutoScroll(true), 500);
  };

  return (
    <section id="skills" className="section-padding">
      <div className="container-custom">
        {/* Section Header */}
        <RevealOnScroll className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4">
            Skills & <span className="text-gradient">Technologies</span>
          </h2>
          <p className="text-foreground max-w-2xl mx-auto">
            The tools and technologies I use to bring ideas to life
          </p>
        </RevealOnScroll>

        {/* Tech Stack Marquee */}
        <RevealOnScroll delay={0.1} className="mb-20">
          <div
            className="relative overflow-hidden py-4"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)',
              maskImage: 'linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)',
            }}
          >
            <div
              ref={marqueeRef}
              className="flex gap-4 shrink-0 overflow-x-auto cursor-grab px-2"
              style={{ userSelect: isDragging ? 'none' : 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {[...skills.techStack, ...skills.techStack, ...skills.techStack].map((tech, index) => (
                <div
                  key={`${tech.name}-${index}`}
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-accent whitespace-nowrap flex-shrink-0"
                >
                  <Image
                    src={getAssetPath(tech.icon)}
                    alt={`${tech.name} logo`}
                    width={25}
                    height={25}
                    className="object-contain"
                  />
                  <span className="text-lg font-medium">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>

        {/* Categories – alternating layout */}
        <div className="flex flex-col gap-20 md:gap-28">
          {skills.categories.map((category, index) => (
            <SkillCategoryRow key={category.name} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

type SkillCategory = typeof portfolioData.skills.categories[0];

function SkillCategoryRow({ category, index }: { category: SkillCategory; index: number }) {
  const isReversed = index % 2 !== 0;
  const icon = categoryIcons[category.name] ?? <Code size={36} />;
  const avgLevel = Math.round(
    category.skills.reduce((sum, s) => sum + s.level, 0) / category.skills.length
  );

  return (
    <RevealOnScroll delay={0.1}>
      <div className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-14`}>

        {/* Category info */}
        <div className={`w-full md:w-2/5 ${isReversed ? 'md:text-right' : ''}`}>
          <div className={`flex items-center gap-4 mb-4 ${isReversed ? 'md:flex-row-reverse' : ''}`}>
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
              {icon}
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold leading-tight">{category.name}</h3>
              <p className="text-sm text-accent font-semibold mt-0.5">
                {category.skills.length} skills &middot; {avgLevel}% avg
              </p>
            </div>
          </div>

          <p className="text-foreground leading-relaxed mb-6 text-base">{category.description}</p>

          <div className={`flex flex-wrap gap-2 ${isReversed ? 'md:justify-end' : ''}`}>
            {category.skills.map(skill => (
              <span
                key={skill.name}
                className="px-3 py-1 text-xs rounded-full bg-accent/10 text-accent border border-accent/20 font-medium"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>

        {/* Skills grid – no tilt */}
        <div className="w-full md:w-3/5 relative rounded-2xl glass-card gradient-border p-6 md:p-8">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
          <div
            className="grid gap-6 justify-items-center"
            style={{ gridTemplateColumns: `repeat(${Math.min(category.skills.length, 4)}, 1fr)` }}
          >
            {category.skills.map((skill, skillIndex) => (
              <SkillItem key={skill.name} skill={skill} delay={skillIndex * 0.1} />
            ))}
          </div>
        </div>

      </div>
    </RevealOnScroll>
  );
}

interface SkillItemProps {
  skill: { name: string; icon: string; level: number };
  delay?: number;
}

function SkillItem({ skill, delay = 0 }: SkillItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [progress, setProgress] = useState(0);

  const radius = 22;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => setProgress(skill.level), delay * 1000 + 400);
    return () => clearTimeout(timer);
  }, [isInView, skill.level, delay]);

  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay }}
      className="flex flex-col items-center gap-2"
    >
      {/* Circular progress ring + icon — icon pops on hover */}
      <div className="relative w-16 h-16">
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ transform: 'rotate(-90deg)' }}
          viewBox="0 0 52 52"
        >
          <circle
            cx="26" cy="26" r={radius}
            fill="none" strokeWidth="2.5"
            className="stroke-accent/15"
          />
          <circle
            cx="26" cy="26" r={radius}
            fill="none" strokeWidth="2.5"
            stroke="var(--accent)"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <motion.div
          className="absolute inset-2 rounded-full bg-accent/5 flex items-center justify-center"
          whileHover={{ scale: 3 }}
          transition={{ type: 'spring', stiffness: 340, damping: 18 }}
        >
          <Image
            src={getAssetPath(`/images/skills/${skill.icon}.png`)}
            alt={skill.name}
            width={28}
            height={28}
            className="object-contain group-hover:scale-110 transition-transform duration-200"
          />
        </motion.div>
      </div>

      <span className="text-xs font-semibold text-center leading-tight">{skill.name}</span>
      <span className="text-xs text-accent font-bold">{skill.level}%</span>
    </motion.div>
  );
}
