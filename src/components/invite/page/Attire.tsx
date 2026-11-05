'use client';

import { STR, type Attire as AttireRow, type Lang } from '@/lib/invite/wcz';
import { libraryImage, libraryLook } from '@/lib/invite/attire-library';
import { Photo } from './Photo';
import { labelStyle, usePal } from './palette';

/**
 * "Celebration colours": for every colour the couple picked, a photograph of
 * a man and a woman dressed in it (the couple's own outfit photo when they
 * uploaded one, else the library look for that colour), its swatch and its
 * name, then the dress note. Guests see real people in the colour, which is
 * what they need to shop for an outfit.
 */
export function Attire({ items, lang, note }: { items: AttireRow[]; lang: Lang; note: string }) {
  const P = usePal();
  const S = STR[lang];
  const nameOf = (a: AttireRow) => (lang === 'sw' ? a.sw : a.en) || a.en || a.sw;
  const names = items.map(nameOf).filter(Boolean);
  const sub = names.length > 2 ? `${names.slice(0, -1).join(', ')} ${lang === 'sw' ? 'na' : 'and'} ${names[names.length - 1]}` : names.join(lang === 'sw' ? ' na ' : ' and ');
  const two = items.length !== 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 22 }}>
      <div style={{ fontSize: 15, color: P.ink_(74), maxWidth: 360 }}>{sub !== '' ? `${S.wearColours}: ${sub}.` : note}</div>
      <div data-dress-looks="1" style={{ display: 'grid', gridTemplateColumns: two ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 220px)', justifyContent: 'center', gap: '22px 16px', width: '100%', maxWidth: 420 }}>
        {items.map((a, i) => {
          const own = a.photo !== null && a.photo !== '';
          const look = libraryLook(a.hex);
          const alt = `${nameOf(a)}: ${S.men}, ${S.women}`;
          return (
            <figure key={`${a.hex}-${i}`} data-attire={a.hex} data-look={own ? 'own' : look.key} style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', borderRadius: '999px 999px 14px 14px', overflow: 'hidden', background: P.panel, boxShadow: `inset 0 0 0 1px ${P.ink_(12)}, 0 10px 30px ${P.ink_(14)}` }}>
                {own ? (
                  <Photo ph={{ id: `a${i}`, src: a.photo ?? '', w: 720, h: 960 }} crop={null} alt={alt} />
                ) : (
                  // The library photographs are static files under /attire.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={libraryImage(look)} alt={alt} loading="lazy" decoding="async" width={720} height={960} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 18%' }} />
                )}
                <span aria-hidden style={{ position: 'absolute', left: '50%', bottom: 10, transform: 'translateX(-50%)', width: 30, height: 30, borderRadius: '50%', background: a.hex, boxShadow: 'inset 0 0 0 1px rgba(31,42,26,0.14), 0 0 0 3px rgba(255,255,255,0.9)' }} />
              </div>
              <figcaption style={{ ...labelStyle(P, 11, 0.18, P.ink), fontWeight: 600 }}>{nameOf(a)}</figcaption>
            </figure>
          );
        })}
      </div>
      {sub !== '' && note !== '' && <div style={{ fontSize: 14, color: P.ink_(66), maxWidth: 340 }}>{note}</div>}
    </div>
  );
}
