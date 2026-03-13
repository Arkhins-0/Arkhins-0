'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X, Home, User, Briefcase, Code, Award, Trophy, Heart, Mail, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import portfolioData from '@/data/portfolio.json';

const navLinks = [
  { href: '#home', label: 'Home', icon: Home },
  { href: '#about', label: 'About', icon: User },
  { href: '#projects', label: 'Projects', icon: Briefcase },
  { href: '#experience', label: 'Experience', icon: Code },
  { href: '#skills', label: 'Skills', icon: Award },
  { href: '#certifications', label: 'Certifications', icon: Trophy },
  { href: '#volunteering', label: 'Volunteering', icon: Heart },
  { href: '#contact', label: 'Contact', icon: Mail },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = navLinks.map(link => link.href.replace('#', ''));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'py-3' : 'py-5'
      )}
    >
      <div className="container-custom">
        <nav
          className={cn(
            'relative flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-300',
            scrolled
              ? 'glass shadow-lg'
              : 'bg-transparent'
          )}
        >
          {/* Logo */}
          <Link
            href="#home"
            className="relative z-10 font-display text-xl font-bold tracking-tight"
          >
            <span className="text-gradient">{portfolioData.basics.name.split(' ')[0]}</span>
            <span className="text-foreground/80">.</span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <li key={link.href} className="relative">
                  {isActive && (
                    <motion.span
                      layoutId="activeSection"
                      className="absolute inset-0 bg-accent/10 rounded-lg"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Link
                    href={link.href}
                    className={cn(
                      'relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
                      isActive
                        ? 'text-accent'
                        : 'text-foreground hover:text-muted-foreground'
                    )}
                  >
                    <motion.div
                      animate={{ scale: isActive ? 1.2 : 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Icon size={20} />
                    </motion.div>
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          key="label"
                          initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                          animate={{ opacity: 1, width: 'auto', marginLeft: 8 }}
                          exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden whitespace-nowrap"
                        >
                          {link.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Theme toggle + CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-foreground hover:text-accent hover:bg-muted/60 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-dark transition-colors"
            >
              Let&apos;s Talk
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative z-10 p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Backdrop – closes mobile menu when tapping outside */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-4 right-4 mt-2 p-4 glass rounded-2xl md:hidden z-50"
            >
              <ul className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'block px-4 py-3 text-sm font-medium rounded-xl transition-colors',
                        activeSection === link.href.replace('#', '')
                          ? 'bg-accent/10 text-accent'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li className="mt-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Link
                      href="#contact"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 px-4 py-3 bg-accent text-white text-sm font-medium text-center rounded-xl"
                    >
                      Let&apos;s Talk
                    </Link>
                    <button
                      onClick={toggleTheme}
                      className="p-3 rounded-xl text-foreground hover:text-accent hover:bg-muted/60 transition-colors flex-shrink-0"
                      aria-label="Toggle theme"
                    >
                      {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                  </div>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
