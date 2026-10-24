import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CARD_DESIGNS, type InvitationCardView } from '@/lib/card';
import type { CardKind } from '@/lib/invite/wcz';
import { renderCardImage } from './render';

/**
 * The card a wedding sends before the couple saves a design: every legacy
 * design draws for both kinds, and for a guest name long enough to wrap,
 * which is what would push the kind pill out of the banner. Set CARD_OUT to
 * a directory to keep the PNGs for a look.
 */
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];
const OUT = process.env.CARD_OUT;
if (OUT) mkdirSync(OUT, { recursive: true });

const card = (templateKey: string, guestName: string): InvitationCardView => ({
  templateKey,
  partnerA: 'Amina',
  partnerB: 'Juma',
  weddingDate: '2026-12-04T21:00:00.000Z',
  venueName: 'Golden Tulip Hotel',
  venueAddress: 'Msasani Peninsula, Dar es Salaam',
  guestName,
  partyAllowed: 2,
  cardNumber: '1549-001',
  rsvpUrl: 'https://wedding.co.tz/rsvp/sample',
});

const NAMES = { short: 'Bibi Rehema Mwakyusa', long: 'Mheshimiwa Bibi Rehema Mwakyusa na Familia ya Mwakatumbula' };

describe('legacy card image', () => {
  for (const key of Object.keys(CARD_DESIGNS)) {
    for (const kind of ['single', 'double'] as CardKind[]) {
      for (const [tag, name] of Object.entries(NAMES)) {
        it(`${key} renders a ${kind} card for a ${tag} name`, async () => {
          const res = await renderCardImage(card(key, name), { kind });
          expect(res.status).toBe(200);
          const bytes = new Uint8Array(await res.arrayBuffer());
          expect(Array.from(bytes.slice(0, 4))).toEqual(PNG_MAGIC);
          if (OUT) writeFileSync(join(OUT, `legacy-${key}-${kind}-${tag}.png`), bytes);
        }, 30000);
      }
    }
  }
});
