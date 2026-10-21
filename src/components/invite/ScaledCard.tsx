'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CARD_H, CARD_W, COVER_H } from './InviteCard';

/**
 * Shows the 1080-wide card at whatever width its column has. The card is
 * drawn at full size and scaled, so the web card and the PNG are the same
 * drawing. Until the width is measured it is hidden rather than shown at the
 * wrong size.
 */
export function ScaledCard({ children, cover = false, initialWidth }: { children: ReactNode; cover?: boolean; initialWidth?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(initialWidth !== undefined ? initialWidth / CARD_W : null);
  useEffect(() => {
    const el = ref.current;
    if (el === null) return;
    const set = (w: number) => {
      if (w > 0) setScale(w / CARD_W);
    };
    set(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((es) => set(es[0]?.contentRect.width ?? 0));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const h = cover ? COVER_H : CARD_H;
  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', aspectRatio: `${CARD_W} / ${h}`, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: CARD_W,
          height: h,
          transformOrigin: '0 0',
          transform: `scale(${scale ?? 0.3})`,
          visibility: scale === null ? 'hidden' : 'visible',
        }}
      >
        {children}
      </div>
    </div>
  );
}
