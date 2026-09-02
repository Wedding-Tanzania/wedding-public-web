'use client';

import { useEffect, useState } from 'react';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';

type ChannelType = 'changisha' | 'mchango' | 'lipa_namba' | 'bank';

interface PaymentChannel {
  type: ChannelType;
  changishaNumber?: string;
  mchangoAccountId?: string;
  lipaNamba?: string;
  bank?: string;
  accountNumber?: string;
  accountName?: string;
}

interface ChangiaContext {
  slug: string;
  coupleNames: string;
  weddingDate: string;
  paymentChannels: PaymentChannel[];
  referencePrefix?: string;
  ussdShortCode?: string;
  stkAvailable: boolean;
  paymentsLive: boolean;
  proofUploadAvailable: boolean;
}

interface PledgeResult extends ChangiaContext {
  alreadyPledged: boolean;
  pledge: { id: string; amount: number; contactId: string };
  fullName?: string;
  intentId?: string;
  reference?: string;
  malipopayReference?: string;
  channels?: { mobile: boolean; bank: boolean };
  expiresAt?: string;
  /** What is still owed on the pledge, after anything already paid. */
  outstanding?: number;
}

interface ApiError {
  code?: string;
  message?: string;
  details?: { alreadyPaid?: number; outstanding?: number };
}

type Phase = 'loading' | 'ready' | 'notfound' | 'error';
/** The form, the pledge, or the two steps of coming back to an old one. */
type Step = 'pledge' | 'done' | 'lookup-phone' | 'lookup-code';

const BANK_LABEL: Record<string, string> = { crdb: 'CRDB', nmb: 'NMB' };

/** Matches the rail colours used on the marketing page. */
const RAIL: Record<ChannelType, { label: string; dot: string }> = {
  changisha: { label: 'M-PESA', dot: 'bg-rails-mpesa' },
  mchango: { label: 'MIXX BY YAS', dot: 'bg-rails-tigo' },
  lipa_namba: { label: 'LIPA NAMBA', dot: 'bg-brand' },
  bank: { label: 'BANK', dot: 'bg-rails-crdb' },
};

const MIN_AMOUNT = 1_000;
const MAX_AMOUNT = 10_000_000;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function tsh(amount: number): string {
  return `TSh ${amount.toLocaleString('en-GB')}`;
}

/** The lines a contributor needs in order to actually send the money. */
function channelLines(c: PaymentChannel): { label: string; value: string }[] {
  if (c.type === 'changisha' && c.changishaNumber !== undefined) {
    return [{ label: 'Changisha number', value: c.changishaNumber }];
  }
  if (c.type === 'mchango' && c.mchangoAccountId !== undefined) {
    return [{ label: 'Mchango account', value: c.mchangoAccountId }];
  }
  if (c.type === 'lipa_namba' && c.lipaNamba !== undefined) {
    return [{ label: 'Lipa Namba', value: c.lipaNamba }];
  }
  if (c.type === 'bank') {
    const rows: { label: string; value: string }[] = [];
    if (c.bank !== undefined) {
      rows.push({ label: 'Bank', value: BANK_LABEL[c.bank] ?? c.bank.toUpperCase() });
    }
    if (c.accountName !== undefined) rows.push({ label: 'Account name', value: c.accountName });
    if (c.accountNumber !== undefined) rows.push({ label: 'Account number', value: c.accountNumber });
    return rows;
  }
  return [];
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is blocked on insecure origins. The value is on screen and
      // selectable, so there is nothing to recover.
    }
  }
  return (
    <div className="flex items-center justify-between gap-3 border-b border-rule py-2 last:border-b-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
        {label}
      </span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-sm font-semibold text-ink-1">{value}</span>
        <button
          type="button"
          onClick={() => void copy()}
          className="font-mono text-[10px] uppercase tracking-[0.08em] text-herb-600 hover:underline"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </span>
    </div>
  );
}

function ChannelCards({ channels }: { channels: PaymentChannel[] }) {
  return (
    <>
      {channels.map((c) => (
        <div
          key={c.type}
          className="mt-4 rounded-md border border-bordr bg-linen px-4 py-4"
        >
          <span className="rail-chip">
            <span className={`dot ${RAIL[c.type].dot}`} />
            {RAIL[c.type].label}
          </span>
          <div className="mt-3">
            {channelLines(c).map((row) => (
              <CopyRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

const inputClass =
  'w-full rounded-lg border border-bordr bg-paper px-3 py-2.5 text-sm text-ink-1 outline-none focus:border-brand';
const labelClass =
  'mb-1 block text-xs font-semibold uppercase tracking-[0.06em] text-ink-2';
const primaryButton =
  'w-full bg-herb-700 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-paper disabled:opacity-50';

/** Reads {code, message, details} off a failed response, tolerating non-JSON. */
async function readError(res: Response): Promise<ApiError> {
  try {
    return (await res.json()) as ApiError;
  } catch {
    return {};
  }
}

/**
 * The pledge this device last made for this couple.
 *
 * Only ever a convenience: the authoritative copy is the SMS, and anybody on
 * another handset comes back through the code. Wrapped in try/catch because
 * private mode and a full quota both throw rather than returning null.
 */
function remembered(slug: string): PledgeResult | null {
  try {
    const raw = window.localStorage.getItem(`changia:${slug}`);
    return raw === null ? null : (JSON.parse(raw) as PledgeResult);
  } catch {
    return null;
  }
}

function remember(slug: string, result: PledgeResult): void {
  try {
    window.localStorage.setItem(`changia:${slug}`, JSON.stringify(result));
  } catch {
    // Nothing to recover: the reference is also in the guest's SMS.
  }
}

export default function ChangiaPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [phase, setPhase] = useState<Phase>('loading');
  const [ctx, setCtx] = useState<ChangiaContext | null>(null);
  const [step, setStep] = useState<Step>('pledge');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PledgeResult | null>(null);

  const [lookupPhone, setLookupPhone] = useState('');
  const [code, setCode] = useState('');
  const [pushState, setPushState] = useState<'idle' | 'sent' | 'in_flight'>('idle');
  const [sendAmount, setSendAmount] = useState('');
  const [sentAmount, setSentAmount] = useState(0);
  const [proofState, setProofState] = useState<'idle' | 'sending' | 'done' | 'failed'>('idle');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/changia/${slug}`);
        if (!res.ok) {
          if (!cancelled) setPhase(res.status === 404 ? 'notfound' : 'error');
          return;
        }
        const data = (await res.json()) as ChangiaContext;
        if (cancelled) return;
        setCtx(data);
        // A guest who pledged on this device gets their screen back without
        // asking for a code. The stored copy is merged under the fresh
        // context, so payment details cannot go stale behind it.
        const saved = remembered(slug);
        if (saved !== null) {
          setResult({ ...saved, ...data });
          setFullName(saved.fullName ?? '');
          setStep('done');
        }
        setPhase('ready');
      } catch {
        if (!cancelled) setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  function land(data: PledgeResult): void {
    setResult(data);
    setCtx(data);
    remember(slug, data);
    setStep('done');
    // Default to the whole balance. Most people send all of it, and the ones
    // who do not can type over it.
    setSendAmount(String(data.outstanding ?? data.pledge.amount));
    setPushState('idle');
    setProofState('idle');
    setError(null);
  }

  async function submitPledge(): Promise<void> {
    const value = Number(amount.replace(/[^\d]/g, ''));
    if (fullName.trim() === '' || phone.trim() === '') {
      setError('Please give your name and phone number.');
      return;
    }
    if (!Number.isFinite(value) || value < MIN_AMOUNT || value > MAX_AMOUNT) {
      setError(`Enter an amount between ${tsh(MIN_AMOUNT)} and ${tsh(MAX_AMOUNT)}.`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/changia/${slug}/pledge`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), phone: phone.trim(), amount: value }),
      });
      if (!res.ok) {
        const body = await readError(res);
        setError(
          res.status === 429
            ? 'That is a lot of tries in one minute. Please wait a moment.'
            : (body.message ?? 'We could not save that just now. Please try again.'),
        );
        return;
      }
      land((await res.json()) as PledgeResult);
    } catch {
      setError('We could not reach the server. Please check your connection.');
    } finally {
      setBusy(false);
    }
  }

  async function startPush(): Promise<void> {
    if (result === null) return;
    const owed = result.outstanding ?? result.pledge.amount;
    const value = Number(sendAmount.replace(/[^\d]/g, ''));
    if (!Number.isFinite(value) || value < MIN_AMOUNT) {
      setError(`The smallest payment is ${tsh(MIN_AMOUNT)}.`);
      return;
    }
    if (value > owed) {
      setError(`Only ${tsh(owed)} is still owed on this pledge.`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/changia/${slug}/stk`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim() === '' ? lookupPhone.trim() : phone.trim(),
          pledgeId: result.pledge.id,
          amount: value,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as ApiError & {
        status?: string;
        amount?: number;
        outstanding?: number;
      };
      if (!res.ok) {
        // The server knows the real balance; if it disagrees with ours, take
        // its word and correct the field rather than arguing with the guest.
        if (body.details?.outstanding !== undefined) {
          const owedNow = body.details.outstanding;
          setSendAmount(String(owedNow));
          setResult({ ...result, outstanding: owedNow });
        }
        setError(
          body.code === 'NUMBER_NOT_WHITELISTED'
            ? 'This number is not enabled for test payments yet. Use the details below instead.'
            : (body.message ?? 'We could not start the payment. Use the details below instead.'),
        );
        return;
      }
      setSentAmount(body.amount ?? value);
      setPushState(body.status === 'in_flight' ? 'in_flight' : 'sent');
    } catch {
      setError('We could not reach the server. Use the details below instead.');
    } finally {
      setBusy(false);
    }
  }

  async function startLookup(): Promise<void> {
    if (lookupPhone.trim() === '') {
      setError('Enter the number you pledged with.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/changia/${slug}/lookup`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone: lookupPhone.trim() }),
      });
      if (!res.ok) {
        setError('We could not send a code just now. Please try again.');
        return;
      }
      setStep('lookup-code');
    } catch {
      setError('We could not reach the server. Please check your connection.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyLookup(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/changia/${slug}/lookup/verify`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone: lookupPhone.trim(), code: code.trim() }),
      });
      if (!res.ok) {
        const body = await readError(res);
        setError(body.message ?? 'That code is not right, or it has expired.');
        return;
      }
      const data = (await res.json()) as PledgeResult;
      setPhone(lookupPhone.trim());
      setFullName(data.fullName ?? '');
      land(data);
    } catch {
      setError('We could not reach the server. Please check your connection.');
    } finally {
      setBusy(false);
    }
  }

  /**
   * Presign, PUT straight to storage, then confirm. Three steps rather than
   * one upload to this API, so the file never passes through the server.
   */
  async function uploadProof(file: File): Promise<void> {
    if (result?.intentId === undefined) return;
    setProofState('sending');
    setError(null);
    try {
      const base = `${API_BASE}/changia/${slug}/intents/${result.intentId}`;
      const signed = await fetch(`${base}/proof-presign`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      });
      if (!signed.ok) {
        const body = await readError(signed);
        setError(body.message ?? 'We could not accept that file.');
        setProofState('failed');
        return;
      }
      const { objectKey, uploadUrl } = (await signed.json()) as {
        objectKey: string;
        uploadUrl: string;
      };
      const put = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'content-type': file.type },
        body: file,
      });
      if (!put.ok) {
        setError('The upload did not complete. Please try again.');
        setProofState('failed');
        return;
      }
      const confirmed = await fetch(`${base}/proof`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ objectKey }),
      });
      setProofState(confirmed.ok ? 'done' : 'failed');
    } catch {
      setError('We could not reach the server. Please try again.');
      setProofState('failed');
    }
  }

  const channels = ctx?.paymentChannels ?? [];
  // What is still owed, and what the guest has typed over it.
  const owed = result === null ? 0 : (result.outstanding ?? result.pledge.amount);
  const typed = Number(sendAmount.replace(/[^\d]/g, '')) || 0;
  const errorNote =
    error === null ? null : (
      <p className="rounded-md border border-due/40 bg-due-bg px-3 py-2 text-sm text-due">
        {error}
      </p>
    );

  return (
    <main className="grid min-h-screen place-items-center bg-linen px-6 py-16">
      <div className="w-full max-w-md rounded-lg border border-bordr bg-paper p-8 shadow-soft sm:p-10">
        {phase === 'loading' && (
          <p className="text-center text-sm text-ink-3">Loading…</p>
        )}

        {phase === 'notfound' && (
          <div className="text-center">
            <h1 className="font-sans text-2xl font-bold text-ink-1">
              This michango link is not valid
            </h1>
            <p className="mt-3 text-sm text-ink-2">
              Check the link you were sent, or ask the couple to share it again.
            </p>
          </div>
        )}

        {phase === 'error' && (
          <div className="text-center">
            <h1 className="font-sans text-2xl font-bold text-ink-1">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm text-ink-2">
              We could not load this page just now. Please try again shortly.
            </p>
          </div>
        )}

        {phase === 'ready' && ctx !== null && (
          <>
            <div className="text-center">
              <div className="eyebrow justify-center">Michango</div>
              <h1 className="mt-4 font-sans text-3xl font-light text-herb-900">
                {ctx.coupleNames}
              </h1>
              {ctx.weddingDate !== '' && (
                <p className="mt-2 text-sm text-ink-2">
                  Wedding on {formatDate(ctx.weddingDate)}
                </p>
              )}
            </div>

            {/* Said once, at the top, because a guest who reads it after a
                failed push has already had the bad experience. */}
            {ctx.stkAvailable && !ctx.paymentsLive && (
              <p className="mt-6 rounded-md border border-due/40 bg-due-bg px-4 py-3 text-sm text-due">
                Payments here are still in test mode while the couple&apos;s
                account is approved. You can pledge, and pay using the details
                below.
              </p>
            )}

            {step === 'pledge' && (
              <div className="mt-8 space-y-4">
                <p className="text-sm text-ink-2">
                  Tell the couple what you would like to give. You will get your
                  own reference and the payment details on the next step.
                </p>

                <label className="block">
                  <span className={labelClass}>Your full name</span>
                  <input
                    className={inputClass}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Neema Mushi"
                    autoComplete="name"
                  />
                </label>

                <label className="block">
                  <span className={labelClass}>Your phone number</span>
                  <input
                    className={inputClass}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0713 445 566"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                  <span className="mt-1 block text-[11px] text-ink-3">
                    This is how the couple matches your contribution to you.
                  </span>
                </label>

                <label className="block">
                  <span className={labelClass}>Amount in shillings</span>
                  <input
                    className={inputClass}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="200000"
                    inputMode="numeric"
                  />
                </label>

                {errorNote}

                <button
                  onClick={() => void submitPledge()}
                  disabled={busy}
                  className={primaryButton}
                >
                  {busy ? 'Saving…' : 'Set my pledge'}
                </button>

                <button
                  onClick={() => {
                    setStep('lookup-phone');
                    setError(null);
                  }}
                  className="w-full text-center text-sm text-herb-700 underline"
                >
                  I have already pledged
                </button>

                {channels.length === 0 ? (
                  <p className="rounded-md border border-bordr bg-linen px-4 py-4 text-center text-sm text-ink-2">
                    The couple has not finished setting up their payment details
                    yet. Your pledge is still recorded, and they will share the
                    details with you.
                  </p>
                ) : (
                  <div className="pt-2">
                    <p className="text-xs uppercase tracking-[0.08em] text-ink-3">
                      Payment details
                    </p>
                    <ChannelCards channels={channels} />
                    {ctx.ussdShortCode !== undefined && (
                      <p className="mt-4 text-center font-mono text-[11px] text-ink-3">
                        Or dial {ctx.ussdShortCode} on your phone
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/*
              Coming back is two steps on purpose. This link is forwarded around
              a WhatsApp group whose members already hold each other's numbers,
              so showing a pledge for any number typed in would let any of them
              read what anyone else promised.
            */}
            {step === 'lookup-phone' && (
              <div className="mt-8 space-y-4">
                <p className="text-sm text-ink-2">
                  Enter the number you pledged with and we will text you a
                  six-digit code.
                </p>
                <label className="block">
                  <span className={labelClass}>Your phone number</span>
                  <input
                    className={inputClass}
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    placeholder="0713 445 566"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </label>
                {errorNote}
                <button
                  onClick={() => void startLookup()}
                  disabled={busy}
                  className={primaryButton}
                >
                  {busy ? 'Sending…' : 'Send me a code'}
                </button>
                <button
                  onClick={() => {
                    setStep('pledge');
                    setError(null);
                  }}
                  className="w-full text-center text-sm text-herb-700 underline"
                >
                  Back
                </button>
              </div>
            )}

            {step === 'lookup-code' && (
              <div className="mt-8 space-y-4">
                <p className="text-sm text-ink-2">
                  We sent a code to {lookupPhone}. Enter it to see your pledge.
                </p>
                <label className="block">
                  <span className={labelClass}>Six-digit code</span>
                  <input
                    className={`${inputClass} text-center font-mono text-lg tracking-[0.4em]`}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                  />
                </label>
                {errorNote}
                <button
                  onClick={() => void verifyLookup()}
                  disabled={busy || code.length < 6}
                  className={primaryButton}
                >
                  {busy ? 'Checking…' : 'Open my pledge'}
                </button>
                <button
                  onClick={() => {
                    setStep('lookup-phone');
                    setCode('');
                    setError(null);
                  }}
                  className="w-full text-center text-sm text-herb-700 underline"
                >
                  Use a different number
                </button>
              </div>
            )}

            {step === 'done' && result !== null && (
              <div className="mt-8 space-y-4">
                <div className="rounded-md border border-brand/40 bg-ok-bg px-4 py-4 text-center">
                  <p className="text-sm text-ink-1">
                    {fullName.trim() === '' ? 'Asante' : `Asante ${fullName.trim()}`}
                    {result.alreadyPledged
                      ? '. You have already pledged '
                      : '. Your pledge of '}
                    <strong>{tsh(result.pledge.amount)}</strong>
                    {result.alreadyPledged ? '.' : ' is recorded.'}
                  </p>
                </div>

                {/*
                  The per-contribution reference, not the couple's prefix. The
                  prefix is the same string for every guest on the list, so
                  quoting it would attribute nothing.
                */}
                {result.reference !== undefined && (
                  <div className="rounded-md border border-brand/40 bg-linen px-4 py-4">
                    <p className="text-sm text-ink-1">
                      {result.channels?.bank === true
                        ? 'Quote this reference at a CRDB or NMB counter, or in the M-Pesa "Acc" field, and the couple will see it against your name.'
                        : 'Quote this reference with your payment so the couple can match it to you.'}
                    </p>
                    <div className="mt-2">
                      <CopyRow label="Your reference" value={result.reference} />
                      {result.malipopayReference !== undefined && (
                        <CopyRow
                          label="Or this one"
                          value={result.malipopayReference}
                        />
                      )}
                    </div>
                    <p className="mt-2 text-[11px] text-ink-3">
                      We also texted it to you, so it is on your phone when you
                      are standing at the counter.
                    </p>
                  </div>
                )}

                {ctx.stkAvailable && pushState === 'idle' && (
                  <div className="rounded-md border border-bordr px-4 py-4">
                    {/* No network picker. Malipopay reads the network from the
                        number itself, and never accepted the field the old
                        five-way chooser was sending. */}
                    <p className={labelClass}>Pay now from your phone</p>
                    <p className="mb-3 text-[11px] text-ink-3">
                      We will send a prompt to {phone.trim() === '' ? 'your phone' : phone.trim()}.
                      Approve it and the money is on its way.
                    </p>

                    {/* Editable, because nobody has to give it all at once.
                        Whatever is sent comes off the same pledge, and the
                        reference above stays the one to quote. */}
                    <label className="block">
                      <span className={labelClass}>Amount to send now</span>
                      <input
                        className={inputClass}
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        inputMode="numeric"
                      />
                    </label>
                    {owed > 0 && (
                      <p className="mt-1 mb-3 text-[11px] text-ink-3">
                        {owed === result.pledge.amount
                          ? `You pledged ${tsh(result.pledge.amount)}. Send less now and the rest whenever you like.`
                          : `${tsh(result.pledge.amount - owed)} of ${tsh(result.pledge.amount)} already received. ${tsh(owed)} still to go.`}
                      </p>
                    )}

                    <button
                      onClick={() => void startPush()}
                      disabled={busy}
                      className={primaryButton}
                    >
                      {busy ? 'Sending…' : `Send ${tsh(typed > 0 ? typed : owed)}`}
                    </button>
                  </div>
                )}

                {pushState === 'sent' && (
                  <p className="rounded-md border border-brand/40 bg-ok-bg px-4 py-4 text-sm text-ink-1">
                    Check your phone and approve the {tsh(sentAmount)} payment.
                    It can take a moment to arrive.
                  </p>
                )}
                {pushState === 'in_flight' && (
                  <p className="rounded-md border border-brand/40 bg-ok-bg px-4 py-4 text-sm text-ink-1">
                    A request is already on its way to your phone. It can take a
                    moment.
                  </p>
                )}

                {channels.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-ink-3">
                      Or send it yourself
                    </p>
                    <ChannelCards channels={channels} />
                    {ctx.ussdShortCode !== undefined && (
                      <p className="mt-4 text-center font-mono text-[11px] text-ink-3">
                        Or dial {ctx.ussdShortCode} on your phone
                      </p>
                    )}
                  </div>
                )}

                {result.intentId !== undefined &&
                  (ctx.proofUploadAvailable ? (
                    <div className="rounded-md border border-bordr px-4 py-4">
                      <p className={labelClass}>Already paid? Send the proof</p>
                      <p className="mb-2 text-[11px] text-ink-3">
                        A screenshot or your bank slip. JPG, PNG or PDF, up to 5 MB.
                      </p>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        disabled={proofState === 'sending'}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file !== undefined) void uploadProof(file);
                        }}
                        className="w-full text-sm text-ink-2 file:mr-3 file:border-0 file:bg-herb-700 file:px-4 file:py-2 file:font-sans file:text-xs file:uppercase file:tracking-[0.12em] file:text-paper"
                      />
                      {proofState === 'sending' && (
                        <p className="mt-2 text-sm text-ink-3">Sending…</p>
                      )}
                      {proofState === 'done' && (
                        <p className="mt-2 text-sm text-ok">
                          Received. The couple will confirm it.
                        </p>
                      )}
                      {proofState === 'failed' && (
                        <p className="mt-2 text-sm text-due">
                          That did not go through. Please try again.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="rounded-md border border-bordr bg-linen px-4 py-3 text-sm text-ink-2">
                      Already paid? Send your screenshot or bank slip to the
                      couple on WhatsApp with your reference.
                    </p>
                  ))}

                {errorNote}

                {/*
                  No way back to the form. A pledge is a public commitment, and
                  the person who made it should not be able to quietly reduce
                  it; the couple can correct a genuine mistake in the app,
                  where the change is attributable.
                */}
                <p className="text-center text-[11px] text-ink-3">
                  Need to change this? Ask the couple.
                </p>
              </div>
            )}

            <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
              Wedding by Lockwood
            </p>
          </>
        )}
      </div>
    </main>
  );
}
