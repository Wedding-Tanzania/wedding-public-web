import { CARD_DESIGNS } from '@/lib/card';
import { renderCardImage } from '../../../rsvp/_card-image/render';

export const runtime = 'nodejs';

/**
 * One real card per design, with a sample couple, so the couple app can show
 * what a design actually looks like instead of a coloured block. Nothing here
 * is private: the names and the gate number are made up, and the QR points at
 * the public site. A day of caching is fine, the designs change with a deploy.
 */
export async function GET(_req: Request, { params }: { params: { design: string } }) {
  if (!(params.design in CARD_DESIGNS)) return new Response('Not found', { status: 404 });
  const res = await renderCardImage({
    templateKey: params.design,
    partnerA: 'Amina',
    partnerB: 'Juma',
    // Dar es Salaam midnight on 5 December 2026.
    weddingDate: '2026-12-04T21:00:00.000Z',
    venueName: 'Golden Tulip Hotel',
    venueAddress: 'Msasani Peninsula, Dar es Salaam',
    guestName: 'Bibi Rehema Mwakyusa',
    partyAllowed: 2,
    cardNumber: '1549-001',
    rsvpUrl: 'https://wedding.co.tz',
    sample: true,
  });
  res.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  return res;
}
