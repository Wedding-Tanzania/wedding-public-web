'use client';

import { useState, type FormEvent } from 'react';
import { STR, type Lang } from '@/lib/invite/wcz';
import { labelStyle, monoStyle, usePal } from './palette';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';
const NAME_MAX = 80;
const MESSAGE_MAX = 500;

export interface WishEntry {
  id: string;
  name: string;
  message: string;
  createdAt?: string;
}

/**
 * "Leave a note for the couple", inline on the invitation, in the page's own
 * colours. Posts to the story guestbook (the same place /<slug>/wishes and the
 * table-card QR post to), so every wish lands in the couple's dashboard.
 */
export function Wishes({
  slug,
  couple,
  lang,
  initial,
  guestName,
  onUpdateResponse,
}: {
  slug: string;
  couple: string;
  lang: Lang;
  initial: WishEntry[];
  /** The guest's name from their invitation, used to prefill the form. */
  guestName: string | null;
  /** Scrolls to the RSVP block; null on the public page, which has no reply to change. */
  onUpdateResponse: (() => void) | null;
}) {
  const P = usePal();
  const S = STR[lang];
  const [entries, setEntries] = useState<WishEntry[]>(initial);
  const [name, setName] = useState(guestName ?? '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim() === '' || message.trim() === '') {
      setError(S.wishesMissing);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/story/${encodeURIComponent(slug)}/guestbook`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { entry?: WishEntry };
      if (data.entry !== undefined) setEntries([data.entry, ...entries]);
      setMessage('');
      setSent(true);
    } catch {
      setError(S.wishesFailed);
    } finally {
      setBusy(false);
    }
  }

  const field = { width: '100%', boxSizing: 'border-box' as const, padding: '12px 0', border: 0, borderBottom: `1px solid ${P.ink_(26)}`, background: 'transparent', color: P.ink, fontFamily: P.sans, fontSize: 16, outline: 'none' };
  const label = { ...labelStyle(P, 10, 0.22, P.ink_(66)), display: 'block', marginBottom: 2 };

  return (
    <div data-wishes="1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 300, letterSpacing: '-0.01em', textWrap: 'balance' }}>{S.wishesTitle(couple)}</div>
        <div style={{ fontSize: 15, color: P.ink_(74), maxWidth: 360 }}>{S.wishesLead}</div>
      </div>
      <div style={{ width: '100%', boxSizing: 'border-box', padding: '26px 22px', borderRadius: 16, background: P.panel, color: P.pink, boxShadow: `inset 0 0 0 1px ${P.pink_(12)}` }}>
        {sent ? (
          <div role="status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8, padding: '14px 0' }}>
            <svg width="30" height="28" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke={P.accPn} strokeWidth="1.5" />
            </svg>
            <div style={{ fontSize: 24, fontWeight: 300, letterSpacing: '-0.01em' }}>{S.wishesSent}</div>
            <div style={{ fontSize: 15, color: P.pink_(70), maxWidth: 300 }}>{S.wishesSentBody}</div>
            <button type="button" onClick={() => setSent(false)} style={{ marginTop: 12, background: 'transparent', border: 0, cursor: 'pointer', color: P.pink, fontFamily: P.sans, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'underline', textUnderlineOffset: 4 }}>
              {S.sendWishes}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {error !== null && (
              <p role="alert" style={{ margin: 0, fontSize: 14, color: '#B02020' }}>
                {error}
              </p>
            )}
            <label>
              <span style={label}>{S.wishName}</span>
              <input name="name" autoComplete="name" maxLength={NAME_MAX} value={name} onChange={(e) => setName(e.target.value)} placeholder={S.wishNamePh} style={field} />
            </label>
            <label>
              <span style={label}>{S.wishMessage}</span>
              <textarea name="message" maxLength={MESSAGE_MAX} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={S.wishMessagePh} style={{ ...field, minHeight: 96, resize: 'vertical' }} />
            </label>
            <button
              type="submit"
              disabled={busy}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 20px', border: 0, cursor: 'pointer', background: P.accent, color: P.onacc, fontFamily: P.sans, fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: busy ? 0.6 : 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor" />
              </svg>
              {busy ? S.sending : S.sendWishes}
            </button>
          </form>
        )}
      </div>
      {entries.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entries.slice(0, 3).map((en) => (
            <li key={en.id} style={{ padding: '12px 0', borderTop: `1px solid ${P.ink_(12)}` }}>
              <p style={{ margin: 0, fontSize: 15, whiteSpace: 'pre-wrap' }}>{en.message}</p>
              <div style={{ ...monoStyle(P, 10, 0.12, P.accBg), textTransform: 'uppercase', marginTop: 6 }}>{en.name}</div>
            </li>
          ))}
        </ul>
      )}
      {onUpdateResponse !== null && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <div style={{ fontSize: 13, color: P.ink_(66) }}>{S.needChange}</div>
          <button type="button" onClick={onUpdateResponse} data-update-response="1" style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 0, color: P.ink, fontFamily: P.sans, fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'underline', textUnderlineOffset: 5 }}>
            {S.updateResponse}
          </button>
        </div>
      )}
      <div style={{ fontSize: 13, color: P.ink_(60), textAlign: 'center' }}>{couple}</div>
    </div>
  );
}
