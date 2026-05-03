import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cel-shaded palette (Section "Visual system" of the design spec).
        // Kept in sync with CSS vars in src/index.css.
        bg: '#FFE9C4',
        'bg-2': '#FFD089',
        paper: '#FFFBEF',
        ink: '#1F1A2A',
        'ink-soft': '#6A6275',
        primary: '#3CC4DA',
        'primary-deep': '#1F88A0',
        gold: '#FFC93C',
        plum: '#B970D2',
        rose: '#FF6F61',
        sage: '#7DD66F',
        line: '#1F1A2A',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
        script: ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
};

export default config;
