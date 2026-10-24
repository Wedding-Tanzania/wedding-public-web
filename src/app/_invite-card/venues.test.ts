import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { InviteCard, OG_FONTS } from '@/components/invite/InviteCard';
import { qrPath } from '@/lib/invite/qr';
import { sampleDesign } from '@/lib/invite/sample';
import { PASS_BOXES, TEMPLATES, VENUE_BOXES, shownSeats, venueRows, type CardKind, type InviteDesign } from '@/lib/invite/wcz';
import { renderInviteImage } from './render';

/**
 * The church and the hall on every card, and the seats a DOUBLE card shows.
 * Set CARD_OUT to a directory to keep the PNGs for a look.
 */
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];
const OUT = process.env.CARD_OUT;
if (OUT) mkdirSync(OUT, { recursive: true });

const BLANK = { name: '', addr: '', time: '' };
const LONG = {
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
};

type Scenario = 'both' | 'reception' | 'none' | 'long';
const SCENARIOS: Scenario[] = ['both', 'reception', 'none', 'long'];

function design(tpl: string, s: Scenario, lang: 'sw' | 'en' = 'sw'): InviteDesign {
  const d = sampleDesign(tpl, lang);
  if (s === 'reception') return { ...d, ceremony: { ...BLANK } };
  if (s === 'none') return { ...d, ceremony: { ...BLANK }, reception: { ...BLANK } };
  if (s === 'long') return { ...d, ...LONG };
  return d;
}

/** Seats missing, as the API sends a card with no seat count saved: one. */
const guest = (kind: CardKind, name = 'Pangras Mwanossa') => ({ name, seats: 1, cardNumber: '1549-002', kind });

function markup(d: InviteDesign, kind: CardKind = 'double', lang: 'sw' | 'en' = d.lang): string {
  return renderToStaticMarkup(
    createElement(InviteCard, { design: d, lang, guest: guest(kind), qr: qrPath('https://wedding.co.tz/rsvp/x'), fonts: OG_FONTS }),
  );
}

describe('seats on the card', () => {
  it('a double card shows two at the least, a single its own seats', () => {
    expect(shownSeats('double', 1)).toBe(2);
    expect(shownSeats('double', undefined)).toBe(2);
    expect(shownSeats('double', 0)).toBe(2);
    expect(shownSeats('double', 4)).toBe(4);
    expect(shownSeats('single', undefined)).toBe(1);
    expect(shownSeats('single', 3)).toBe(3);
    expect(shownSeats(undefined, 1)).toBe(1);
  });

  for (const t of TEMPLATES) {
    it(`${t.id} prints "Watu 2" / "2 guests" on a double card with no seats saved, and one on a single`, () => {
      expect(markup(sampleDesign(t.id, 'sw'), 'double')).toContain('Watu 2');
      expect(markup(sampleDesign(t.id, 'en'), 'double')).toContain('2 guests');
      const single = markup(sampleDesign(t.id, 'sw'), 'single');
      expect(single).toContain('Mtu 1');
      expect(single).not.toContain('Watu 2');
    });
  }
});

describe('venue rows', () => {
  it('names the church and the hall, in the card language, dropping empty and repeated venues', () => {
    const d = sampleDesign('t01');
    expect(venueRows(d, 'sw').map((r) => r.label)).toEqual(['Kanisa', 'Ukumbi']);
    expect(venueRows(d, 'en').map((r) => r.label)).toEqual(['Church', 'Venue']);
    expect(venueRows({ ...d, ceremony: { ...BLANK } }, 'sw').map((r) => r.key)).toEqual(['reception']);
    expect(venueRows({ ...d, ceremony: { ...BLANK }, reception: { ...BLANK } }, 'sw')).toEqual([]);
    expect(venueRows({ ...d, reception: { ...d.ceremony } }, 'sw').map((r) => r.key)).toEqual(['ceremony']);
    // A nikah is not in a church.
    expect(venueRows({ ...d, faith: 'nikah' }, 'sw')[0]?.label).toBe('Nikah');
    // The wedding's one venue on a design nobody saved is the hall.
    expect(venueRows({ ...d, reception: { ...BLANK } }, 'en', { loneIsReception: true })).toEqual([
      { key: 'reception', label: 'Venue', name: "St Joseph's Cathedral", addr: 'Sokoine Drive, Dar es Salaam', time: '10:00' },
    ]);
  });
});

/** Two boxes overlap, with a margin. */
const meets = (a: { left: number; top: number; right: number; bottom: number }, b: typeof a, gap: number) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom + gap && b.top < a.bottom + gap;

describe('venue lines on every template', () => {
  for (const t of TEMPLATES) {
    it(`${t.id} keeps its venue box clear of the ${t.pass} pass and inside the card`, () => {
      const v = VENUE_BOXES[t.id];
      expect(v).toBeDefined();
      if (v === undefined) return;
      const box = { left: v.left, top: v.top, right: v.left + v.width, bottom: v.top + v.height };
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(1080);
      expect(meets(box, PASS_BOXES[t.pass], 12)).toBe(false);
    });

    it(`${t.id} draws both venues, clipped to the box, when the design has them`, () => {
      const html = markup(design(t.id, 'both'));
      expect(html).toContain('data-venues="2"');
      expect(html).toContain('data-venue="ceremony"');
      expect(html).toContain('data-venue="reception"');
      expect(html).toMatch(/KANISA|Kanisa/);
      expect(html).toMatch(/UKUMBI|Ukumbi/);
      expect(html).toContain('Golden Tulip Hotel');
      expect(html).toContain('Msasani Peninsula, Dar es Salaam');
      const v = VENUE_BOXES[t.id];
      const tag = html.slice(html.lastIndexOf('<div', html.indexOf('data-venues=')), html.indexOf('data-venues=') + 400);
      expect(tag).toContain(`top:${v?.top}px`);
      expect(tag).toContain(`height:${v?.height}px`);
      expect(tag).toContain('overflow:hidden');
    });

    it(`${t.id} draws only the hall when there is no church, in English too`, () => {
      const html = markup(design(t.id, 'reception', 'en'));
      expect(html).toContain('data-venues="1"');
      expect(html).not.toContain('data-venue="ceremony"');
      expect(html).toContain('Golden Tulip Hotel');
      expect(html).toMatch(/VENUE|Venue/);
    });

    it(`${t.id} draws no venue lines and no stray separator when the design has none`, () => {
      const html = markup(design(t.id, 'none'));
      expect(html).not.toContain('data-venues');
      expect(html).not.toContain('data-venue=');
      // A separator with nothing on one side of it.
      // The t13 monogram's own dot (A · J) is a glyph, not a separator.
      expect(html.replace(/>·<\/span>/g, '')).not.toMatch(/>\s*·|·\s*</);
    });

    it(`${t.id} clamps long venue names to two lines and addresses to one`, () => {
      const html = markup(design(t.id, 'long'));
      expect(html).toContain('-webkit-line-clamp:2');
      expect(html).toContain('text-overflow:ellipsis');
    });
  }
});

/**
 * Each template draws as an image with both venues and with long ones (as
 * a double card), and with only the hall or none (as a single). CARD_ALL=1
 * draws every scenario for both kinds.
 */
const CASES: [Scenario, CardKind][] = process.env.CARD_ALL
  ? SCENARIOS.flatMap((s) => (['single', 'double'] as CardKind[]).map((k): [Scenario, CardKind] => [s, k]))
  : [
      ['both', 'double'],
      ['long', 'double'],
      ['reception', 'single'],
      ['none', 'single'],
    ];

describe('venue cards as images', () => {
  for (const t of TEMPLATES) {
    for (const [s, kind] of CASES) {
      {
        it(`${t.id} renders a ${kind} card with venues: ${s}`, async () => {
          const res = await renderInviteImage({
            design: design(t.id, s),
            guest: guest(kind, s === 'long' ? 'Mheshimiwa Bibi Rehema Mwakyusa na Familia ya Mwakatumbula' : 'Pangras Mwanossa'),
            qrText: 'https://wedding.co.tz/rsvp/sample',
          });
          expect(res.status).toBe(200);
          const bytes = new Uint8Array(await res.arrayBuffer());
          expect(Array.from(bytes.slice(0, 4))).toEqual(PNG_MAGIC);
          if (OUT) writeFileSync(join(OUT, `${t.id}-${s}-${kind}.png`), bytes);
        }, 30000);
      }
    }
  }
});
