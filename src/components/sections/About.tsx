'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Calendar, Languages, Award, UserRound } from 'lucide-react';
import portfolioData from '@/data/portfolio.json';
import { RevealOnScroll } from '@/components/ui/Animations';

const languageTexts: Record<string, { native: string; translation: string }> = {
  Tamil: {
    native: 'என் நெஞ்சில் குடியிருக்கும்...',
    translation: 'If you like this, we can be friends.😎'
  },
  English: {
    native: "Isn't it obvious? I speak English.",
    translation: 'Professional working proficiency in English.☺️'
  },
  Japanese: {
    native: '飛ばねぇ豚は、ただの豚だ。',
    translation: 'I used to watch with my eyes; now I watch with my mind. [JLPT-N3]😇'
  },
  Kannada: {
    native: 'ಮಾತನಾಡುವುದು ಮತ್ತು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು ಮಾತ್ರ.',
    translation: 'I can only Listen and Speak.😅'
  }
};

export function About() {
  const { basics, education, languages, interests } = portfolioData;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [displayedTranslation, setDisplayedTranslation] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);

  const currentLang = languages[currentIndex];
  const currentTexts = languageTexts[currentLang.name];

  // Language typewriter effect
  useEffect(() => {
    if (!currentTexts) return;

    const nativeText = currentTexts.native;
    const translationText = currentTexts.translation;
    let currentCharIndex = 0;
    setDisplayedText('');
    setDisplayedTranslation('');
    setShowTranslation(false);

    const typeInterval = setInterval(() => {
      if (currentCharIndex < nativeText.length) {
        setDisplayedText(nativeText.slice(0, currentCharIndex + 1));
        currentCharIndex++;
      } else {
        clearInterval(typeInterval);
        setShowTranslation(true);

        let transCharIndex = 0;
        const typeTransInterval = setInterval(() => {
          if (transCharIndex < translationText.length) {
            setDisplayedTranslation(translationText.slice(0, transCharIndex + 1));
            transCharIndex++;
          } else {
            clearInterval(typeTransInterval);

            setTimeout(() => {
              let reverseTransIndex = translationText.length;
              const reverseTransInterval = setInterval(() => {
                if (reverseTransIndex > 0) {
                  reverseTransIndex--;
                  setDisplayedTranslation(translationText.slice(0, reverseTransIndex));
                } else {
                  clearInterval(reverseTransInterval);
                  setShowTranslation(false);

                  let reverseCharIndex = nativeText.length;
                  const reverseInterval = setInterval(() => {
                    if (reverseCharIndex > 0) {
                      reverseCharIndex--;
                      setDisplayedText(nativeText.slice(0, reverseCharIndex));
                    } else {
                      clearInterval(reverseInterval);
                      setTimeout(() => {
                        setCurrentIndex((prev) => (prev + 1) % languages.length);
                      }, 1000);
                    }
                  }, 80);
                  return () => clearInterval(reverseInterval);
                }
              }, 80);
              return () => clearInterval(reverseTransInterval);
            }, 3000);
          }
        }, 80);
        return () => clearInterval(typeTransInterval);
      }
    }, 80);

    return () => clearInterval(typeInterval);
  }, [currentIndex, languages.length, currentTexts]);

  return (
    <section id="about" className="section-padding">
      <div className="container-custom">
        {/* Section Header */}
        <RevealOnScroll className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4">
            About <span className="text-gradient">Me</span>
          </h2>
          <p className="text-bold text-foreground max-w-2xl mx-auto">
            Get to know more about my background, education, and what drives me
          </p>
        </RevealOnScroll>

        {/* ─── Row 1: About Text (left) + Profile Image (right) ─── */}
        <RevealOnScroll>
          <div className="flex flex-col lg:flex-row items-center gap-10 mb-20">
            {/* Profile image – square with 3 rounded corners */}
            <div className="flex-shrink-0">
              <div
                className="w-64 h-64 lg:w-80 lg:h-80 overflow-hidden transition-transform duration-300 hover:scale-105"
                style={{ borderRadius: '1.5rem 1.5rem 1.5rem 0' }}
              >
                <Image
                  src={basics.profilePicture}
                  alt={basics.name}
                  width={320}
                  height={320}
                  className="w-full h-full object-cover duration-200"
                />
              </div>
            </div>
            {/* Bio text */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-1 rounded-lg bg-accent/10">
                  <UserRound size={30} className="text-accent" />
                </div>
                <h3 className="text-2xl font-semibold">Who <span className="text-gradient">I Am</span></h3>
              </div>
              <p className="text-foreground leading-relaxed text-lg">
                {basics.bio}
              </p>
            </div>
          </div>
        </RevealOnScroll>

        {/* ─── Row 2: Education Horizontal Cards ─── */}
        <RevealOnScroll className="mb-20">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-accent/10">
              <GraduationCap size={30} className="text-accent" />
            </div>
            <h3 className="text-2xl font-semibold">Education</h3>
          </div>

          {/* Horizontal scrolling cards */}
          <div className="flex overflow-x-auto gap-12 p-5 scrollbar-hide">
            {education.map((edu) => (
              <motion.div
                key={edu.id}
                whileHover={{ scale: 1.1 }}
                className="relative flex-shrink-0 w-80 p-5 rounded-2xl border border-accent bg-muted/20 backdrop-blur-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Logo from JSON */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-muted/30">
                    <Image
                      src={edu.logo}
                      alt={edu.institution}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm leading-tight">{edu.degree}</h4>
                    <p className="text-xs text-foreground mt-1 wrap">{edu.institution}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-foreground flex items-center gap-1">
                        <Calendar size={11} />
                        {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                      </span>
                      <span className="text-xs font-medium text-foreground bg-accent rounded-md px-0.5">{edu.score}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </RevealOnScroll>

        {/* ─── Row 3: Languages (left) + Interests (right) ─── */}
        <RevealOnScroll>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Language animation */}
            <div className="p-6 min-h-[280px] flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Languages size={30} className="text-accent" />
                </div>
                <h3 className="text-2xl font-semibold">Languages</h3>
              </div>
              {/* Typewriter Display */}
              <div className="space-y-4 mb-6 min-h-[120px] flex flex-col justify-center">
                <div className="min-h-[60px] flex items-center">
                  <h4 className="text-2xl font-bold">
                    {displayedText}
                    {!showTranslation && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-0.5 h-6 bg-accent ml-1 align-middle"
                      />
                    )}
                  </h4>
                </div>

                <div className="min-h-[40px] flex items-center">
                  <AnimatePresence mode="wait">
                    {showTranslation && currentTexts && (
                      <motion.p
                        key={`trans-${currentIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-sm font-bold text-foreground"
                      >
                        {displayedTranslation}
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="inline-block w-0.5 h-4 bg-accent ml-1 align-middle"
                        />
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Language Buttons */}
              <div className="flex flex-wrap gap-2 select-none">
                {languages.map((lang, index) => (
                  <span
                    key={lang.id}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-default ${
                      index === currentIndex
                        ? 'text-accent font-semibold bg-white border border-accent'
                        : 'text-foreground bg-muted/50'
                    }`}
                  >
                    {lang.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Interests – static badges */}
            <div className="p-6 min-h-[280px] flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Award size={30} className="text-accent" />
                </div>
                <h3 className="text-2xl font-semibold">Interests</h3>
              </div>
              <div className="flex flex-wrap gap-2 px-3 py-1.5">
                {interests.map((interest) => (
                  <motion.span
                    whileHover={{ y: -3 } }
                    key={interest.id}
                    className="px-3 py-1.5 text-sm rounded-lg bg-accent/10 text-foreground border border-accent/20 transition-colors duration-200 hover:bg-accent hover:text-white hover:border-accent cursor-pointer"
                  >
                    {interest.name}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
