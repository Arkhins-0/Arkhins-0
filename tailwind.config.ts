import type { Config } from 'tailwindcss';

/** rgb() channel token -> Tailwind colour with working /opacity modifiers */
const ch = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-raise': 'var(--bg-raise)',
        'bg-sink': 'var(--bg-sink)',
        ink: 'var(--fg)',
        'ink-dim': 'var(--fg-dim)',
        'ink-faint': 'var(--fg-faint)',

        accent: ch('--accent-rgb'),
        accent2: ch('--accent-2-rgb'),
        rose: ch('--n-rose-rgb'),
        cyan: ch('--n-cyan-rgb'),
        lime: ch('--n-lime-rgb'),
        violet: ch('--n-violet-rgb'),

        // legacy aliases still referenced by a few shared bits
        background: 'var(--bg)',
        foreground: 'var(--fg)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--fg-dim)',
        border: 'var(--border)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.055em',
      },
      // finer steps so /8 /12 /14 style colour-opacity modifiers resolve
      opacity: {
        3: '0.03',
        4: '0.04',
        6: '0.06',
        8: '0.08',
        12: '0.12',
        14: '0.14',
        15: '0.15',
        16: '0.16',
        18: '0.18',
        22: '0.22',
        35: '0.35',
        45: '0.45',
        55: '0.55',
        65: '0.65',
        85: '0.85',
      },
      screens: {
        xs: '420px',
      },
      animation: {
        'drift-a': 'drift-a 26s ease-in-out infinite',
        'drift-b': 'drift-b 34s ease-in-out infinite',
        'sweep-y': 'sweep-y 5.5s cubic-bezier(.5,0,.5,1) infinite',
        'rail-run': 'rail-run 3.2s linear infinite',
        ticker: 'ticker var(--ticker-dur, 38s) linear infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0,0,.2,1) infinite',
        flicker: 'flicker 7s linear infinite',
        'grid-slide': 'grid-slide 3.6s linear infinite',
        'orbit-slow': 'rotate360 26s linear infinite',
        'orbit-rev': 'rotate360 60s linear infinite reverse',
      },
      transitionTimingFunction: {
        swift: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
