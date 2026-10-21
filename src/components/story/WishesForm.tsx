'use client';

import { useEffect, useState, type FormEvent } from 'react';

export type WishesLang = 'sw' | 'en';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';
const LANG_KEY = 'wedding.wishes.lang';
const NAME_MAX = 80;
const MESSAGE_MAX = 500;

const COPY = {
  sw: {
    eyebrow: 'Salamu kwa maharusi',
    lead: 'Waandikie maneno machache. Watayasoma yote.',
    name: 'Jina lako',
    namePh: 'Mfano: Mama Asha',
    message: 'Salamu zako',
    messagePh: 'Hongereni sana! Mungu awabariki…',
    send: 'Tuma salamu',
    sending: 'Inatuma…',
    missing: 'Andika jina lako na salamu zako.',
    failed: 'Imeshindikana kutuma. Jaribu tena.',
    closed: 'Ukurasa huu bado haupokei salamu. Jaribu tena baadaye.',
    thanks: 'Asante sana!',
    thanksBody: (couple: string) => `Salamu zako zimefika kwa ${couple}.`,
    another: 'Tuma salamu nyingine',
    seeAll: 'Ona ukurasa wa harusi',
    left: (n: number) => `Herufi ${n} zimebaki`,
  },
  en: {
    eyebrow: 'Wishes for the couple',
    lead: 'Write them a few words. They will read every one.',
    name: 'Your name',
    namePh: 'e.g. Auntie Asha',
    message: 'Your wishes',
    messagePh: 'Congratulations! Wishing you a lifetime of joy…',
    send: 'Send wishes',
    sending: 'Sending…',
    missing: 'Add your name and your wishes.',
    failed: 'Could not send. Please try again.',
    closed: 'This page is not taking wishes yet. Please try again later.',
    thanks: 'Thank you!',
    thanksBody: (couple: string) => `Your wishes have reached ${couple}.`,
    another: 'Send another wish',
    seeAll: 'See the wedding page',
    left: (n: number) => `${n} characters left`,
  },
} as const;

function dateLabel(iso: string | null, lang: WishesLang): string {
  if (iso === null) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(lang === 'sw' ? 'sw-TZ' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Dar_es_Salaam',
  });
}

function Rings() {
  return (
    <svg width="44" height="28" viewBox="0 0 44 28" fill="none" aria-hidden>
      <circle cx="16" cy="14" r="11" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="28" cy="14" r="11" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function WishesForm({
  slug,
  couple,
  weddingDate,
  hashtag,
  initialLang,
}: {
  slug: string;
  couple: string;
  weddingDate: string | null;
  hashtag: string | null;
  initialLang: WishesLang;
}) {
  const [lang, setLang] = useState<WishesLang>(initialLang);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const t = COPY[lang];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === 'sw' || saved === 'en') setLang(saved);
    } catch {
      // Storage can be off in a private window; the page still works.
    }
  }, []);

  function switchLang(next: WishesLang) {
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      // ignore
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim() === '' || message.trim() === '') {
      setError(t.missing);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/story/${encodeURIComponent(slug)}/guestbook`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });
      if (res.status === 404) {
        setError(t.closed);
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      setSent(true);
      setMessage('');
    } catch {
      setError(t.failed);
    } finally {
      setBusy(false);
    }
  }

  const field =
    'w-full rounded-lg border border-bordr bg-linen/60 px-4 py-3 text-base text-ink-1 outline-none transition-colors placeholder:text-ink-4 focus:border-herb-600 focus:bg-paper';

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-4 flex justify-end">
        <div className="inline-flex overflow-hidden rounded-full border border-bordr bg-paper" role="group" aria-label="Lugha · Language">
          {(['sw', 'en'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => switchLang(l)}
              aria-pressed={lang === l}
              className={`px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] ${
                lang === l ? 'bg-herb-600 text-paper' : 'text-ink-2'
              }`}
            >
              {l === 'sw' ? 'Kiswahili' : 'English'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-bordr bg-paper shadow-[0_10px_40px_-20px_rgba(31,42,26,0.35)]">
        <div className="bg-gradient-to-b from-herb-700 to-herb-800 px-6 pb-8 pt-9 text-center text-herb-50">
          <div className="mx-auto mb-4 flex justify-center text-herb-200">
            <Rings />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-herb-200">{t.eyebrow}</p>
          <h1 className="mt-3 text-[2.4rem] font-light leading-[1.05]">{couple}</h1>
          {weddingDate !== null && <p className="mt-2 text-sm text-herb-200">{dateLabel(weddingDate, lang)}</p>}
          {hashtag !== null && hashtag !== '' && (
            <p className="mt-3 font-mono text-xs text-herb-100">#{hashtag.replace(/^#/, '')}</p>
          )}
        </div>

        {sent ? (
          <div className="px-6 py-10 text-center" role="status">
            <p className="text-2xl font-semibold text-herb-700">{t.thanks}</p>
            <p className="mt-2 text-ink-2">{t.thanksBody(couple)}</p>
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setSent(false)}
                className="w-full bg-herb-600 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-paper hover:bg-herb-700"
              >
                {t.another}
              </button>
              <a href={`/${slug}`} className="text-sm text-herb-700 underline underline-offset-4">
                {t.seeAll}
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 px-6 py-7" noValidate>
            <p className="text-center text-sm text-ink-2">{t.lead}</p>
            {error !== null && (
              <p className="rounded-lg border border-coral-light/50 bg-coral-light/10 px-3 py-2 text-sm text-coral-dark" role="alert">
                {error}
              </p>
            )}
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-ink-2">{t.name}</span>
              <input
                className={field}
                name="name"
                autoComplete="name"
                maxLength={NAME_MAX}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePh}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-ink-2">{t.message}</span>
              <textarea
                className={`${field} min-h-[150px] resize-y`}
                name="message"
                maxLength={MESSAGE_MAX}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.messagePh}
              />
              <span className="mt-1 block text-right font-mono text-[10px] text-ink-3">
                {t.left(MESSAGE_MAX - message.length)}
              </span>
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-herb-600 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-paper transition-colors hover:bg-herb-700 disabled:opacity-60"
            >
              {busy ? t.sending : t.send}
            </button>
          </form>
        )}
      </div>
      <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">Wedding by Lockwood</p>
    </div>
  );
}
