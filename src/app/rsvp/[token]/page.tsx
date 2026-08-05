'use client';

import { useEffect, useState } from 'react';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';

type Status = 'invited' | 'accepted' | 'declined' | 'expired';

interface RsvpContext {
  weddingName: string;
  guestName: string;
  status: Status;
  rsvpOpen: boolean;
}

type Phase = 'loading' | 'form' | 'done' | 'closed' | 'responded' | 'error';

export default function RsvpPage({ params }: { params: { token: string } }) {
  const { token } = params;
  const [phase, setPhase] = useState<Phase>('loading');
  const [ctx, setCtx] = useState<RsvpContext | null>(null);
  const [attending, setAttending] = useState<boolean | null>(null);
  const [partySize, setPartySize] = useState(1);
  const [dietary, setDietary] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalStatus, setFinalStatus] = useState<Status | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/rsvp/${token}`);
        if (!res.ok) {
          if (!cancelled) setPhase('error');
          return;
        }
        const data = (await res.json()) as RsvpContext;
        if (cancelled) return;
        setCtx(data);
        if (data.status !== 'invited') setPhase('responded');
        else if (!data.rsvpOpen) setPhase('closed');
        else setPhase('form');
      } catch {
        if (!cancelled) setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function submit() {
    if (attending === null) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/rsvp/${token}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          attending,
          partySize: attending ? partySize : 1,
          dietaryNotes: dietary.trim() === '' ? undefined : dietary.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        status?: Status;
        code?: string;
        message?: string;
      };
      if (!res.ok) {
        if (res.status === 409) setPhase('responded');
        else if (res.status === 410) setPhase('error');
        else setError(data.message ?? 'Could not record your reply. Try again.');
        return;
      }
      setFinalStatus(data.status ?? (attending ? 'accepted' : 'declined'));
      setPhase('done');
    } catch {
      setError('Could not record your reply. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-linen px-6 py-16">
      <div className="w-full max-w-md rounded-lg border border-bordr bg-paper p-10 shadow-soft">
        {phase === 'loading' && (
          <p className="text-center text-sm text-ink-3">Loading your invitation…</p>
        )}

        {phase === 'error' && (
          <div className="text-center">
            <h1 className="font-sans text-2xl font-bold text-ink-1">
              Invitation not found
            </h1>
            <p className="mt-3 text-sm text-ink-2">
              This RSVP link is invalid or has expired. Please check the link in
              your invitation, or contact the couple.
            </p>
          </div>
        )}

        {ctx !== null && phase !== 'error' && (
          <div className="mb-6 text-center">
            <div className="eyebrow justify-center">{ctx.weddingName}</div>
            <h1 className="mt-4 font-sans text-3xl font-light text-herb-900">
              Hello, {ctx.guestName}
            </h1>
          </div>
        )}

        {phase === 'closed' && (
          <p className="text-center text-sm text-ink-2">
            RSVPs for this wedding are closed. Please reach out to the couple
            directly if you need to update your reply.
          </p>
        )}

        {phase === 'responded' && (
          <p className="text-center text-sm text-ink-2">
            You have already responded. Thank you. Contact the couple if you need
            to change your reply.
          </p>
        )}

        {phase === 'done' && (
          <div className="text-center">
            <div
              className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ok-bg text-2xl text-ok"
              aria-hidden
            >
              {finalStatus === 'accepted' ? '✓' : '·'}
            </div>
            <p className="mt-4 font-sans text-xl text-herb-900">
              {finalStatus === 'accepted'
                ? 'We cannot wait to celebrate with you.'
                : 'Thank you for letting us know.'}
            </p>
            <p className="mt-2 text-sm text-ink-3">Your reply has been recorded.</p>
          </div>
        )}

        {phase === 'form' && (
          <div className="space-y-5">
            <p className="text-center text-sm text-ink-2">
              Will you be able to join us?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAttending(true)}
                className={`rounded-lg border px-4 py-3 font-sans text-sm font-semibold transition-colors ${
                  attending === true
                    ? 'border-brand bg-herb-50 text-herb-700'
                    : 'border-bordr text-ink-2 hover:bg-herb-50'
                }`}
              >
                Joyfully accept
              </button>
              <button
                onClick={() => setAttending(false)}
                className={`rounded-lg border px-4 py-3 font-sans text-sm font-semibold transition-colors ${
                  attending === false
                    ? 'border-brand bg-herb-50 text-herb-700'
                    : 'border-bordr text-ink-2 hover:bg-herb-50'
                }`}
              >
                Regretfully decline
              </button>
            </div>

            {attending === true && (
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.06em] text-ink-2">
                  How many in your party?
                </span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className="w-full rounded-lg border border-bordr bg-paper px-3 py-2.5 text-sm text-ink-1 outline-none focus:border-brand"
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                />
              </label>
            )}

            {attending === true && (
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.06em] text-ink-2">
                  Dietary notes (optional)
                </span>
                <input
                  className="w-full rounded-lg border border-bordr bg-paper px-3 py-2.5 text-sm text-ink-1 outline-none focus:border-brand"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  placeholder="Allergies, halal, vegetarian…"
                />
              </label>
            )}

            {error !== null && (
              <p className="rounded-md border border-due/40 bg-due-bg px-3 py-2 text-sm text-due">
                {error}
              </p>
            )}

            <button
              onClick={() => void submit()}
              disabled={attending === null || busy}
              className="w-full bg-herb-700 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-paper disabled:opacity-50"
            >
              {busy ? 'Sending…' : 'Send reply'}
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-ink-3">
          A wedding by Lockwood
        </p>
      </div>
    </main>
  );
}
