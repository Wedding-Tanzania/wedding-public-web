import type { Config } from 'tailwindcss';
import tokens from './tokens.json';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primitives
        herb: tokens.primitives.herb,
        linen: tokens.primitives.linen,
        paper: tokens.primitives.paper,
        champagne: tokens.primitives.champagne,        // champagne-light / -dark
        coral: tokens.primitives.coral,                // coral-light / -dark
        ink: tokens.primitives.ink,                    // ink-1..4
        ledger: tokens.primitives.ledger,
        bordr: tokens.primitives.border.default,       // class: border-bordr
        rule: tokens.primitives.border.rule,           // class: border-rule

        // Semantic helpers
        brand: tokens.primitives.herb[600],            // class: bg-brand
        finance: tokens.primitives.herb[800],

        // Signals
        ok: tokens.primitives.signal.ok,
        'ok-bg': tokens.primitives.signal.okBg,
        due: tokens.primitives.signal.due,
        'due-bg': tokens.primitives.signal.dueBg,
        info: tokens.primitives.signal.info,
        'info-bg': tokens.primitives.signal.infoBg,

        // Mobile-money / bank rails
        rails: tokens.primitives.rails,
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontWeight: {
        '200': '200',
        '300': '300',
        '400': '400',
        '500': '500',
        '600': '600',
        '700': '700',
        '800': '800',
      },
      borderRadius: {
        none: tokens.radius.none,
        sm: tokens.radius.sm,
        md: tokens.radius.md,
        lg: tokens.radius.lg,
        full: tokens.radius.full,
      },
      boxShadow: {
        soft: tokens.elevation.soft,
        brand: tokens.elevation.brand,
        trust: tokens.elevation.trust,
      },
      letterSpacing: {
        tightest: tokens.typography.letterSpacing.tightest,
        tight: tokens.typography.letterSpacing.tight,
        wide: tokens.typography.letterSpacing.wide,
        wider: tokens.typography.letterSpacing.wider,
        widest: tokens.typography.letterSpacing.widest,
      },
      maxWidth: { wrap: '1200px' },
    },
  },
  plugins: [],
};

export default config;
