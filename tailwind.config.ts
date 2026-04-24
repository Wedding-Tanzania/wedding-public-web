import type { Config } from 'tailwindcss';
import tokens from '../tokens.json';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: tokens.brand.primary,
          dark: tokens.brand.primaryDark,
          light: tokens.brand.primaryLight,
        },
        secondary: {
          DEFAULT: tokens.brand.secondary,
          light: tokens.brand.secondaryLight,
        },
        accent: tokens.brand.accent,
        success: tokens.brand.success,
        warning: tokens.brand.warning,
        error: tokens.brand.error,
        info: tokens.brand.info,
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm: tokens.radius.sm,
        md: tokens.radius.md,
        lg: tokens.radius.lg,
        xl: tokens.radius.xl,
      },
      boxShadow: {
        sm: tokens.elevation.sm,
        md: tokens.elevation.md,
        lg: tokens.elevation.lg,
        xl: tokens.elevation.xl,
      },
    },
  },
  plugins: [],
};

export default config;
