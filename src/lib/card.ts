/**
 * The invitation card a guest receives.
 *
 * Mirrors `InvitationCardView` and `CARD_DESIGNS` in wedding-shared-types.
 * This repo builds standalone on Netlify and does not import that package,
 * so the six designs are copied here: change both together.
 */

import { dressChips, venueRows, type DressChip, type InviteDesign, type VenueRow } from './invite/wcz';

export type CardLayout = 'classic' | 'coast' | 'bold';

export interface CardDesign {
  label: string;
  layout: CardLayout;
  palette: { paper: string; ink: string; accent: string; soft: string };
  display: 'serif' | 'sans';
}

export const CARD_DESIGNS: Record<string, CardDesign> = {
  garden_sage: {
    label: 'Garden Sage',
    layout: 'classic',
    palette: { paper: '#F7F5EE', ink: '#1F2A1A', accent: '#4F6A42', soft: '#E2E9DA' },
    display: 'serif',
  },
  swahili_coast: {
    label: 'Swahili Coast',
    layout: 'coast',
    palette: { paper: '#FBF7F0', ink: '#14254F', accent: '#1A4DC5', soft: '#D9C7A8' },
    display: 'serif',
  },
  modern_linen: {
    label: 'Modern Linen',
    layout: 'classic',
    palette: { paper: '#F1EADB', ink: '#1F2A1A', accent: '#1F2A1A', soft: '#E0D6C2' },
    display: 'sans',
  },
  nikah_gold: {
    label: 'Nikah Gold',
    layout: 'bold',
    palette: { paper: '#FBF6E9', ink: '#3B2E0E', accent: '#8A6D1F', soft: '#F2E9D0' },
    display: 'serif',
  },
  kitenge_bold: {
    label: 'Kitenge Bold',
    layout: 'bold',
    palette: { paper: '#FFF8EC', ink: '#2B1A10', accent: '#B23A3A', soft: '#F2A900' },
    display: 'sans',
  },
  zanzibar_beach: {
    label: 'Zanzibar Beach',
    layout: 'coast',
    palette: { paper: '#F6F3EA', ink: '#0B3B3A', accent: '#0E7C7B', soft: '#F1EADB' },
    display: 'serif',
  },
};

export function cardDesignFor(templateKey: string): CardDesign {
  return CARD_DESIGNS[templateKey] ?? (CARD_DESIGNS.garden_sage as CardDesign);
}

export interface InvitationCardView {
  templateKey: string;
  photoUrl?: string;
  partnerA: string;
  partnerB: string;
  weddingDate: string;
  venueName?: string;
  venueAddress?: string;
  guestName: string;
  partyAllowed?: number;
  cardNumber: string;
  rsvpUrl: string;
  sample?: boolean;
}

/**
 * Weddings are stored as midnight in Dar es Salaam, which in UTC is the
 * evening before. Reading the date anywhere but Dar prints the wrong day.
 */
const TZ = 'Africa/Dar_es_Salaam';

export function cardDate(iso: string): { weekday: string; day: string; month: string; year: string; long: string } {
  const d = new Date(iso);
  const part = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-GB', { timeZone: TZ, ...opts }).format(d);
  return {
    weekday: part({ weekday: 'long' }),
    day: part({ day: 'numeric' }),
    month: part({ month: 'long' }),
    year: part({ year: 'numeric' }),
    long: part({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

export function partyLine(n: number | undefined): string | null {
  if (n === undefined || n <= 1) return null;
  return `Admits ${n}`;
}

/**
 * The church and the hall for the card a wedding sends before it saves a
 * design. From the design the API derives (or the stored one), else the
 * wedding's one venue on the card view. The legacy card is in English and
 * its design was never saved, so a lone venue is named as the hall.
 */
export function legacyVenues(
  card: Pick<InvitationCardView, 'venueName' | 'venueAddress'>,
  design?: Partial<Pick<InviteDesign, 'ceremony' | 'reception' | 'faith'>> | null,
): VenueRow[] {
  if (design != null) {
    const rows = venueRows(design, 'en', { loneIsReception: true });
    if (rows.length > 0) return rows;
  }
  return venueRows({ reception: { name: card.venueName ?? '', addr: card.venueAddress ?? '', time: '' } }, 'en');
}

/**
 * The dress-code colours for the legacy card's banner, from the design the
 * API sends (saved or derived), with English names (the legacy card is in
 * English). Empty without a design or without colours: the banner is as before.
 */
export function legacyDress(design?: Partial<Pick<InviteDesign, 'attire' | 'dress'>> | null): DressChip[] {
  if (design == null) return [];
  return dressChips({ attire: design.attire ?? [], dress: design.dress ?? [] }, 'en');
}
