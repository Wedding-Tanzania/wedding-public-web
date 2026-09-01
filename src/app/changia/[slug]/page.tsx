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
  proofUploadAvailable: boolean;
}

interface PledgeResult extends ChangiaContext {
  pledge: { id: string; amount: number; contactId: string };
  intentId?: string;
  reference?: string;
}

interface ApiError {
  code?: string;
  message?: string;
  details?: { alreadyPaid?: number };
}

type Phase = 'loading' | 'ready' | 'notfound' | 'error';

const PROVIDERS: { value: string; label: string; dot: string }[] = [
  { value: 'mpesa', label: 'M-Pesa', dot: 'bg-rails-mpesa' },
  { value: 'mixx_yas', label: 'Mixx by Yas', dot: 'bg-rails-tigo' },
  { value: 'airtel', label: 'Airtel Money', dot: 'bg-rails-airtel' },
  { value: 'halotel', label: 'Halopesa', dot: 'bg-rails-halo' },
  { value: 'ttcl', label: 'T-Pesa', dot: 'bg-rails-crdb' },
];

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

/** Reads {code, message, details} off a failed response, tolerating non-JSON. */
async function readError(res: Response): Promise<ApiError> {
  try {
    return (await res.json()) as ApiError;
  } catch {
    return {};
  }
}

export default function ChangiaPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [phase, setPhase] = useState<Phase>('loading');
  const [ctx, setCtx] = useState<ChangiaContext | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PledgeResult | null>(null);

  const [provider, setProvider] = useState('mpesa');
  const [pushState, setPushState] = useState<'idle' | 'sent' | 'failed'>('idle');
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
        setPhase('ready');
      } catch {
        if (!cancelled) setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

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
        if (body.code === 'PLEDGE_BELOW_PAID') {
          const paid = body.details?.alreadyPaid;
          setError(
            paid === undefined
              ? 'You have already paid more than that.'
              : `You have already paid ${tsh(paid)} towards this. Your pledge cannot be less than that.`,
          );
        } else if (res.status === 429) {
          setError('That is a lot of tries in one minute. Please wait a moment.');
        } else {
          setError(body.message ?? 'We could not save that just now. Please try again.');
        }
        return;
      }
      const data = (await res.json()) as PledgeResult;
      setResult(data);
      setCtx(data);
      setPushState('idle');
      setProofState('idle');
    } catch {
      setError('We could not reach the server. Please check your connection.');
    } finally {
      setBusy(false);
    }
  }

  async function startPush(): Promise<void> {
    if (result === null) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/changia/${slug}/stk`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          amount: result.pledge.amount,
          provider,
          pledgeId: result.pledge.id,
        }),
      });
      if (!res.ok) {
        const body = await readError(res);
        setError(body.message ?? 'We could not start the payment. Use the details below instead.');
        setPushState('failed');
        return;
      }
      setPushState('sent');
    } catch {
      setError('We could not reach the server. Use the details below instead.');
      setPushState('failed');
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

            {result === null ? (
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

                {error !== null && (
                  <p className="rounded-md border border-due/40 bg-due-bg px-3 py-2 text-sm text-due">
                    {error}
                  </p>
                )}

                <button
                  onClick={() => void submitPledge()}
                  disabled={busy}
                  className="w-full bg-herb-700 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-paper disabled:opacity-50"
                >
                  {busy ? 'Saving…' : 'Set my pledge'}
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
            ) : (
              <div className="mt-8 space-y-4">
                <div className="rounded-md border border-brand/40 bg-ok-bg px-4 py-4 text-center">
                  <p className="text-sm text-ink-1">
                    Asante {fullName.trim()}. Your pledge of{' '}
                    <strong>{tsh(result.pledge.amount)}</strong> is recorded.
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
                      Quote this reference with your payment so the couple can
                      match it to you.
                    </p>
                    <div className="mt-2">
                      <CopyRow label="Your reference" value={result.reference} />
                    </div>
                  </div>
                )}

                {ctx.stkAvailable && pushState !== 'sent' && (
                  <div className="rounded-md border border-bordr px-4 py-4">
                    <p className={labelClass}>Pay now from your phone</p>
                    <div className="grid grid-cols-2 gap-2">
                      {PROVIDERS.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setProvider(p.value)}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                            provider === p.value
                              ? 'border-brand bg-herb-50 text-herb-700'
                              : 'border-bordr text-ink-2 hover:bg-herb-50'
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${p.dot}`} />
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => void startPush()}
                      disabled={busy}
                      className="mt-3 w-full bg-herb-700 py-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-paper disabled:opacity-50"
                    >
                      {busy ? 'Starting…' : `Send ${tsh(result.pledge.amount)}`}
                    </button>
                  </div>
                )}

                {pushState === 'sent' && (
                  <p className="rounded-md border border-brand/40 bg-ok-bg px-4 py-4 text-sm text-ink-1">
                    Check your phone and approve the payment. It can take a
                    moment to arrive.
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

                {error !== null && (
                  <p className="rounded-md border border-due/40 bg-due-bg px-3 py-2 text-sm text-due">
                    {error}
                  </p>
                )}

                <button
                  onClick={() => {
                    setResult(null);
                    setError(null);
                  }}
                  className="w-full border border-bordr py-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-ink-2"
                >
                  Change my pledge
                </button>
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
