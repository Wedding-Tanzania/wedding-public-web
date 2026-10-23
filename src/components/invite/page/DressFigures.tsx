'use client';

import { useId } from 'react';

/**
 * The dress code on people: a man in a suit and a woman in a gown, drawn at
 * about seven and a half heads so they read as adults, not icons. His suit
 * takes the first celebration colour and her gown the second (one colour
 * dresses both); the tie, pocket square and clutch take the third and
 * fourth. Line work is the template ink at low alpha so the pair sits on a
 * light or a dark page alike. One inline SVG, no images.
 */
export interface DressFiguresProps {
  /** The celebration colours in order: suit, gown, then the accents. */
  colours: string[];
  /** The page ink, for outlines and the ground shadow. */
  ink: string;
  /** The template's label face, for the two captions. */
  font: string;
  labels: { men: string; women: string };
}

/** A darker (negative) or lighter (positive) shade of a hex colour, by percent. */
export function shade(c: string, pct: number): string {
  const n = parseInt(c.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v + (pct / 100) * (pct > 0 ? 255 - v : v))));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const SKIN = '#8D5B3B';
const SKIN_LIGHT = '#A9754F';
const SKIN_DARK = '#74482D';
const HAIR = '#1E1A17';
const SHIRT = '#F6F2EA';
const SHOE = '#2A211C';

export function DressFigures({ colours, ink, font, labels }: DressFiguresProps) {
  const uid = useId().replace(/:/g, '');
  const suit = colours[0] ?? '#1F2A44';
  const gown = colours[1] ?? suit;
  // With two colours the accents cross over: her colour on his tie, his on her clutch.
  const tie = colours[2] ?? (gown !== suit ? gown : shade(suit, -32));
  const square = colours[3] ?? tie;
  const clutch = colours[3] ?? colours[2] ?? (gown !== suit ? suit : shade(gown, -28));
  const suitD = shade(suit, -22);
  const suitDD = shade(suit, -40);
  const gownD = shade(gown, -20);
  const gownL = shade(gown, 26);
  const line = { stroke: ink, strokeOpacity: 0.22, strokeWidth: 1, strokeLinejoin: 'round' as const };

  return (
    <svg viewBox="0 0 340 360" width="100%" height="100%" role="img" aria-label={`${labels.men}, ${labels.women}`} style={{ display: 'block', fontFamily: font }}>
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={ink} stopOpacity="0.07" />
          <stop offset="1" stopColor={ink} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* A soft arch behind the pair and the floor they stand on. */}
      <path d="M40 340V140a130 130 0 0 1 260 0v200z" fill={`url(#g${uid})`} />
      <ellipse cx="105" cy="333" rx="44" ry="5" fill={ink} fillOpacity="0.12" />
      <ellipse cx="235" cy="333" rx="72" ry="5" fill={ink} fillOpacity="0.12" />

      {/* Man: head top 24, ground 332, a head of 41. */}
      <g>
        <path d="M78 200h26l-2 122H80z" fill={shade(suit, -6)} {...line} />
        <path d="M106 200h26l-2 122h-22z" fill={shade(suit, -6)} {...line} />
        <path d="M104 200v120" stroke={suitDD} strokeOpacity="0.5" strokeWidth="1" />
        <path d="M76 320h30c4 0 6 3 6 6v4H74v-4c0-3 1-6 2-6z" fill={SHOE} />
        <path d="M104 320h30c4 0 6 3 6 6v4h-38v-4c0-3 1-6 2-6z" fill={SHOE} />
        <path d="M64 92l-8 112h18l10-108z" fill={suit} {...line} />
        <path d="M146 92l8 112h-18l-10-108z" fill={suit} {...line} />
        <ellipse cx="65" cy="212" rx="8" ry="10" fill={SKIN} />
        <ellipse cx="145" cy="212" rx="8" ry="10" fill={SKIN} />
        <path d="M56 200h18v4H56zM136 200h18v4h-18z" fill={SHIRT} />
        <path d="M62 90c8-8 18-11 30-12h26c12 1 22 4 30 12l4 116H58z" fill={suit} {...line} />
        <path d="M92 78l13 10 13-10-9 78h-8z" fill={SHIRT} />
        <path d="M90 78l15 14-4 64-17-56z" fill={suitD} />
        <path d="M120 78l-15 14 4 64 17-56z" fill={suitD} />
        <path d="M100 84h10l-2 6h-6z" fill={shade(tie, -20)} />
        <path d="M105 88l-4 8 2 46 2 6 2-6 2-46z" fill={tie} />
        <path d="M121 104h12l-1 5h-10z" fill={square} />
        <circle cx="105" cy="162" r="2" fill={suitDD} />
        <circle cx="105" cy="176" r="2" fill={suitDD} />
        <path d="M98 64h14v16c0 4-3 6-7 6s-7-2-7-6z" fill={SKIN_DARK} />
        <ellipse cx="105" cy="46" rx="17" ry="21" fill={SKIN} />
        <ellipse cx="99" cy="42" rx="7" ry="11" fill={SKIN_LIGHT} fillOpacity="0.55" />
        <circle cx="88" cy="48" r="3.5" fill={SKIN} />
        <circle cx="122" cy="48" r="3.5" fill={SKIN} />
        <path d="M87 40c0-14 8-24 18-24s18 10 18 24c-3-5-9-8-18-8s-15 3-18 8z" fill={HAIR} />
        <path d="M96 43h7M107 43h7" stroke={HAIR} strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M97 48h5M108 48h5" stroke={HAIR} strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M101 58q4 2 8 0" fill="none" stroke={SKIN_DARK} strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Woman: head top 32, ground 330, a head of 40. */}
      <g>
        <path d="M216 50c0-16 8-28 19-28s19 12 19 28c0 20 6 36 4 52h-46c-2-16 4-32 4-52z" fill={HAIR} />
        <path d="M217 318h12l2 12h-6l-2-6-2 6h-6zM241 318h12l2 12h-6l-2-6-2 6h-6z" fill={SHOE} />
        <path d="M209 110l-10 22-4 70h14l6-72z" fill={SKIN} />
        <path d="M261 110l10 22-2 56h-14l-2-56z" fill={SKIN} />
        <ellipse cx="203" cy="208" rx="7" ry="9" fill={SKIN} />
        <path d="M209 96c8-8 16-12 26-12s18 4 26 12l-2 26h-48z" fill={SKIN} />
        <path d="M205 156c10 6 20 9 30 9s20-3 30-9c14 50 26 100 36 162H169c10-62 22-112 36-162z" fill={gown} {...line} />
        <path d="M226 162c-6 40-8 90-6 156h-12c-2-66 4-116 12-156z" fill={gownL} fillOpacity="0.5" />
        <path d="M250 162c8 40 12 90 10 156h12c2-66-6-116-16-156z" fill={gownD} fillOpacity="0.4" />
        <path d="M209 110c6-6 16-4 26 0c10-4 20-6 26 0l6 42c-10 7-20 10-32 10s-22-3-32-10z" fill={gown} {...line} />
        <path d="M213 90l-4 22M257 90l4 22" stroke={gown} strokeWidth="2" strokeLinecap="round" />
        <path d="M203 150c10 6 20 9 32 9s22-3 32-9v8c-10 6-20 9-32 9s-22-3-32-9z" fill={gownD} />
        <ellipse cx="264" cy="190" rx="7" ry="9" fill={SKIN} />
        <rect x="252" y="186" width="30" height="16" rx="3" fill={clutch} {...line} />
        <circle cx="267" cy="190" r="2" fill={shade(clutch, 40)} />
        <path d="M229 70h12v16c0 4-3 6-6 6s-6-2-6-6z" fill={SKIN_DARK} />
        <ellipse cx="235" cy="52" rx="16" ry="20" fill={SKIN} />
        <ellipse cx="230" cy="48" rx="6" ry="10" fill={SKIN_LIGHT} fillOpacity="0.55" />
        <path d="M219 46c0-14 6-22 16-22s16 8 16 22c-4-6-9-9-16-9s-12 3-16 9z" fill={HAIR} />
        <path d="M226 49h7M237 49h7" stroke={HAIR} strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M227 54h5M238 54h5" stroke={HAIR} strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M231 64q4 2 8 0" fill="none" stroke={SKIN_DARK} strokeWidth="1" strokeLinecap="round" />
        <circle cx="235" cy="92" r="2.2" fill={square} />
      </g>

      <text x="105" y="354" textAnchor="middle" fontSize="10" letterSpacing="2" fill={ink} fillOpacity="0.72">
        {labels.men.toUpperCase()}
      </text>
      <text x="235" y="354" textAnchor="middle" fontSize="10" letterSpacing="2" fill={ink} fillOpacity="0.72">
        {labels.women.toUpperCase()}
      </text>
    </svg>
  );
}
