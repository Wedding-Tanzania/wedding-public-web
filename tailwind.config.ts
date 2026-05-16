import type { Config } from 'tailwindcss';
import tokens from '../tokens.json';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blush: {
          50: tokens.brand.blush50,
          100: tokens.brand.blush100,
          200: tokens.brand.blush200,
          300: tokens.brand.blush300,
          400: tokens.brand.blush400,
          500: tokens.brand.blush500,
          600: tokens.brand.blush600,
          700: tokens.brand.blush700,
          800: tokens.brand.blush800,
          900: tokens.brand.blush900,
        },
        ivory: tokens.brand.ivory,
        paper: tokens.brand.paper,
        champagne: tokens.brand.champagne,
        'champagne-dk': tokens.brand.champagneDk,
        sage: tokens.brand.sage,
        'sage-dk': tokens.brand.sageDk,
        ink: {
          1: tokens.ink['1'],
          2: tokens.ink['2'],
          3: tokens.ink['3'],
          4: tokens.ink['4'],
        },
        bordr: tokens.border,
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: tokens.radius.sm,
        md: tokens.radius.md,
        lg: tokens.radius.lg,
      },
      boxShadow: {
        soft: tokens.elevation.soft,
        brand: tokens.elevation.brand,
      },
      letterSpacing: {
        widest2: '0.28em',
        widest3: '0.3em',
        widest4: '0.36em',
      },
      maxWidth: { wrap: '1200px' },
    },
  },
  plugins: [],
};

export default config;
