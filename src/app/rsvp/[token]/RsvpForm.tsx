'use client';

import { useState } from 'react';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';

export type Status = 'invited' | 'accepted' | 'declined' | 'expired';

type Phase = 'form' | 'done' | 'closed' | 'responded' | 'error';

/**
 * The reply half of the RSVP page. The page renders the card on the server
 * and hands this the invitation's state, so there is no loading flash and the
 * card is there even before any script runs.
 */
export function RsvpForm({
  token,
  status,
  rsvpOpen,
}: {
  token: string;
  status: Status;
  rsvpOpen: boolean;
}) {
  const [phase, setPhase] = useState<Phase>(
    status !== 'invited' ? 'responded' : rsvpOpen ? 'form' : 'closed',
  );
  const [attending, setAttending] = useState<boolean | null>(null);
  const [partySize, setPartySize] = useState(1);
  const [dietary, setDietary] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalStatus, setFinalStatus] = useState<Status | null>(null);

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
    <div>
        {phase === 'error' && (
          <p className="text-center text-sm text-ink-2">
            This invitation has expired. Please contact the couple.
          </p>
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

    </div>
  );
}
