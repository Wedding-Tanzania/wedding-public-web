'use client';

import { useState, type CSSProperties } from 'react';
import { STR, fmtDate, shownSeats, type InviteDesign, type Lang, type PageRecipe } from '@/lib/invite/wcz';
import type { CalendarLinks, InviteGuestView } from '@/lib/invite/types';
import { Icon } from './Icon';
import { usePal, type Pal } from './palette';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';

/** The API's answer words, as the existing RSVP form sends them. */
type Answer = 'accepted' | 'maybe' | 'declined';
type Phase = 'ask' | 'sending' | 'done' | 'closed' | 'expired';

export interface SavedReply {
  partySize: number | null;
  dietaryNotes: string | null;
  message: string | null;
}

function answerOf(status: string): Answer | null {
  return status === 'accepted' || status === 'maybe' || status === 'declined' ? status : null;
}

/** The RSVP block's colours for the recipe's band, card or ticket style. */
function look(p: Pal, view: PageRecipe['rsvp'], rhythm: PageRecipe['rhythm']) {
  if (view === 'card') {
    return { m: '0', pad: '28px 20px', r: 16, bg: p.panel, fg: p.pink, sub: p.pink_(72), bd: 'none', btnBg: p.accent, btnFg: p.onacc, b2: p.pink_(40), chip: p.pink_(8), okBg: p.accent, okFg: p.onacc };
  }
  if (view === 'ticket') {
    return { m: '0', pad: '28px 20px', r: 6, bg: 'transparent', fg: p.ink, sub: p.ink_(72), bd: `2px dashed ${p.ink_(35)}`, btnBg: p.ink, btnFg: p.bg, b2: p.ink_(40), chip: p.ink_(8), okBg: p.ink, okFg: p.bg };
  }
  const px = rhythm === 'cards' ? 20 : 24;
  return {
    m: rhythm === 'cards' ? '0 -20px -30px' : `0 -${px}px`,
    pad: '32px 24px',
    r: rhythm === 'cards' ? '0 0 24px 24px' : 0,
    bg: p.accent,
    fg: p.onacc,
    sub: p.on_(84),
    bd: 'none',
    btnBg: p.onacc,
    btnFg: p.accent,
    b2: p.on_(55),
    chip: p.on_(14),
    okBg: p.onacc,
    okFg: p.accent,
  };
}

/**
 * Will you attend: yes, maybe or no, how many of the card's seats, and a few
 * words for the couple. Posts the same body the existing RSVP form does, so
 * the API, the WhatsApp buttons and this page all agree; the latest answer
 * wins. Without a personal link (the public story page) it only says where
 * the personal link is.
 */
export function Rsvp(props: {
  d: InviteDesign;
  lang: Lang;
  view: PageRecipe['rsvp'];
  rhythm: PageRecipe['rhythm'];
  token: string | null;
  guest: InviteGuestView | null;
  status: string;
  reply: SavedReply | null;
  rsvpOpen: boolean;
  calendar: CalendarLinks | null;
}) {
  const p = usePal();
  const S = STR[props.lang];
  const L = look(p, props.view, props.rhythm);
  // A DOUBLE card can confirm two, even when no seat count was saved.
  const seatsMax = shownSeats(props.guest?.kind, props.guest?.seats);
  const answered = answerOf(props.status);
  const [answer, setAnswer] = useState<Answer | null>(answered);
  const [phase, setPhase] = useState<Phase>(
    props.status === 'expired' ? 'expired' : !props.rsvpOpen ? 'closed' : answered !== null ? 'done' : 'ask',
  );
  const [seats, setSeats] = useState(Math.min(seatsMax, props.reply?.partySize ?? props.guest?.coming ?? seatsMax));
  const [message, setMessage] = useState(props.reply?.message ?? '');
  const [error, setError] = useState<string | null>(null);
  const by = fmtDate(props.d.rsvpBy || props.d.date, props.lang).long;

  async function send(a: Answer) {
    if (props.token === null) return;
    setAnswer(a);
    setPhase('sending');
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/rsvp/${encodeURIComponent(props.token)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          answer: a,
          partySize: a === 'accepted' ? seats : 1,
          message: message.trim() === '' ? undefined : message.trim(),
        }),
      });
      if (res.status === 410) {
        setPhase('expired');
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        setError(data.message ?? S.rsvpError);
        setPhase('ask');
        return;
      }
      setPhase('done');
    } catch {
      setError(S.rsvpError);
      setPhase('ask');
    }
  }

  const btn = (primary: boolean): CSSProperties => ({
    height: 48,
    cursor: 'pointer',
    border: primary ? 0 : `1px solid ${L.b2}`,
    background: primary ? L.btnBg : 'transparent',
    color: primary ? L.btnFg : L.fg,
    fontFamily: p.sans,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    borderRadius: 0,
  });

  const wrap: CSSProperties = {
    margin: L.m,
    padding: L.pad,
    borderRadius: L.r,
    background: L.bg,
    color: L.fg,
    border: L.bd,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    textAlign: 'center',
  };

  if (props.token === null) {
    return (
      <div style={wrap}>
        <div style={{ fontSize: 15, color: L.sub }}>{`${S.rsvpBy} ${by}`}</div>
        <div style={{ fontSize: 15, maxWidth: 340 }}>{S.rsvpOwnLink}</div>
      </div>
    );
  }

  const doneText =
    answer === 'accepted'
      ? `${S.doneYes} · ${S.seats(seats)}`
      : answer === 'maybe'
        ? S.doneMaybe
        : S.doneNo;

  return (
    <div style={wrap}>
      <div style={{ fontSize: 15, color: L.sub }}>{`${S.rsvpBy} ${by}`}</div>

      {phase === 'expired' && <div style={{ fontSize: 15 }}>{S.rsvpExpired}</div>}
      {phase === 'closed' && <div style={{ fontSize: 15 }}>{S.rsvpClosed}</div>}

      {(phase === 'ask' || phase === 'sending') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320, marginTop: 4 }}>
          {seatsMax > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '6px 6px 6px 16px', borderRadius: 999, background: L.chip }}>
              <span style={{ fontSize: 14 }}>{S.howMany}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button type="button" aria-label="-1" onClick={() => setSeats((n) => Math.max(1, n - 1))} style={{ width: 34, height: 34, borderRadius: '50%', border: 0, cursor: 'pointer', background: L.btnBg, color: L.btnFg, fontSize: 18, lineHeight: 1 }}>
                  −
                </button>
                <span style={{ fontSize: 16, fontWeight: 700, minWidth: 18, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{seats}</span>
                <button type="button" aria-label="+1" onClick={() => setSeats((n) => Math.min(seatsMax, n + 1))} style={{ width: 34, height: 34, borderRadius: '50%', border: 0, cursor: 'pointer', background: L.btnBg, color: L.btnFg, fontSize: 18, lineHeight: 1 }}>
                  +
                </button>
              </div>
            </div>
          )}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
            <span style={{ fontSize: 12, color: L.sub }}>{S.msgLabel}</span>
            <textarea
              rows={2}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={S.msgPlaceholder}
              style={{ width: '100%', resize: 'none', padding: '10px 12px', borderRadius: 8, border: `1px solid ${L.b2}`, background: 'transparent', color: L.fg, fontFamily: p.sans, fontSize: 14 }}
            />
          </label>
          <button type="button" disabled={phase === 'sending'} onClick={() => void send('accepted')} style={btn(true)}>
            {phase === 'sending' && answer === 'accepted' ? S.sending : S.yes}
          </button>
          <button type="button" disabled={phase === 'sending'} onClick={() => void send('maybe')} style={btn(false)}>
            {phase === 'sending' && answer === 'maybe' ? S.sending : S.maybe}
          </button>
          <button type="button" disabled={phase === 'sending'} onClick={() => void send('declined')} style={btn(false)}>
            {phase === 'sending' && answer === 'declined' ? S.sending : S.no}
          </button>
          {error !== null && <div role="alert" style={{ fontSize: 13 }}>{error}</div>}
        </div>
      )}

      {phase === 'done' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 999, background: L.okBg, color: L.okFg, fontSize: 14, fontWeight: 600 }}>
            ✓ {doneText}
          </div>
          {answer === 'accepted' && props.calendar !== null && (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
              <a href={props.calendar.googleUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: `1px solid ${L.b2}`, color: L.fg, textDecoration: 'none', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <Icon name="EventAvailable" size={16} />
                {S.addGoogle}
              </a>
              <a href={props.calendar.icsUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: `1px solid ${L.b2}`, color: L.fg, textDecoration: 'none', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {S.addIcs}
              </a>
            </div>
          )}
          {props.rsvpOpen && (
            <button type="button" onClick={() => setPhase('ask')} style={{ border: 0, background: 'none', cursor: 'pointer', color: L.fg, fontFamily: p.sans, fontSize: 13, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              {S.change}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
