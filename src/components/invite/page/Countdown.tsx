'use client';

import { useEffect, useState } from 'react';
import { STR, countdown, type InviteDesign, type Lang, type PageRecipe } from '@/lib/invite/wcz';
import { labelStyle, monoStyle, nameStyle, usePal } from './palette';

/** Days, hours, minutes, seconds to the ceremony, read in Dar es Salaam time. Ticks on its own. */
export function Countdown({ d, lang, view }: { d: InviteDesign; lang: Lang; view: PageRecipe['count'] }) {
  const p = usePal();
  const S = STR[lang];
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  // The server and the first browser render show dashes, so the markup
  // matches on hydrate; the real numbers arrive a moment later.
  const v = countdown(d, now ?? Date.now());
  const pad = (n: number) => (now === null ? '--' : String(n).padStart(2, '0'));
  if (view === 'big') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }} suppressHydrationWarning>
        <div style={{ ...nameStyle(p, 120, 0.9), letterSpacing: '-0.05em', textTransform: 'none', color: p.accBg, fontVariantNumeric: 'tabular-nums' }} suppressHydrationWarning>
          {now === null ? '--' : v[0]}
        </div>
        <div style={{ ...labelStyle(p, 12, 0.3, p.ink), marginTop: 10 }}>{S.units[0]}</div>
        <div style={{ ...monoStyle(p, 12, 0.08, p.ink_(70)), marginTop: 10, fontVariantNumeric: 'tabular-nums' }} suppressHydrationWarning>
          {v.slice(1).map((x, i) => `${pad(x)} ${S.units[i + 1]}`).join(' · ')}
        </div>
      </div>
    );
  }
  if (view === 'line') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 16px', ...monoStyle(p, 15, 0.08), textTransform: 'uppercase', fontVariantNumeric: 'tabular-nums' }}>
        {v.map((x, i) => (
          <span key={i} suppressHydrationWarning>
            <strong style={{ fontWeight: 700, color: p.accBg }}>{pad(x)}</strong> {S.units[i]}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
      {v.map((x, i) => (
        <div key={i} style={{ padding: '14px 4px', borderRadius: 16, background: p.acc_(14), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }} suppressHydrationWarning>
            {pad(x)}
          </div>
          <div style={labelStyle(p, 10, 0.12, p.ink_(70))}>{S.units[i]}</div>
        </div>
      ))}
    </div>
  );
}
