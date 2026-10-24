import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CARD_DESIGNS, legacyVenues, type InvitationCardView } from '@/lib/card';
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

/**
 * The church and the hall on the legacy card, from the derived design: both,
 * only the hall, none, and names long enough to wrap and be cut. A double
 * card with no seats saved is drawn too (it says "Admits 2").
 */
const VENUES = {
  both: legacyVenues(card('garden_sage', ''), {
    ceremony: { name: "St Joseph's Cathedral", addr: 'Sokoine Drive, Dar es Salaam', time: '10:00' },
    reception: { name: 'Golden Tulip Hotel', addr: 'Msasani Peninsula, Dar es Salaam', time: '18:00' },
  }),
  reception: legacyVenues(card('garden_sage', ''), {
    ceremony: { name: 'Golden Tulip Hotel', addr: 'Msasani Peninsula, Dar es Salaam', time: '18:00' },
    reception: { name: '', addr: '', time: '' },
  }),
  none: legacyVenues({}, { ceremony: { name: '', addr: '', time: '' }, reception: { name: '', addr: '', time: '' } }),
  long: legacyVenues(card('garden_sage', ''), {
    ceremony: {
      name: 'Kanisa Kuu la Mtakatifu Yosefu, Jimbo Kuu Katoliki la Dar es Salaam, Parokia ya Kivukoni',
      addr: 'Mtaa wa Sokoine, karibu na Bandari ya Dar es Salaam, Kivukoni, Ilala, Dar es Salaam',
      time: '10:00',
    },
    reception: {
      name: 'Mlimani City Conference Centre and the Grand Ballroom Hall, Upper Floor',
      addr: 'Sam Nujoma Road, Mlimani City Mall, Ubungo, Dar es Salaam, Tanzania',
      time: '18:30',
    },
  }),
};

describe('legacy card venues', () => {
  it('names the church and the hall, a lone venue as the hall, and nothing when there is none', () => {
    expect(VENUES.both.map((r) => r.label)).toEqual(['Church', 'Venue']);
    expect(VENUES.reception.map((r) => r.label)).toEqual(['Venue']);
    expect(VENUES.none).toEqual([]);
    // No design at all: the wedding's one venue on the card view, as the hall.
    expect(legacyVenues(card('garden_sage', ''), null)).toEqual([
      { key: 'reception', label: 'Venue', name: 'Golden Tulip Hotel', addr: 'Msasani Peninsula, Dar es Salaam', time: '' },
    ]);
  });

  for (const key of Object.keys(CARD_DESIGNS)) {
    for (const [tag, venues] of Object.entries(VENUES)) {
      for (const kind of ['single', 'double'] as CardKind[]) {
        it(`${key} renders a ${kind} card with venues: ${tag}`, async () => {
          // No seats saved: a double still admits two.
          const c = { ...card(key, tag === 'long' ? NAMES.long : NAMES.short), partyAllowed: undefined };
          const res = await renderCardImage(c, { kind, venues });
          expect(res.status).toBe(200);
          const bytes = new Uint8Array(await res.arrayBuffer());
          expect(Array.from(bytes.slice(0, 4))).toEqual(PNG_MAGIC);
          if (OUT) writeFileSync(join(OUT, `legacy-${key}-venues-${tag}-${kind}.png`), bytes);
        }, 30000);
      }
    }
  }
});
