'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

import { ArrowDown, Github, MapPin, Sparkles } from 'lucide-react';
import { FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';
import { SiGoogle } from 'react-icons/si';
import { FaDiscord, FaTelegram } from 'react-icons/fa6';
import portfolioData from '@/data/portfolio.json';
import { useTheme } from '@/context/ThemeContext';

const socialIcons: Record<string, React.ReactNode> = {
  github: <FaGithub size={20} />,
  linkedin: <FaLinkedin size={20} />,
  google: <SiGoogle size={20} />,
  instagram: <FaInstagram size={20} />,
  discord: <FaDiscord size={20} />,
  telegram: <FaTelegram size={20} />,
};

export function Hero() {
  const { basics, socialLinks } = portfolioData;
  const { isDark } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const blur = Math.min((window.scrollY / window.innerHeight) * 8, 8);
      document.documentElement.style.setProperty('--hero-video-blur', `${blur}px`);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const desktopVideo = isDark ? '/images/hero/hero_dark.mp4' : '/images/hero/hero_light.mp4';
  const mobileVideo = isDark ? '/images/hero/hero_dark_mobile.mp4' : '/images/hero/hero_light_mobile.mp4';

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 md:pt-32 pb-24 md:pb-16"
    >
      {/* Fixed video background – stays pinned while page scrolls */}
      <div
        className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
        style={{ filter: 'blur(var(--hero-video-blur, 0px))', willChange: 'filter' }}
      >
        {/* Desktop video */}
        <video
          key={`desktop-${isDark ? 'dark' : 'light'}`}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
        >
          <source src={desktopVideo} type="video/mp4" />
        </video>
        {/* Mobile video */}
        <video
          key={`mobile-${isDark ? 'dark' : 'light'}`}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover md:hidden"
        >
          <source src={mobileVideo} type="video/mp4" />
        </video>
      </div>

      {/* Accent glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.28, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-accent/20 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.22, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-accent/20 blur-[100px]"
        />
      </div>

      <div className="container-custom relative z-[1] w-full">
        {/* Content — right-aligned */}
        <div className="ml-auto w-full lg:w-1/2 text-center lg:text-right flex flex-col justify-end min-h-[calc(100svh-5rem)] sm:block sm:min-h-0">

          {/* Top group: status badge + name */}
          <div className="sm:block">
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {basics.availability}
                </span>
              </div>
            </motion.div>

            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold tracking-tight mb-4">
                <span className="block text-foreground">Hi, I&apos;m</span>
                <span className="text-gradient">{basics.name}</span>
              </h1>
            </motion.div>
          </div>

          {/* Bottom group: headline → socials (anchored to bottom on mobile) */}
          <div className="pb-6 sm:pb-0">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <p className="text-xl sm:text-2xl lg:text-3xl text-foreground font-light mb-6">
                {basics.headline}
              </p>
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <p className="text-lg text-muted-foreground/80 max-w-xl mx-auto lg:ml-auto lg:mr-0 mb-8 flex items-center justify-center lg:justify-end gap-2">
                <Sparkles size={18} className="text-accent" />
                {basics.tagline}
              </p>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <p className="flex items-center justify-center lg:justify-end gap-2 text-foreground mb-8">
                <MapPin size={16} className="text-accent" />
                {basics.location.city}, {basics.location.state}, {basics.location.country}
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="flex flex-wrap items-center justify-center lg:justify-end gap-4 mb-8">
                <a
                  href="#projects"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-dark transition-all hover:shadow-lg hover:shadow-accent/25"
                >
                  My Work
                  <ArrowDown size={18} className="group-hover:translate-y-1 transition-transform" />
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-muted text-foreground font-medium rounded-xl hover:bg-muted/80 transition-all border border-border"
                >
                  Reach Out
                </a>
                <a
                  href={basics.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-muted text-foreground font-medium rounded-xl hover:bg-muted/80 transition-all border border-border"
                >
                  Resume
                </a>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="flex items-center justify-center lg:justify-end gap-3 mb-16 md:mb-0">
                {socialLinks.slice(0, 4).map((social) => (
                  <motion.a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-xl bg-accent/10 text-foreground hover:bg-accent hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    {socialIcons[social.icon] || <Github size={20} />}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>{/* end bottom group */}
        </div>{/* end content wrapper */}

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs uppercase tracking-widest text-foreground">Scroll</span>
            <ArrowDown size={16} className="text-foreground" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
