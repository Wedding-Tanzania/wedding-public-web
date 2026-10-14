import type { InvitationCardView } from '@/lib/card';
import { renderCardImage } from '../../_card-image/render';

export const runtime = 'nodejs';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';

/** A guest's card as an image: the download, and the link preview on WhatsApp. */
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const res = await fetch(`${API_BASE}/rsvp/${encodeURIComponent(params.token)}`, { cache: 'no-store' });
  const card = res.ok ? ((await res.json()) as { card?: InvitationCardView }).card : undefined;
  if (card === undefined) return new Response('Not found', { status: 404 });
  return renderCardImage(card);
}
