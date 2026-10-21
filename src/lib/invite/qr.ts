import QRCode from 'qrcode';

/**
 * A QR as one SVG path, built from the qrcode library's module matrix: one
 * rectangle per run of dark modules, with a two-module quiet zone. A plain
 * <path> draws the same in the browser and in the card image renderer,
 * which cannot embed SVG markup strings. Error correction M survives a
 * crease or a cracked screen at the gate.
 */
export interface QrPath {
  vb: string;
  d: string;
}

const cache = new Map<string, QrPath>();

export function qrPath(text: string): QrPath {
  const hit = cache.get(text);
  if (hit !== undefined) return hit;
  const q = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const n = q.modules.size;
  let d = '';
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (q.modules.get(r, c)) {
        const s = c;
        while (c < n && q.modules.get(r, c)) c++;
        d += `M${s + 2} ${r + 2}h${c - s}v1h-${c - s}z`;
      } else c++;
    }
  }
  const out = { vb: `0 0 ${n + 4} ${n + 4}`, d };
  cache.set(text, out);
  return out;
}
