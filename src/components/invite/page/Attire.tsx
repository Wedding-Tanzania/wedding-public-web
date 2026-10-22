'use client';

import { STR, type Attire as AttireRow, type Lang } from '@/lib/invite/wcz';
import { Photo } from './Photo';
import { labelStyle, usePal } from './palette';

/**
 * "Celebration colours": every colour the couple picked, with its name and a
 * man and a woman dressed in it, so guests see at a glance how to dress.
 * Without an uploaded outfit photo the pair is drawn inline, tinted in the
 * colour; a photo the couple uploaded takes the pair's place.
 */
export function Attire({ items, lang, note }: { items: AttireRow[]; lang: Lang; note: string }) {
  const P = usePal();
  const S = STR[lang];
  const names = items.map((a) => (lang === 'sw' ? a.sw : a.en)).filter(Boolean);
  const sub = names.length > 2 ? `${names.slice(0, -1).join(', ')} ${lang === 'sw' ? 'na' : 'and'} ${names[names.length - 1]}` : names.join(lang === 'sw' ? ' na ' : ' and ');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 22 }}>
      <div style={{ fontSize: 15, color: P.ink_(74), maxWidth: 360 }}>{sub !== '' ? `${S.wearColours}: ${sub}.` : note}</div>
      {/* Two to a row; an odd last colour sits in the middle. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '26px 16px', width: '100%' }}>
        {items.map((a, i) => (
          <div key={`${a.hex}-${i}`} data-attire={a.hex} style={{ flex: items.length === 1 ? '0 1 280px' : '0 1 calc(50% - 8px)', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div aria-hidden style={{ width: 44, height: 44, borderRadius: '50%', background: a.hex, boxShadow: `inset 0 0 0 1px rgba(31,42,26,0.14), 0 0 0 4px ${P.ink_(8)}` }} />
            <div style={{ position: 'relative', width: '100%', maxWidth: 200, aspectRatio: '4 / 5', borderRadius: '100px 100px 14px 14px', overflow: 'hidden', background: P.panel, boxShadow: `inset 0 0 0 1px ${P.ink_(12)}` }}>
              {a.photo !== null && a.photo !== '' ? (
                <Photo ph={{ id: `a${i}`, src: a.photo, w: 800, h: 1000 }} crop={null} alt={`${lang === 'sw' ? a.sw : a.en}: ${S.men}, ${S.women}`} />
              ) : (
                <CouplePair colour={a.hex} bg={P.panel} labels={{ men: S.men, women: S.women }} />
              )}
            </div>
            <div style={{ ...labelStyle(P, 11, 0.18, P.ink), fontWeight: 600 }}>{lang === 'sw' ? a.sw : a.en}</div>
          </div>
        ))}
      </div>
      {sub !== '' && note !== '' && <div style={{ fontSize: 14, color: P.ink_(66), maxWidth: 340 }}>{note}</div>}
    </div>
  );
}

/** A darker and a lighter shade of the colour for folds and highlights. */
function shade(c: string, pct: number): string {
  const n = parseInt(c.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v + (pct / 100) * (pct > 0 ? 255 - v : v))));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * A man in a suit and a woman in a gown, both in the celebration colour,
 * standing in an arch. Skin and hair are neutral so the colour is the point.
 */
export function CouplePair({ colour, bg, labels }: { colour: string; bg: string; labels: { men: string; women: string } }) {
  const dark = shade(colour, -22);
  const light = shade(colour, 18);
  const skin = '#8D5A3C';
  const hair = '#1E1A17';
  return (
    <svg viewBox="0 0 200 250" width="100%" height="100%" role="img" aria-label={`${labels.men}, ${labels.women}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`arch-${colour.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} stopOpacity="0.35" />
          <stop offset="1" stopColor={bg} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="200" height="250" fill={bg} />
      <path d="M22 250V110a78 78 0 0 1 156 0v140z" fill={`url(#arch-${colour.slice(1)})`} />
      <path d="M22 250V110a78 78 0 0 1 156 0v140" fill="none" stroke={dark} strokeOpacity="0.25" strokeWidth="2" />
      <ellipse cx="100" cy="238" rx="78" ry="8" fill={dark} fillOpacity="0.12" />

      {/* Man */}
      <g transform="translate(40 0)">
        <rect x="18" y="128" width="34" height="100" rx="6" fill={dark} />
        <path d="M8 118c0-14 10-22 22-24h12c12 2 22 10 22 24v76H8z" fill={colour} />
        <path d="M28 96h14l-5 60-2 4-2-4z" fill="#F4EFE6" />
        <path d="M33 100h4l3 26-5 28-5-28z" fill={dark} />
        <path d="M8 118c0-14 10-22 22-24l-6 40-16 10z" fill={dark} fillOpacity="0.35" />
        <path d="M62 118c0-14-10-22-22-24l6 40 16 10z" fill={dark} fillOpacity="0.35" />
        <rect x="2" y="120" width="12" height="54" rx="6" fill={colour} />
        <rect x="56" y="120" width="12" height="54" rx="6" fill={colour} />
        <circle cx="8" cy="178" r="6" fill={skin} />
        <circle cx="62" cy="178" r="6" fill={skin} />
        <rect x="27" y="78" width="16" height="20" rx="6" fill={skin} />
        <ellipse cx="35" cy="66" rx="17" ry="19" fill={skin} />
        <path d="M18 62c0-12 8-20 17-20s17 8 17 20c-6-6-10-8-17-8s-11 2-17 8z" fill={hair} />
        <path d="M22 228h12l-2 12H20zM36 228h12l2 12H38z" fill={hair} />
      </g>

      {/* Woman */}
      <g transform="translate(104 0)">
        <path d="M12 240c0-50 4-96 22-118h8c18 22 22 68 22 118z" fill={colour} />
        <path d="M12 240c0-50 4-96 22-118l-8 30c-6 30-6 60-4 88z" fill={dark} fillOpacity="0.3" />
        <path d="M64 240c0-50-4-96-22-118l8 30c6 30 6 60 4 88z" fill={light} fillOpacity="0.4" />
        <path d="M28 122c0-6 4-12 10-12s10 6 10 12v10H28z" fill={colour} />
        <path d="M30 112c2-4 5-6 8-6s6 2 8 6" fill="none" stroke={dark} strokeOpacity="0.4" strokeWidth="1.5" />
        <path d="M14 118c4-6 10-10 14-10l-2 18c-6 14-10 30-10 46-6-16-8-36-2-54z" fill={skin} />
        <path d="M62 118c-4-6-10-10-14-10l2 18c6 14 10 30 10 46 6-16 8-36 2-54z" fill={skin} />
        <rect x="30" y="86" width="16" height="22" rx="6" fill={skin} />
        <ellipse cx="38" cy="70" rx="16" ry="18" fill={skin} />
        <path d="M20 70c0-14 8-24 18-24s18 10 18 24c0 6-2 12-4 16 2-10-2-20-14-20s-16 10-14 20c-2-4-4-10-4-16z" fill={hair} />
        <path d="M22 72c-4 10-6 24-2 38 4-8 4-22 2-38zM54 72c4 10 6 24 2 38-4-8-4-22-2-38z" fill={hair} />
        <circle cx="38" cy="112" r="2.5" fill={light} />
      </g>
    </svg>
  );
}
