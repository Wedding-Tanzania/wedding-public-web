/**
 * The public payloads the invitation reads, vendored from
 * wedding-shared-types (types/invite-design.ts) so this repo builds
 * standalone. The shared-types package stays the source of truth.
 */
import type { InviteDesign } from './wcz';

/** Where guests pay or send gifts. Only the ones the couple shows guests. */
export interface PublicCollectionAccount {
  kind: 'mpesa' | 'mixx_yas' | 'airtel' | 'halopesa' | 'lipa_namba' | 'bank' | 'other';
  label: string;
  number: string;
  accountName: string;
  bankName: string | null;
  showToGuests: boolean;
}

export interface PublicStoryExtras {
  welcomeMessage: string | null;
  ourStory: string | null;
  faqs: { question: string; answer: string }[];
  weddingParty: { name: string; role: string; photoUrl: string | null }[];
  registryNote: string | null;
  travelNote: string | null;
  hashtag: string | null;
  rsvpOpen: boolean;
}

export type GuestRsvp = 'pending' | 'yes' | 'no' | 'maybe';

/** The guest a personal invitation is for. */
export interface InviteGuestView {
  id: string;
  name: string;
  seats: number;
  rsvp: GuestRsvp;
  coming: number | null;
  pledge: number;
  paid: number;
  cardNumber: string;
  generic: null | { side: string; label: string; requirePhone: boolean; claimed: boolean };
}

export interface CalendarLinks {
  googleUrl: string;
  icsUrl: string;
  startsAt?: string;
  allDay?: boolean;
}

/** What the design-aware endpoints add to their payloads. */
export interface DesignFields {
  design?: InviteDesign | null;
  /** False until the couple saves a design: keep the current page and card. */
  designSaved?: boolean;
  accounts?: PublicCollectionAccount[];
}
