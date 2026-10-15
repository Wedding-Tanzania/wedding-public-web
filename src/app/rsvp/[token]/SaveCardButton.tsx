'use client';

import { useState } from 'react';

/**
 * Saves the invitation card where a guest will find it again: on a phone that
 * is the photo library, which only the share sheet can reach (iOS shows "Save
 * Image", Android "Save to Photos" or Gallery). A plain download link lands in
 * Files instead. Desktop browsers have no image share target, so they get the
 * ordinary download.
 */
export function SaveCardButton({ href, fileName }: { href: string; fileName: string }) {
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(href);
      if (!res.ok) throw new Error(`card ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] }) === true && isTouchDevice()) {
        await nav.share({ files: [file] });
        return;
      }
      download(URL.createObjectURL(blob), fileName);
    } catch (err) {
      // Closing the share sheet is a choice, not a failure.
      if (err instanceof DOMException && err.name === 'AbortError') return;
      download(href, fileName);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void save()}
      disabled={busy}
      className="border border-bordr bg-paper px-5 py-3 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-ink-1 hover:bg-herb-50 disabled:opacity-60"
    >
      {busy ? 'Preparing…' : 'Save card to phone'}
    </button>
  );
}

function isTouchDevice(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
}

function download(url: string, fileName: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (url.startsWith('blob:')) setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
