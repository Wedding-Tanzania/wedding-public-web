'use client';

import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';

export type Status = 'invited' | 'accepted' | 'maybe' | 'declined' | 'expired';
type Answer = 'accepted' | 'maybe' | 'declined';
type Phase = 'ask' | 'details' | 'sending' | 'done' | 'closed' | 'error';

/** What the guest already told us, from the API. */
export interface SavedReply {
  partySize: number | null;
  dietaryNotes: string | null;
  message: string | null;
}

const DIETARY = ['Halal', 'Vegetarian', 'No pork', 'Allergy'];

const ANSWERS: { key: Answer; label: string; sw: string }[] = [
  { key: 'accepted', label: "I'll be there", sw: 'Nitakuwepo' },
  { key: 'maybe', label: 'Maybe', sw: 'Labda, nitajulisha' },
  { key: 'declined', label: "Can't make it", sw: 'Sitaweza kufika' },
];

const btnBase =
  'flex w-full flex-col items-center justify-center gap-0.5 px-5 py-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] transition-colors';

/**
 * The reply half of the RSVP page. The page renders the card on the server
 * and hands this the invitation's current state. A guest who has already
 * answered (here or by WhatsApp button) lands on their confirmation, not on
 * the question again; "Update your reply" reopens it pre-filled. The latest
 * answer wins on the server.
 */
export function RsvpForm({
  token,
  status,
  rsvpOpen,
  guestName,
  coupleNames,
  calendar,
  partyAllowed,
  firstName,
  reply,
}: {
  token: string;
  status: Status;
  rsvpOpen: boolean;
  guestName: string;
  coupleNames: string;
  /** Present when the API can hand out the day as a calendar entry. */
  calendar?: { googleUrl: string; icsUrl: string; startsAt?: string; allDay?: boolean };
  partyAllowed?: number;
  firstName: string;
  reply?: SavedReply;
}) {
  const answered: Answer | null =
    status === 'accepted' || status === 'maybe' || status === 'declined' ? status : null;
  const [phase, setPhase] = useState<Phase>(
    status === 'expired' ? 'error' : !rsvpOpen ? 'closed' : answered !== null ? 'done' : 'ask',
  );
  const [answer, setAnswer] = useState<Answer | null>(answered);
  const [partySize, setPartySize] = useState(reply?.partySize ?? Math.min(2, partyAllowed ?? 1));
  const [dietary, setDietary] = useState<string[]>(
    (reply?.dietaryNotes ?? '').split(',').map((d) => d.trim()).filter((d) => DIETARY.includes(d)),
  );
  const [message, setMessage] = useState(reply?.message ?? '');
  const [error, setError] = useState<string | null>(null);
  const max = partyAllowed ?? 20;

  function pick(a: Answer) {
    setAnswer(a);
    setError(null);
    setPhase('details');
  }

  async function submit() {
    if (answer === null) return;
    setPhase('sending');
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/rsvp/${token}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          answer,
          partySize: answer === 'accepted' ? partySize : 1,
          dietaryNotes: answer === 'accepted' && dietary.length > 0 ? dietary.join(', ') : undefined,
          message: message.trim() === '' ? undefined : message.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
      if (!res.ok) {
        if (res.status === 410) setPhase('error');
        else {
          setError(data.message ?? 'Could not record your reply. Try again.');
          setPhase('details');
        }
        return;
      }
      setPhase('done');
    } catch {
      setError('Could not record your reply. Check your connection and try again.');
      setPhase('details');
    }
  }

  const changeLink = (
    <button type="button" onClick={() => setPhase('ask')} className="font-mono text-[11px] uppercase tracking-[0.08em] text-herb-700 hover:underline">
      Change
    </button>
  );

  if (phase === 'error') {
    return <p className="text-center text-sm text-ink-2">This invitation has expired. Please contact {coupleNames}.</p>;
  }
  if (phase === 'closed') {
    if (answered !== null) {
      const label = ANSWERS.find((a) => a.key === answered)?.label;
      return (
        <p className="text-center text-sm text-ink-2">
          Your answer: <span className="font-semibold text-ink-1">{label}</span>. RSVPs are now closed; please contact the couple directly to change it.
        </p>
      );
    }
    return (
      <p className="text-center text-sm text-ink-2">
        RSVPs for this wedding are closed. Please reach out to the couple directly if you need to update your reply.
      </p>
    );
  }

  if (phase === 'done') {
    const line =
      answer === 'accepted'
        ? `You're coming${partySize > 1 ? ` with ${partySize - 1} ${partySize === 2 ? 'guest' : 'guests'}` : ''}. We cannot wait to celebrate with you.`
        : answer === 'maybe'
          ? `No pressure. ${coupleNames} will keep your seat for now. Come back to this link when you know.`
          : `Thank you for letting us know. ${coupleNames} will miss you.`;
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-herb-100 text-herb-700" aria-hidden>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
        </div>
        <p className="font-sans text-3xl font-light text-herb-900">Asante, {firstName}.</p>
        <p className="text-sm text-ink-2">{line}</p>
        {message.trim() !== '' && (
          <blockquote className="mx-auto max-w-xs rounded-md bg-herb-50 px-4 py-3 text-left text-sm italic text-ink-2">
            &ldquo;{message.trim()}&rdquo;
          </blockquote>
        )}
        {answer === 'accepted' && calendar !== undefined && (
          <div className="space-y-2 pt-2" id="calendar">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">Save the day</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <a
                href={calendar.googleUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center border border-herb-700 px-5 py-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-herb-700"
              >
                Add to Google Calendar
              </a>
              <a
                href={calendar.icsUrl}
                className="inline-flex items-center justify-center border border-bordr px-5 py-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-ink-2"
              >
                Apple, Outlook (.ics)
              </a>
            </div>
            <p className="text-xs text-ink-3">The calendar file reminds you the day before and 30 minutes before.</p>
          </div>
        )}
        <p className="text-xs text-ink-3">
          Plans changed?{' '}
          <button type="button" onClick={() => setPhase('ask')} className="text-herb-700 underline">
            Update your reply
          </button>{' '}
          from this link, any time.
        </p>
      </div>
    );
  }

  if (phase === 'ask') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
            {guestName}
            {partyAllowed !== undefined && partyAllowed > 1 ? `, admits ${partyAllowed}` : ''}
          </p>
          <p className="mt-1 text-xl font-bold text-ink-1">Will you be able to join us?</p>
          <p className="mt-1 text-sm text-ink-2">Utakuwepo? Tap one. You can change it later.</p>
        </div>
        {ANSWERS.map((a, i) => {
          const chosen = answered === a.key;
          const style =
            i === 0
              ? 'bg-herb-700 text-paper hover:bg-herb-800'
              : i === 1
                ? 'border border-herb-600 bg-paper text-herb-700 hover:bg-herb-50'
                : 'border border-bordr bg-paper text-ink-2 hover:bg-herb-50';
          return (
            <button key={a.key} type="button" onClick={() => pick(a.key)} className={`${btnBase} ${style} ${chosen ? 'ring-2 ring-herb-600 ring-offset-2' : ''}`}>
              <span>{a.label}{chosen ? ' · your answer' : ''}</span>
              <span className="text-[11px] normal-case tracking-normal opacity-80">{a.sw}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // details, or sending
  const busy = phase === 'sending';
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-md bg-herb-100 px-4 py-3">
        <span className="text-sm font-bold text-ink-1">{ANSWERS.find((a) => a.key === answer)?.label}</span>
        {changeLink}
      </div>

      {answer === 'accepted' && (
        <>
          <p className="text-xl font-bold text-ink-1">Wonderful. A few details.</p>
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.06em] text-ink-2">How many of you?</span>
            <div className="flex items-center gap-3">
              <button type="button" aria-label="One fewer" disabled={partySize <= 1} onClick={() => setPartySize((n) => Math.max(1, n - 1))} className="h-11 w-11 border border-bordr text-xl text-herb-700 disabled:opacity-40">−</button>
              <div className="grid h-11 w-16 place-items-center rounded-lg border border-bordr text-lg font-bold">{partySize}</div>
              <button type="button" aria-label="One more" disabled={partySize >= max} onClick={() => setPartySize((n) => Math.min(max, n + 1))} className="h-11 w-11 border border-bordr text-xl text-herb-700 disabled:opacity-40">+</button>
              {partyAllowed !== undefined && <span className="text-xs text-ink-3">Your card admits {partyAllowed}</span>}
            </div>
          </div>
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.06em] text-ink-2">Anything we should know about food?</span>
            <div className="flex flex-wrap gap-2">
              {DIETARY.map((d) => {
                const on = dietary.includes(d);
                return (
                  <button key={d} type="button" aria-pressed={on} onClick={() => setDietary((xs) => (on ? xs.filter((x) => x !== d) : [...xs, d]))} className={`h-9 rounded-full border px-3.5 text-sm ${on ? 'border-herb-600 bg-herb-50 font-semibold text-herb-700' : 'border-bordr text-ink-2'}`}>
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
      {answer === 'maybe' && (
        <div>
          <p className="text-xl font-bold text-ink-1">No pressure.</p>
          <p className="mt-1 text-sm text-ink-2">{coupleNames} will keep your seat for now. Come back to this link when you know.</p>
        </div>
      )}
      {answer === 'declined' && (
        <div>
          <p className="text-xl font-bold text-ink-1">We&apos;ll miss you, {firstName}.</p>
          <p className="mt-1 text-sm text-ink-2">Thank you for letting us know. Would you like to leave a few words?</p>
        </div>
      )}

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.06em] text-ink-2">
          {answer === 'declined' ? 'Your best wishes' : `A message for ${coupleNames}`}
        </span>
        <textarea
          rows={3}
          maxLength={500}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={answer === 'declined' ? 'Hongera! Mungu awabariki…' : 'Hongera sana! Tunasubiri kwa hamu…'}
          className="w-full resize-none rounded-lg border border-bordr bg-paper px-3 py-2.5 text-sm text-ink-1 outline-none focus:border-brand"
        />
        <span className="mt-1 block text-xs text-ink-3">Optional. They read every one.</span>
      </label>

      {error !== null && (
        <p className="rounded-md border border-due/40 bg-due-bg px-3 py-2 text-sm text-due">{error}</p>
      )}

      <button type="button" onClick={() => void submit()} disabled={busy} className="w-full bg-herb-700 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-paper disabled:opacity-50">
        {busy ? 'Sending…' : 'Send my reply'}
      </button>
    </div>
  );
}
