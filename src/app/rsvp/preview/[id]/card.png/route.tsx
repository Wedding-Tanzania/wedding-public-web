import type { InvitationCardView } from '@/lib/card';
import type { DesignFields } from '@/lib/invite/types';
import { normalise } from '@/lib/invite/wcz';
import { renderCardImage } from '../../../_card-image/render';
import { renderInviteImage } from '../../../../_invite-card/render';

export const runtime = 'nodejs';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';

/** The couple's preview card: their saved design with a placeholder guest, else today's card. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const res = await fetch(`${API_BASE}/card-preview/${encodeURIComponent(params.id)}`, { cache: 'no-store' });
  if (!res.ok) return new Response('Not found', { status: 404 });
  const ctx = (await res.json()) as { card?: InvitationCardView } & DesignFields;
  const card = ctx.card;
  if (card === undefined) return new Response('Not found', { status: 404 });
  if (ctx.designSaved === true && ctx.design != null) {
    return renderInviteImage({
      design: normalise(ctx.design),
      guest: { name: card.guestName, seats: card.partyAllowed ?? 2, cardNumber: card.cardNumber },
      qrText: card.rsvpUrl,
    });
  }
  return renderCardImage(card);
}
