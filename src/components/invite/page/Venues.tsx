'use client';

import { STR, exactMapUrl, mapUrl, venueBlurb, type Lang, type Venue } from '@/lib/invite/wcz';
import { Icon } from './Icon';
import { Photo } from './Photo';
import { labelStyle, monoStyle, usePal } from './palette';

/**
 * Ceremony and reception cards: the venue photo on top (the couple's upload
 * or the venue vendor's cover), the name, address and time, a short blurb
 * and one big map button: "Open in Google Maps" to the couple's own Google
 * Maps link when they saved one (the exact pin), else "Open reception map",
 * a Google Maps search for the name and address.
 */
export function Venues({ items, lang }: { items: { label: string; kind: 'ceremony' | 'reception'; v: Venue }[]; lang: Lang }) {
  const P = usePal();
  const S = STR[lang];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {items.map((x) => {
        const photo = x.v.photo ?? null;
        const exact = exactMapUrl(x.v);
        return (
          <div key={x.label} data-venue={x.label} style={{ borderRadius: 18, overflow: 'hidden', background: P.panel, color: P.pink, boxShadow: `inset 0 0 0 1px ${P.pink_(12)}, 0 14px 34px rgba(26,37,22,0.12)` }}>
            {photo !== null && photo !== '' && (
              <div style={{ position: 'relative', aspectRatio: '16 / 10', background: P.acc_(30), overflow: 'hidden' }}>
                <Photo ph={{ id: x.label, src: photo, w: 1600, h: 1000 }} crop={null} alt={x.v.name} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(26,37,22,0.35) 100%)' }} />
              </div>
            )}
            <div style={{ padding: '22px 22px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 }}>
              <div style={labelStyle(P, 10, 0.26, P.accPn)}>{x.label}</div>
              <div style={{ fontSize: 26, fontWeight: 300, letterSpacing: '-0.01em', marginTop: 4, textWrap: 'balance' }}>{x.v.name}</div>
              {x.v.addr !== '' && <div style={{ fontSize: 15, fontStyle: 'italic', color: P.pink_(70) }}>{x.v.addr}</div>}
              {x.v.time !== '' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 10 }}>
                  <div style={{ width: 1, height: 18, background: P.pink_(24) }} />
                  <div style={{ color: P.accPn }}>
                    <Icon name="Schedule" size={18} />
                  </div>
                  <div style={{ ...monoStyle(P, 13, 0.16), fontVariantNumeric: 'tabular-nums' }}>{x.v.time}</div>
                </div>
              )}
              <div style={{ fontSize: 15, fontStyle: 'italic', color: P.pink_(76), maxWidth: 320, marginTop: 10, lineHeight: 1.5 }}>{venueBlurb(x.v, lang, x.kind)}</div>
              <a
                href={exact ?? mapUrl(x.v)}
                target="_blank"
                rel="noopener noreferrer"
                data-map-link={exact !== null ? 'exact' : '1'}
                style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 22px', borderRadius: 999, textDecoration: 'none', background: P.accent, color: P.onacc, fontFamily: P.sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}
              >
                <Icon name="LocationOn" size={16} />
                {exact !== null ? S.openGoogleMaps : S.openMapFor(x.label)}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
