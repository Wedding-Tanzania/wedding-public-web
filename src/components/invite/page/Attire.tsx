'use client';

import { STR, type Attire as AttireRow, type Lang } from '@/lib/invite/wcz';
import { libraryImage, libraryLook, menVariant, type LookVariant } from '@/lib/invite/attire-library';
import { Photo } from './Photo';
import { labelStyle, usePal } from './palette';

/**
 * "Celebration colours", the women and the men apart. For every colour the
 * couple picked: the women's group shows a woman dressed in it and the men's
 * group a man dressed the way the couple chose (a suit in the colour, a
 * blazer in it with cream trousers, or a black suit with the colour on the
 * tie), each from the photo library unless the couple uploaded their own
 * outfit photo for that colour. A colour marked for the women only, or the
 * men only, appears in that group alone. Guests see real people in the
 * colour, which is what they need to shop for an outfit.
 */
export function Attire({ items, lang, note }: { items: AttireRow[]; lang: Lang; note: string }) {
  const P = usePal();
  const S = STR[lang];
  const nameOf = (a: AttireRow) => (lang === 'sw' ? a.sw : a.en) || a.en || a.sw;
  const names = items.map(nameOf).filter(Boolean);
  const sub = names.length > 2 ? `${names.slice(0, -1).join(', ')} ${lang === 'sw' ? 'na' : 'and'} ${names[names.length - 1]}` : names.join(lang === 'sw' ? ' na ' : ' and ');
  const groups: { key: 'women' | 'men'; title: string; rows: AttireRow[]; variant: (a: AttireRow) => LookVariant; caption: (a: AttireRow) => string | null }[] = [
    { key: 'women', title: S.women, rows: items.filter((a) => a.wear !== 'men'), variant: () => 'women', caption: () => null },
    { key: 'men', title: S.men, rows: items.filter((a) => a.wear !== 'women'), variant: (a) => menVariant(a.men), caption: (a) => S.menLook[a.men] },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 26 }}>
      <div style={{ fontSize: 15, color: P.ink_(74), maxWidth: 360 }}>{sub !== '' ? `${S.wearColours}: ${sub}.` : note}</div>
      {groups
        .filter((g) => g.rows.length > 0)
        .map((g) => {
          const two = g.rows.length !== 1;
          return (
            <section key={g.key} data-dress-group={g.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%' }}>
              <h3 style={{ ...labelStyle(P, 11, 0.22, P.ink_(70)), margin: 0, fontWeight: 600 }}>{g.title}</h3>
              <div data-dress-looks={g.key} style={{ display: 'grid', gridTemplateColumns: two ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 220px)', justifyContent: 'center', gap: '22px 16px', width: '100%', maxWidth: 420 }}>
                {g.rows.map((a, i) => {
                  const own = a.photo !== null && a.photo !== '';
                  const look = libraryLook(a.hex);
                  const variant = g.variant(a);
                  const caption = g.caption(a);
                  const alt = `${nameOf(a)}: ${g.title}${caption !== null ? `, ${caption}` : ''}`;
                  return (
                    <figure key={`${a.hex}-${i}`} data-attire={a.hex} data-look={own ? 'own' : `${look.key}-${variant}`} style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', borderRadius: '999px 999px 14px 14px', overflow: 'hidden', background: P.panel, boxShadow: `inset 0 0 0 1px ${P.ink_(12)}, 0 10px 30px ${P.ink_(14)}` }}>
                        {own ? (
                          <Photo ph={{ id: `a${g.key}${i}`, src: a.photo ?? '', w: 600, h: 800 }} crop={null} alt={alt} />
                        ) : (
                          // The library photographs are static files under /attire.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={libraryImage(look, variant)} alt={alt} loading="lazy" decoding="async" width={600} height={800} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 12%' }} />
                        )}
                        <span aria-hidden style={{ position: 'absolute', left: '50%', bottom: 10, transform: 'translateX(-50%)', width: 30, height: 30, borderRadius: '50%', background: a.hex, boxShadow: 'inset 0 0 0 1px rgba(31,42,26,0.14), 0 0 0 3px rgba(255,255,255,0.9)' }} />
                      </div>
                      <figcaption style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ ...labelStyle(P, 11, 0.18, P.ink), fontWeight: 600 }}>{nameOf(a)}</span>
                        {caption !== null && <span style={{ fontSize: 12, color: P.ink_(62) }}>{caption}</span>}
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            </section>
          );
        })}
      {sub !== '' && note !== '' && <div style={{ fontSize: 14, color: P.ink_(66), maxWidth: 340 }}>{note}</div>}
    </div>
  );
}
