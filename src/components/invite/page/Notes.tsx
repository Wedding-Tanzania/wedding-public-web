'use client';

import { STR, notesOf, telUrl, type InviteDesign, type Lang } from '@/lib/invite/wcz';
import { Icon } from './Icon';
import { labelStyle, monoStyle, usePal } from './palette';

/**
 * "A note for our guests": numbered rows (adults only, be on time, invitation
 * required, or whatever the couple wrote) and the RSVP contacts with their
 * numbers tappable to call.
 */
export function Notes({ d, lang }: { d: InviteDesign; lang: Lang }) {
  const P = usePal();
  const S = STR[lang];
  const rows = notesOf(d, lang);
  const contacts = d.kamati.filter((k) => k.name !== '');
  const n = (i: number) => String(i + 1).padStart(2, '0');
  return (
    <div data-notes="1" style={{ display: 'flex', flexDirection: 'column' }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr)', gap: 12, padding: '16px 0', borderTop: i > 0 ? `1px solid ${P.ink_(12)}` : 'none' }}>
          <div style={{ ...monoStyle(P, 11, 0.06, P.accBg), paddingTop: 5 }}>{n(i)}</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 300, letterSpacing: '-0.01em' }}>{r.title}</div>
            {r.body !== '' && <div style={{ fontSize: 14, color: P.ink_(72), marginTop: 4, lineHeight: 1.5 }}>{r.body}</div>}
          </div>
        </div>
      ))}
      {contacts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr)', gap: 12, padding: '16px 0', borderTop: `1px solid ${P.ink_(12)}` }}>
          <div style={{ ...monoStyle(P, 11, 0.06, P.accBg), paddingTop: 5 }}>{n(rows.length)}</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 300, letterSpacing: '-0.01em' }}>{S.rsvpContacts}</div>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
              {contacts.map((k, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 0' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{k.name}</div>
                    {(k[lang] || k.sw || k.en) !== '' && <div style={labelStyle(P, 10, 0.12, P.ink_(60))}>{k[lang] || k.sw || k.en}</div>}
                  </div>
                  {k.phone !== '' && (
                    <a href={telUrl(k.phone)} aria-label={`${S.call} ${k.name}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 999, textDecoration: 'none', color: P.ink, boxShadow: `inset 0 0 0 1px ${P.ink_(26)}`, ...monoStyle(P, 13, 0.04), fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                      <Icon name="Call" size={15} />
                      {k.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
