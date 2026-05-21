import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        noir: '#0c0b0e',
        ink: '#141318',
        surface: '#17161b',
        surface2: '#201e26',
        line: '#322e29',
        cream: '#f3eee3',
        muted: '#9c9589',
        gold: {
          DEFAULT: '#c9a24b',
          light: '#e7cf95',
          dark: '#9c7a32',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.25em',
      },
    },
  },
  plugins: [],
};

export default config;
