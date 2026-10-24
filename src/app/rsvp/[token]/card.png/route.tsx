import type { InvitationCardView } from '@/lib/card';
import type { DesignFields, InviteGuestView } from '@/lib/invite/types';
import { normalise } from '@/lib/invite/wcz';
import { renderCardImage } from '../../_card-image/render';
import { renderInviteImage } from '../../../_invite-card/render';

export const runtime = 'nodejs';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';

/**
 * A guest's card as an image: the download, the link preview, and the header
 * image of the WhatsApp invitation. The new template renderer once the couple
 * has saved a design; the card they have today until then.
 */
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const res = await fetch(`${API_BASE}/rsvp/${encodeURIComponent(params.token)}`, { cache: 'no-store' });
  if (!res.ok) return new Response('Not found', { status: 404 });
  const ctx = (await res.json()) as { card?: InvitationCardView; guest?: InviteGuestView } & DesignFields;
  const card = ctx.card;
  if (card === undefined) return new Response('Not found', { status: 404 });
  if (ctx.designSaved === true && ctx.design != null && ctx.guest !== undefined) {
    return renderInviteImage({
      design: normalise(ctx.design),
      guest: { name: ctx.guest.name, seats: ctx.guest.seats, cardNumber: ctx.guest.cardNumber, kind: ctx.guest.kind },
      // The gate scanner reads the token out of this link; it is the same
      // link the legacy card's QR holds.
      qrText: card.rsvpUrl,
    });
  }
  return renderCardImage(card, { kind: ctx.guest?.kind });
}
