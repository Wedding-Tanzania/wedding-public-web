'use client';

import { useState, type CSSProperties } from 'react';
import { STR, tsh, type InviteDesign, type Lang } from '@/lib/invite/wcz';
import type { InviteGuestView, PublicCollectionAccount } from '@/lib/invite/types';
import { monoStyle, usePal } from './palette';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';

/** Brand colours of the rails, from the design system. */
const RAIL: Record<string, { bg: string; fg: string; name: string }> = {
  mpesa: { bg: '#22B14C', fg: '#FFFFFF', name: 'M-Pesa' },
  tigo: { bg: '#1A4DC5', fg: '#FFFFFF', name: 'Mixx by Yas' },
  mixx_yas: { bg: '#1A4DC5', fg: '#FFFFFF', name: 'Mixx by Yas' },
  airtel: { bg: '#E60000', fg: '#FFFFFF', name: 'Airtel Money' },
  halopesa: { bg: '#F2A900', fg: '#1F2A1A', name: 'HaloPesa' },
};

interface Line {
  key: string;
  chip: { bg: string; fg: string; name: string };
  number: string;
  holder: string | null;
}

/**
 * Michango: the guest's pledge and what is paid, where to pay, and a payment
 * prompt sent to their phone. The prompt only exists on a personal
 * invitation (the token is what ties the money to the guest); the public
 * story page shows where to pay and nothing else.
 */
export function Michango({
  d,
  lang,
  token,
  guest,
  accounts,
}: {
  d: InviteDesign;
  lang: Lang;
  token: string | null;
  guest: InviteGuestView | null;
  accounts: PublicCollectionAccount[];
}) {
  const p = usePal();
  const S = STR[lang];
  const pledge = guest?.pledge ?? 0;
  const paid = guest?.paid ?? 0;
  const bal = Math.max(0, pledge - paid);
  const amounts = (bal > 0 ? [bal, 50_000, 100_000] : [50_000, 100_000, 200_000]).filter((v, i, a) => a.indexOf(v) === i);
  const [stage, setStage] = useState<'idle' | 'amount' | 'sending' | 'sent'>('idle');
  const [amt, setAmt] = useState(amounts[0] ?? 50_000);
  const [other, setOther] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Collection accounts first (slice D); until a wedding has any, the
  // numbers the couple typed into the design.
  const lines: Line[] =
    accounts.length > 0
      ? accounts.map((a, i) => ({
          key: `a${i}`,
          chip: RAIL[a.kind] ?? { bg: p.accent, fg: p.onacc, name: a.kind === 'bank' ? (a.bankName ?? a.label) : a.label },
          number: a.number,
          holder: a.accountName || null,
        }))
      : (
          [
            ['mpesa', d.michango.mpesa],
            ['tigo', d.michango.tigo],
            ['airtel', d.michango.airtel],
          ] as const
        )
          .filter(([, n]) => n !== '')
          .map(([k, n]) => ({ key: k, chip: RAIL[k] as Line['chip'], number: n, holder: null }));
  const holder = accounts.length > 0 ? null : d.michango.name || null;

  async function send() {
    if (token === null) return;
    setStage('sending');
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/rsvp/${encodeURIComponent(token)}/contribute`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ amount: amt, ...(other && phone.trim() !== '' ? { phone: phone.trim() } : {}) }),
      });
      if (res.status === 202) {
        setStage('sent');
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
      setError(
        data.code === 'ACCOUNT_NOT_READY' || data.code === 'STK_UNAVAILABLE'
          ? S.payNotReady
          : res.status === 400 && data.message
            ? data.message
            : S.payFailed,
      );
      setStage('amount');
    } catch {
      setError(S.payFailed);
      setStage('amount');
    }
  }

  const tiny = (color: string): CSSProperties => ({ ...monoStyle(p, 10, 0.08, color), textTransform: 'uppercase' });
  const primary: CSSProperties = {
    width: '100%',
    height: 48,
    border: 0,
    cursor: 'pointer',
    background: p.accent,
    color: p.onacc,
    fontFamily: p.sans,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  };

  return (
    <div style={{ padding: 20, borderRadius: 16, background: p.panel, color: p.pink, boxShadow: `inset 0 0 0 1px ${p.pink_(12)}` }}>
      {guest !== null &&
        (pledge > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
              {[
                [S.pledge, pledge],
                [S.paid, paid],
                [S.balance, bal],
              ].map(([l, v]) => (
                <div key={l as string} style={{ minWidth: 0 }}>
                  <div style={tiny(p.pink_(66))}>{l}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{tsh(v as number)}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 6, borderRadius: 999, overflow: 'hidden', marginTop: 14, background: p.pink_(10) }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.round((paid / pledge) * 100))}%`, background: p.accPn, borderRadius: 999 }} />
            </div>
          </>
        ) : (
          <div style={{ fontSize: 14, color: p.pink_(76) }}>{S.noPledge}</div>
        ))}

      {lines.length > 0 && (
        <>
          <div style={{ ...tiny(p.pink_(66)), marginTop: guest !== null ? 18 : 0 }}>{S.payTo}</div>
          {lines.map((r) => (
            <div key={r.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: `1px solid ${p.pink_(10)}` }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, background: r.chip.bg, color: r.chip.fg, ...monoStyle(p, 11, 0.06), fontWeight: 500, whiteSpace: 'nowrap' }}>
                {r.chip.name}
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 0 }}>
                <span style={{ ...monoStyle(p, 13, 0), fontVariantNumeric: 'tabular-nums' }}>{r.number}</span>
                {r.holder !== null && <span style={{ fontSize: 12, color: p.pink_(72) }}>{r.holder}</span>}
              </span>
            </div>
          ))}
          {holder !== null && (
            <div style={{ fontSize: 13, color: p.pink_(72), marginTop: 10 }}>
              {S.accName}: <strong style={{ fontWeight: 600, color: p.pink }}>{holder}</strong>
            </div>
          )}
        </>
      )}

      {token !== null && stage === 'idle' && (
        <button type="button" style={{ ...primary, marginTop: 16 }} onClick={() => setStage('amount')}>
          {S.payNow}
        </button>
      )}

      {token !== null && (stage === 'amount' || stage === 'sending') && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={tiny(p.pink_(66))}>{S.amount}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {amounts.map((v) => {
              const on = v === amt;
              return (
                <button
                  key={v}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setAmt(v)}
                  style={{ padding: '9px 14px', borderRadius: 999, cursor: 'pointer', ...monoStyle(p, 12, 0), fontVariantNumeric: 'tabular-nums', border: `1px solid ${on ? p.accent : p.pink_(24)}`, background: on ? p.accent : 'transparent', color: on ? p.onacc : p.pink }}
                >
                  {tsh(v)}
                </button>
              );
            })}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: p.pink_(80), cursor: 'pointer' }}>
            <input type="checkbox" checked={other} onChange={(e) => setOther(e.target.checked)} />
            {S.payFromOther}
          </label>
          {other && (
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              aria-label={S.phoneLabel}
              placeholder="07XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ height: 44, padding: '0 12px', borderRadius: 8, border: `1px solid ${p.pink_(30)}`, background: 'transparent', color: p.pink, fontFamily: p.mono, fontSize: 15 }}
            />
          )}
          <button type="button" style={primary} disabled={stage === 'sending'} onClick={() => void send()}>
            {stage === 'sending' ? S.sending : `${S.sendPrompt} · ${tsh(amt)}`}
          </button>
          {error !== null && (
            <div role="alert" style={{ fontSize: 13, color: p.pink }}>
              {error}
            </div>
          )}
        </div>
      )}

      {stage === 'sent' && (
        <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 8, background: '#E2E9DA', color: '#3A4F32', fontSize: 14, lineHeight: 1.45 }}>
          <strong style={{ fontWeight: 700 }}>
            ✓ {S.promptSent} {other && phone.trim() !== '' ? phone.trim() : S.yourPhone}
          </strong>
          <br />
          {tsh(amt)} · {lang === 'sw' ? 'Weka PIN yako kwenye simu kuthibitisha.' : 'Enter your PIN on your phone to confirm.'}
        </div>
      )}

      <div style={{ fontSize: 12, color: p.pink_(66), marginTop: 12, textAlign: 'center' }}>{S.payNote}</div>
    </div>
  );
}
