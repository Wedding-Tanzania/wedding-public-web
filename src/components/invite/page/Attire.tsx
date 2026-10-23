'use client';

import { STR, type Attire as AttireRow, type Lang } from '@/lib/invite/wcz';
import { DressFigures } from './DressFigures';
import { Photo } from './Photo';
import { labelStyle, usePal } from './palette';

/**
 * "Celebration colours": a man and a woman dressed in the colours the couple
 * picked, then every colour as a named swatch, then the dress note. Outfit
 * photos the couple uploaded follow the swatches, so a real outfit is never
 * hidden behind the drawing.
 */
export function Attire({ items, lang, note }: { items: AttireRow[]; lang: Lang; note: string }) {
  const P = usePal();
  const S = STR[lang];
  const nameOf = (a: AttireRow) => (lang === 'sw' ? a.sw : a.en) || a.en || a.sw;
  const names = items.map(nameOf).filter(Boolean);
  const sub = names.length > 2 ? `${names.slice(0, -1).join(', ')} ${lang === 'sw' ? 'na' : 'and'} ${names[names.length - 1]}` : names.join(lang === 'sw' ? ' na ' : ' and ');
  const photos = items.filter((a) => a.photo !== null && a.photo !== '');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 22 }}>
      <div style={{ fontSize: 15, color: P.ink_(74), maxWidth: 360 }}>{sub !== '' ? `${S.wearColours}: ${sub}.` : note}</div>
      <div data-dress-figures="1" style={{ width: '100%', maxWidth: 300, aspectRatio: '340 / 360' }}>
        <DressFigures colours={items.map((a) => a.hex)} ink={P.ink} font={P.lf} labels={{ men: S.men, women: S.women }} />
      </div>
      <div data-dress-swatches="1" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px 22px', width: '100%' }}>
        {items.map((a, i) => (
          <div key={`${a.hex}-${i}`} data-attire={a.hex} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 72 }}>
            <div aria-hidden style={{ width: 40, height: 40, borderRadius: '50%', background: a.hex, boxShadow: `inset 0 0 0 1px rgba(31,42,26,0.14), 0 0 0 4px ${P.ink_(8)}` }} />
            <div style={{ ...labelStyle(P, 11, 0.18, P.ink), fontWeight: 600 }}>{nameOf(a)}</div>
          </div>
        ))}
      </div>
      {photos.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, width: '100%' }}>
          {photos.map((a, i) => (
            <div key={`${a.hex}-p${i}`} style={{ position: 'relative', width: 120, aspectRatio: '4 / 5', borderRadius: '60px 60px 12px 12px', overflow: 'hidden', background: P.panel, boxShadow: `inset 0 0 0 1px ${P.ink_(12)}` }}>
              <Photo ph={{ id: `a${i}`, src: a.photo ?? '', w: 800, h: 1000 }} crop={null} alt={`${nameOf(a)}: ${S.men}, ${S.women}`} />
            </div>
          ))}
        </div>
      )}
      {sub !== '' && note !== '' && <div style={{ fontSize: 14, color: P.ink_(66), maxWidth: 340 }}>{note}</div>}
    </div>
  );
}
