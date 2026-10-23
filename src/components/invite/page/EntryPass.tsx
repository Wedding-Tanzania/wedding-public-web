'use client';

import { useEffect, useRef } from 'react';
import type { QrPath } from '@/lib/invite/qr';
import { STR, cardKindLabel, type CardKind, type Lang } from '@/lib/invite/wcz';
import type { InviteGuestView } from '@/lib/invite/types';
import { Icon } from './Icon';
import { labelStyle, monoStyle, usePal } from './palette';

export const ENTRY_PASS_ID = 'entry-pass';

/**
 * SINGLE or DOUBLE on the page, the same dark pill the card image carries,
 * so the gate reads the kind off a phone screen the way it reads it off
 * the printed card. A faint white edge keeps it visible on the dark pass.
 */
export function KindPill({ kind }: { kind: CardKind | undefined }) {
  const P = usePal();
  return (
    <span
      data-card-kind={kind ?? 'single'}
      style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px', borderRadius: 11, background: 'rgba(48,48,48,0.86)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.22)', color: '#FFFFFF', fontFamily: P.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}
    >
      {cardKindLabel(kind)}
    </span>
  );
}

/**
 * The guest's entry pass: the same QR the gate scanner reads, their name,
 * how many the card admits and the card number. Tapping the QR opens it full
 * screen so the kamati can scan it from a dim phone.
 */
export function EntryPass({ guest, qr, lang, cardPngUrl, onEnlarge }: { guest: InviteGuestView; qr: QrPath; lang: Lang; cardPngUrl: string | null; onEnlarge: () => void }) {
  const P = usePal();
  const S = STR[lang];
  const seats = guest.seats || 1;
  return (
    <div
        id={ENTRY_PASS_ID}
        data-entry-pass="1"
        style={{ width: '100%', boxSizing: 'border-box', padding: '26px 24px 24px', borderRadius: 18, background: P.ink, color: P.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, scrollMarginTop: 70, boxShadow: '0 22px 50px rgba(26,37,22,0.28)' }}
      >
        <div style={{ ...labelStyle(P, 10, 0.26, P.accent), opacity: 0.95 }}>{S.keepReady}</div>
        <div style={{ fontSize: 30, fontWeight: 300, fontStyle: 'italic', letterSpacing: '-0.01em', marginTop: 4 }}>{S.yourPass}</div>
        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 6, textWrap: 'balance', textAlign: 'center' }}>{guest.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ ...labelStyle(P, 11, 0.22, P.bg), opacity: 0.8 }}>{S.entryFor(seats)}</div>
          <KindPill kind={guest.kind} />
        </div>
        <button
          type="button"
          onClick={onEnlarge}
          aria-label={S.tapEnlarge}
          style={{ marginTop: 16, padding: 12, borderRadius: 14, border: 0, cursor: 'pointer', background: '#FFFFFF', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}
        >
          <svg viewBox={qr.vb} width={196} height={196} role="img" aria-label={`QR ${guest.cardNumber}`} style={{ display: 'block', shapeRendering: 'crispEdges' }}>
            <path d={qr.d} fill="#1F2A1A" />
          </svg>
        </button>
        <div style={{ ...labelStyle(P, 10, 0.2, P.bg), opacity: 0.7, marginTop: 10 }}>{S.tapEnlarge}</div>
        <div style={{ ...monoStyle(P, 12, 0.08), fontVariantNumeric: 'tabular-nums', marginTop: 8 }}>{`${S.card} ${guest.cardNumber}`}</div>
        <div style={{ fontSize: 13, opacity: 0.72, maxWidth: 300, textAlign: 'center' }}>{S.passNote}</div>
        {cardPngUrl !== null && (
          <a href={cardPngUrl} download={`invitation-${guest.cardNumber}.png`} style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', textDecoration: 'none', color: P.bg, border: `1px solid ${P.bg}66`, fontFamily: P.sans, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <Icon name="PictureAsPdf" size={16} />
            {S.download}
          </a>
        )}
    </div>
  );
}

/**
 * The pass full screen on white, for the gate: name, how many it admits, a
 * big QR and the card number. Opened by the floating "My entry pass" button
 * or by tapping the QR; Escape, the Close button or a tap closes it.
 */
export function EntryPassDialog({ guest, qr, lang, onClose }: { guest: InviteGuestView; qr: QrPath; lang: Lang; onClose: () => void }) {
  const P = usePal();
  const S = STR[lang];
  const seats = guest.seats || 1;
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={S.yourPass}
      data-entry-pass-big="1"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center', color: '#1F2A1A', cursor: 'pointer', fontFamily: P.sans }}
    >
      <div style={{ ...labelStyle(P, 11, 0.26, '#7E8A70') }}>{S.keepReady}</div>
      <div style={{ fontSize: 28, fontWeight: 300, fontStyle: 'italic' }}>{S.yourPass}</div>
      <div style={{ fontSize: 22, fontWeight: 600, textAlign: 'center' }}>{guest.name}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ ...labelStyle(P, 12, 0.22, '#4A5840') }}>{S.entryFor(seats)}</div>
        <KindPill kind={guest.kind} />
      </div>
      <svg viewBox={qr.vb} width="min(80vw, 420px)" height="min(80vw, 420px)" role="img" aria-label={`QR ${guest.cardNumber}`} style={{ display: 'block', shapeRendering: 'crispEdges', marginTop: 6 }}>
        <path d={qr.d} fill="#1F2A1A" />
      </svg>
      <div style={{ ...monoStyle(P, 15, 0.08), fontVariantNumeric: 'tabular-nums' }}>{`${S.card} ${guest.cardNumber}`}</div>
      <button ref={closeRef} type="button" onClick={onClose} style={{ marginTop: 10, padding: '12px 28px', border: '1px solid #1F2A1A', background: 'transparent', cursor: 'pointer', fontFamily: P.sans, fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1F2A1A' }}>
        {S.closeLabel}
      </button>
    </div>
  );
}

/** The floating "My entry pass" button at the bottom-left, which opens the pass full screen. */
export function EntryPassButton({ lang, onOpen }: { lang: Lang; onOpen: () => void }) {
  const P = usePal();
  const S = STR[lang];
  return (
    <button
      type="button"
      data-entry-pass-button="1"
      onClick={onOpen}
      aria-haspopup="dialog"
      style={{ pointerEvents: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 999, border: 0, cursor: 'pointer', background: '#FFFFFF', color: '#1F2A1A', boxShadow: '0 10px 26px rgba(26,37,22,0.28), inset 0 0 0 1px rgba(31,42,26,0.1)', fontFamily: P.sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}
    >
      <QrGlyph />
      {S.myPass}
    </button>
  );
}

function QrGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden style={{ display: 'block' }}>
      <path d="M3 3h8v8H3zm2 2v4h4V5zm8-2h8v8h-8zm2 2v4h4V5zM3 13h8v8H3zm2 2v4h4v-4zm8-2h3v3h-3zm5 0h3v3h-3zm-5 5h3v3h-3zm5 0h3v3h-3z" fill="currentColor" />
    </svg>
  );
}
