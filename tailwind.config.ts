import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#1a3a2e',
        bone: '#f5f1e8',
        bark: '#3d2817',
        moss: '#5a6b4a',
        amber: '#c87533',
        // ambient season-tinted accents
        'forest-deep': '#0f2620',
        'bone-warm': '#ede5d1',
        'bone-fade': 'rgba(245, 241, 232, 0.55)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      fontSize: {
        hero: ['clamp(4.5rem, 14vw, 12rem)', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
        display: ['clamp(3rem, 8vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        section: ['clamp(2rem, 5vw, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      },
      letterSpacing: {
        'caps': '0.22em',
      },
      transitionTimingFunction: {
        'organic': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'gentle': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
