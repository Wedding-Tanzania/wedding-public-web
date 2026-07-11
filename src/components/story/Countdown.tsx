'use client';

import { useEffect, useState } from 'react';

/** Live countdown to the wedding day. Client-only so the seconds tick. */
export function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = now === null ? 0 : Math.max(0, new Date(target).getTime() - now);
  const days = Math.floor(diff / 86_400_000);
  const hrs = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1000);
  const cells: [number, string][] = [
    [days, 'Days'],
    [hrs, 'Hrs'],
    [mins, 'Min'],
    [secs, 'Sec'],
  ];

  return (
    <div className="flex items-center justify-center gap-5 sm:gap-8">
      {cells.map(([v, l]) => (
        <div key={l} className="text-center">
          <div className="font-sans text-3xl font-light tabular-nums text-herb-50 sm:text-4xl">
            {now === null ? '--' : String(v).padStart(2, '0')}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-herb-200">
            {l}
          </div>
        </div>
      ))}
    </div>
  );
}
