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
}

type Phase = 'loading' | 'ready' | 'notfound' | 'error';

const BANK_LABEL: Record<string, string> = { crdb: 'CRDB', nmb: 'NMB' };

/** Matches the rail colours used on the marketing page. */
const RAIL: Record<ChannelType, { label: string; dot: string }> = {
  changisha: { label: 'M-PESA', dot: 'bg-rails-mpesa' },
  mchango: { label: 'MIXX BY YAS', dot: 'bg-rails-tigo' },
  lipa_namba: { label: 'LIPA NAMBA', dot: 'bg-brand' },
  bank: { label: 'BANK', dot: 'bg-rails-crdb' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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

export default function ChangiaPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [phase, setPhase] = useState<Phase>('loading');
  const [ctx, setCtx] = useState<ChangiaContext | null>(null);

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

            {channels.length === 0 ? (
              <p className="mt-8 rounded-md border border-bordr bg-linen px-4 py-4 text-center text-sm text-ink-2">
                The couple has not finished setting up their contribution
                details yet. Please check back shortly, or contact them
                directly.
              </p>
            ) : (
              <div className="mt-8">
                <p className="text-sm text-ink-2">
                  Send your contribution using the details below.
                </p>

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

                {ctx.referencePrefix !== undefined && (
                  <div className="mt-4 rounded-md border border-brand/40 bg-ok-bg px-4 py-4">
                    <p className="text-sm text-ink-1">
                      Quote this reference with your payment so the couple can
                      match it to you.
                    </p>
                    <div className="mt-2">
                      <CopyRow label="Reference" value={ctx.referencePrefix} />
                    </div>
                  </div>
                )}

                {ctx.ussdShortCode !== undefined && (
                  <p className="mt-4 text-center font-mono text-[11px] text-ink-3">
                    Or dial {ctx.ussdShortCode} on your phone
                  </p>
                )}
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
