import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { sampleDesign, sampleGuest } from '@/lib/invite/sample';
import { TEMPLATES, type CardKind } from '@/lib/invite/wcz';
import { renderInviteImage } from './render';

/**
 * Every template must draw a card with no photos at all (generic cards and
 * many weddings have `photos: []`) for both card kinds. Set CARD_OUT to a
 * directory to keep the PNGs for a look.
 */
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];
const OUT = process.env.CARD_OUT;
if (OUT) mkdirSync(OUT, { recursive: true });

describe('card image with no photos', () => {
  for (const t of TEMPLATES) {
    for (const kind of ['single', 'double'] as CardKind[]) {
      it(`${t.id} ${t.en} renders a ${kind} card`, async () => {
        const g = sampleGuest(kind);
        const res = await renderInviteImage({
          design: sampleDesign(t.id),
          guest: { name: g.name, seats: g.seats, cardNumber: g.cardNumber, kind },
          qrText: 'https://wedding.co.tz/rsvp/sample',
        });
        expect(res.status).toBe(200);
        const bytes = new Uint8Array(await res.arrayBuffer());
        expect(Array.from(bytes.slice(0, 4))).toEqual(PNG_MAGIC);
        if (OUT) writeFileSync(join(OUT, `${t.id}-${kind}.png`), bytes);
      }, 30000);
    }
  }
});

/**
 * The kind pill shares the banner's gate line, so the longest names (which
 * wrap to two lines and make the banner text tallest) are the case that
 * would push the pill out of the banner. DOUBLE is the wider of the two words.
 */
const LONG_NAMES = {
  long: 'Mheshimiwa Bibi Rehema Mwakyusa na Familia ya Mwakatumbula',
  longest: 'Mheshimiwa Mchungaji Dkt. Emmanuel Mwakatumbula na Bibi Rehema Mwakyusa na Familia',
};

describe('card image with a long guest name', () => {
  for (const t of TEMPLATES) {
    for (const [tag, name] of Object.entries(LONG_NAMES)) {
      it(`${t.id} ${t.en} renders a double card for a ${name.length} character name`, async () => {
        const g = sampleGuest('double');
        const res = await renderInviteImage({
          design: sampleDesign(t.id),
          guest: { name, seats: g.seats, cardNumber: g.cardNumber, kind: 'double' },
          qrText: 'https://wedding.co.tz/rsvp/sample',
        });
        expect(res.status).toBe(200);
        const bytes = new Uint8Array(await res.arrayBuffer());
        expect(Array.from(bytes.slice(0, 4))).toEqual(PNG_MAGIC);
        if (OUT) writeFileSync(join(OUT, `${t.id}-double-${tag}.png`), bytes);
      }, 30000);
    }
  }
});
