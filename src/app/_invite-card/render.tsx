import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { CARD_H, CARD_W, InviteCard, OG_FONTS, type CardGuest } from '@/components/invite/InviteCard';
import { placeSlot } from '@/lib/invite/photo';
import { qrPath } from '@/lib/invite/qr';
import { templateFor, type InviteDesign, type Lang } from '@/lib/invite/wcz';

const FONT_DIR = join(process.cwd(), 'src/app/_invite-card/fonts');

type Weight = 200 | 300 | 400 | 500 | 600 | 700 | 800;
const MANROPE: Weight[] = [200, 300, 400, 500, 600, 700, 800];
const MONO: Weight[] = [400, 500, 700];

let fontCache: Promise<{ name: string; data: Buffer; weight: Weight; style: 'normal' }[]> | null = null;

/** Manrope 200 to 800 and JetBrains Mono 400/500/700, read once per process. */
function fonts() {
  if (fontCache === null) {
    fontCache = Promise.all([
      ...MANROPE.map(async (w) => ({
        name: 'Manrope',
        data: await readFile(join(FONT_DIR, `manrope-latin-${w}-normal.woff`)),
        weight: w,
        style: 'normal' as const,
      })),
      ...MONO.map(async (w) => ({
        name: 'JetBrains Mono',
        data: await readFile(join(FONT_DIR, `jetbrains-mono-latin-${w}-normal.woff`)),
        weight: w,
        style: 'normal' as const,
      })),
    ]);
  }
  return fontCache;
}

/**
 * A photo as a data URL, or nothing. The renderer cannot decode WEBP, and a
 * photo that is slow or broken must not take the whole card with it, so only
 * a JPEG or PNG that arrives within four seconds is drawn; anything else
 * leaves the slot in its tint.
 */
async function photoData(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const type = res.headers.get('content-type') ?? '';
    if (!res.ok || !/^image\/(jpeg|png)/.test(type)) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    return `data:${type.split(';')[0]};base64,${bytes.toString('base64')}`;
  } catch {
    return null;
  }
}

export interface InviteImageInput {
  design: InviteDesign;
  guest: CardGuest | null;
  lang?: Lang;
  /** What the QR holds: the guest's RSVP link, which the gate scanner reads. */
  qrText: string;
}

/** The guest's card as a 1080 x 1350 PNG, drawn by the same component the page uses. */
export async function renderInviteImage(input: InviteImageInput): Promise<ImageResponse> {
  const { design } = input;
  const t = templateFor(design.tpl);
  const urls = [
    ...new Set(
      t.slots
        .map((s) => placeSlot(design, t.id, s)?.src)
        .filter((u): u is string => typeof u === 'string' && u.length > 0),
    ),
  ];
  const [loadedFonts, ...datas] = await Promise.all([fonts(), ...urls.map((u) => photoData(u))]);
  const bySrc = new Map<string, string | null>(urls.map((u, i) => [u, datas[i] ?? null]));

  return new ImageResponse(
    (
      <InviteCard
        design={design}
        lang={input.lang ?? design.lang}
        guest={input.guest}
        qr={qrPath(input.qrText)}
        fonts={OG_FONTS}
        photoSrc={(src) => bySrc.get(src) ?? null}
      />
    ),
    {
      width: CARD_W,
      height: CARD_H,
      fonts: loadedFonts,
      headers: { 'Cache-Control': 'private, max-age=60' },
    },
  );
}
