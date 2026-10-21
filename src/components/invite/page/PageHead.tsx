'use client';

import { labelStyle, monoStyle, nameStyle, usePal } from './palette';

/** Section headings in the four styles the page recipes use. */
export function PageHead({ v, k, h, n }: { v: 'center' | 'left' | 'num' | 'frame'; k: string; h: string; n: string }) {
  const p = usePal();
  if (v === 'left') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 2, background: p.accent }} />
          <div style={labelStyle(p, 11, 0.22, p.accBg)}>{k}</div>
        </div>
        <h2 style={{ ...nameStyle(p, 32, 1.1), margin: 0, textWrap: 'balance' }}>{h}</h2>
      </div>
    );
  }
  if (v === 'num') {
    return (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 22, paddingBottom: 12, borderBottom: `1px solid ${p.ink_(22)}` }}>
        <div style={{ ...monoStyle(p, 12, 0, p.accBg), fontVariantNumeric: 'tabular-nums' }}>{n}</div>
        <h2 style={{ ...nameStyle(p, 26, 1.1), flex: 1, minWidth: 0, margin: 0 }}>{h}</h2>
        <div style={{ ...labelStyle(p, 10, 0.18, p.ink_(66)), maxWidth: '45%', textAlign: 'right' }}>{k}</div>
      </div>
    );
  }
  if (v === 'frame') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{ padding: 4, border: `1px solid ${p.accent}` }}>
          <div style={{ padding: '12px 24px', border: `1px solid ${p.acc_(55)}`, textAlign: 'center' }}>
            <div style={labelStyle(p, 10, 0.24, p.accBg)}>{k}</div>
            <h2 style={{ ...nameStyle(p, 24, 1.15), marginTop: 4, marginBottom: 0 }}>{h}</h2>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center', marginBottom: 22 }}>
      <div style={labelStyle(p, 11, 0.22, p.accBg)}>{k}</div>
      <h2 style={{ ...nameStyle(p, 28, 1.15), margin: 0, textWrap: 'balance' }}>{h}</h2>
    </div>
  );
}
