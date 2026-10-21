'use client';


import { createContext, useContext, type CSSProperties } from 'react';
import { contrast, mix, onColor, type Theme } from '@/lib/invite/wcz';
import { WEB_FONTS } from '../InviteCard';

/**
 * The colours one stretch of the page is drawn in. Every tint the design
 * wrote as color-mix() is mixed here in JS, so the page renders the same on
 * old Android browsers that have no color-mix. A "bands" page inverts every
 * other section, which is just a second palette with bg and ink swapped.
 */
export interface Pal {
  bg: string;
  ink: string;
  accent: string;
  accBg: string;
  panel: string;
  pink: string;
  onacc: string;
  accPn: string;
  /** ink mixed into bg, p percent */
  ink_: (p: number) => string;
  /** accent mixed into bg */
  acc_: (p: number) => string;
  /** pink (text on panel) mixed into panel */
  pink_: (p: number) => string;
  /** on-accent mixed into accent */
  on_: (p: number) => string;
  nw: number;
  upper: boolean;
  lf: string;
  sans: string;
  mono: string;
}

export function palette(th: Theme, inverted = false): Pal {
  // A ticket template (t15) inks for its paper panel, not its ground: on the
  // page, where text sits on the ground, fall back to whichever of the dark
  // ink or white reads on it.
  const pageInk = contrast(th.ink, th.bg) >= 4.5 ? th.ink : onColor(th.bg);
  const bg = inverted ? pageInk : th.bg;
  const ink = inverted ? th.bg : pageInk;
  const accBg = contrast(th.accent, bg) >= 3 ? th.accent : ink;
  return {
    bg,
    ink,
    accent: th.accent,
    accBg,
    panel: th.panel,
    pink: th.pink,
    onacc: th.onacc,
    accPn: th.accPn,
    ink_: (p) => mix(ink, p, bg),
    acc_: (p) => mix(th.accent, p, bg),
    pink_: (p) => mix(th.pink, p, th.panel),
    on_: (p) => mix(th.onacc, p, th.accent),
    nw: th.nw,
    upper: th.upper,
    lf: th.labels === 'sans' ? WEB_FONTS.sans : WEB_FONTS.mono,
    sans: WEB_FONTS.sans,
    mono: WEB_FONTS.mono,
  };
}

export const PalContext = createContext<Pal | null>(null);

export function usePal(): Pal {
  const p = useContext(PalContext);
  if (p === null) throw new Error('usePal outside an invitation');
  return p;
}

/** The couple's names: template weight, case and tracking. */
export function nameStyle(p: Pal, size: number, lh = 1.05): CSSProperties {
  return {
    fontSize: size,
    lineHeight: lh,
    fontWeight: p.nw,
    textTransform: p.upper ? 'uppercase' : 'none',
    letterSpacing: p.upper ? '0.08em' : '-0.025em',
  };
}

/** Small uppercase labels in the template's label face. */
export function labelStyle(p: Pal, size: number, track: number, color: string): CSSProperties {
  return { fontFamily: p.lf, fontSize: size, letterSpacing: `${track}em`, textTransform: 'uppercase', color };
}

export function monoStyle(p: Pal, size: number, track: number, color?: string): CSSProperties {
  return { fontFamily: p.mono, fontSize: size, letterSpacing: `${track}em`, ...(color ? { color } : {}) };
}
