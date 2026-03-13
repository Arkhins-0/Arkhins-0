'use client';

import { motion } from 'framer-motion';

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
}

// Passthrough — no scroll-gating, elements render immediately
export function RevealOnScroll({
  children,
  className = '',
}: RevealOnScrollProps) {
  return <div className={className}>{children}</div>;
}

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className = '',
}: StaggerContainerProps) {
  return <div className={className}>{children}</div>;
}

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export function TextReveal({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`inline-block ${className}`}>
      {text}
    </span>
  );
}

