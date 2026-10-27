'use client';

import { useState, type FormEvent } from 'react';
import { SUPPORT_EMAIL } from '@/lib/support';
import { reportWish } from '@/lib/wishes';

interface Entry {
  id: string;
  name: string;
  message: string;
  createdAt?: string;
  /** Set when the API held the wish back (a blocked author, or the word filter). */
  hidden?: boolean;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';

export function Guestbook({
  slug,
  initial,
}: {
  slug: string;
  initial: Entry[];
}) {
  const [entries, setEntries] = useState<Entry[]>(initial);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function report(id: string) {
    setNotice(null);
    if (await reportWish(slug, id)) {
      setEntries((list) => list.filter((en) => en.id !== id));
      setNotice('Thanks for reporting. The message is off the page and our team will review it.');
    } else {
      setNotice('Could not report it. Please try again.');
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim() === '' || message.trim() === '') {
      setError('Add your name and a message.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/story/${slug}/guestbook`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });
      if (!res.ok) throw new Error('failed');
      const data = (await res.json()) as { entry: Entry };
      // A held-back wish still reaches the couple, but is not shown here.
      if (data.entry.hidden !== true) setEntries([data.entry, ...entries]);
      setName('');
      setMessage('');
      setDone(true);
    } catch {
      setError('Could not post your wish. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={submit} className="rounded-lg border border-bordr bg-paper p-6">
        {error !== null && (
          <p className="mb-3 rounded-md border border-coral/40 bg-coral/10 px-3 py-2 text-sm text-coral">
            {error}
          </p>
        )}
        {done && (
          <p className="mb-3 text-sm text-herb-600">
            Thank you, your wish has been sent to the couple.
          </p>
        )}
        <input
          className="w-full rounded-lg border border-bordr bg-linen px-3 py-2.5 text-sm text-ink-1 outline-none focus:border-herb-600"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
        <textarea
          className="mt-3 min-h-[90px] w-full rounded-lg border border-bordr bg-linen px-3 py-2.5 text-sm text-ink-1 outline-none focus:border-herb-600"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Leave the couple a wish…"
        />
        <button
          type="submit"
          disabled={busy}
          className="mt-3 w-full bg-herb-600 py-3 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-paper transition-colors hover:bg-herb-700 disabled:opacity-60"
        >
          {busy ? 'Posting…' : 'Sign the guestbook'}
        </button>
      </form>

      {entries.length > 0 && (
        <ul className="mt-8 space-y-4">
          {entries.map((en) => (
            <li key={en.id} className="rounded-lg border border-bordr bg-paper p-5">
              <p className="whitespace-pre-wrap text-ink-2">{en.message}</p>
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <p className="text-[10px] uppercase tracking-widest text-herb-600">{en.name}</p>
                <button
                  type="button"
                  onClick={() => void report(en.id)}
                  data-report-wish={en.id}
                  className="text-xs text-ink-3 underline underline-offset-2 hover:text-ink-1"
                >
                  Report
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {notice !== null && (
        <p role="status" className="mt-4 text-center text-sm text-ink-2">
          {notice}
        </p>
      )}
      <p className="mt-6 text-center text-xs text-ink-3">
        See something offensive? Tap Report, or write to{' '}
        <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    </div>
  );
}
