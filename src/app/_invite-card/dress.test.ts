import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { InviteCard, OG_FONTS } from '@/components/invite/InviteCard';
import { InvitationCard } from '@/components/card/InvitationCard';
import { Venues } from '@/components/invite/page/Venues';
import { PalContext, palette } from '@/components/invite/page/palette';
import { CARD_DESIGNS, legacyDress, legacyVenues, type InvitationCardView } from '@/lib/card';
import { qrPath } from '@/lib/invite/qr';
import { sampleDesign } from '@/lib/invite/sample';
import {
  DRESS_BANDS,
  MAX_DRESS_CHIPS,
  TEMPLATES,
  VENUE_BOXES,
  dressChips,
  dressLift,
  dressStackH,
  exactMapUrl,
  passBoxAt,
  venueBoxAt,
  theme,
  type Attire,
  type InviteDesign,
  type Lang,
} from '@/lib/invite/wcz';
import { renderCardImage } from '../rsvp/_card-image/render';
import { renderInviteImage } from './render';

/**
 * The dress-code colours in the guest banner, so guests know what to wear:
 * the named celebration colours (or bare swatches from the dress hexes), up
 * to eight, on all 23 templates and the legacy card. With none the banner
 * is exactly as before. Set CARD_OUT to a directory to keep the PNGs.
 */
// The legacy HTML card loads its serif through next/font, which only runs under Next.
vi.mock('next/font/google', () => ({ Cormorant_Garamond: () => ({ className: 'serif' }) }));

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];
const OUT = process.env.CARD_OUT;
if (OUT) mkdirSync(OUT, { recursive: true });

const A = (hex: string, sw: string, en: string): Attire => ({ hex, sw, en, photo: null });
const EIGHT = [
  A('#1F2A44', 'Buluu iliyokoza', 'Navy'),
  A('#D4AF37', 'Dhahabu', 'Gold'),
  A('#FFFFFF', 'Nyeupe', 'White'),
  A('#8A9A5B', 'Kijani cha sage', 'Sage green'),
  A('#DCAE96', 'Waridi hafifu', 'Dusty rose'),
  A('#800020', 'Nyekundu iliyokoza', 'Burgundy'),
  A('#FFFDD0', 'Krimu', 'Cream'),
  A('#1F2A1A', 'Nyeusi', 'Black'),
];
const named = (tpl: string, n: number, lang: 'sw' | 'en' = 'sw'): InviteDesign => ({ ...sampleDesign(tpl, lang), attire: EIGHT.slice(0, n), dress: EIGHT.slice(0, n).map((a) => a.hex) });
const hexOnly = (tpl: string): InviteDesign => ({ ...sampleDesign(tpl), attire: [], dress: ['#1F2A44', '#D4AF37', '#FFFFFF', '#8A9A5B'] });
const none = (tpl: string): InviteDesign => ({ ...sampleDesign(tpl), attire: [], dress: [] });
const guest = { name: 'Andrew na Franciana Uiso', seats: 2, cardNumber: '0468-002', kind: 'double' as const };
const markup = (d: InviteDesign, lang: 'sw' | 'en' = d.lang) =>
  renderToStaticMarkup(createElement(InviteCard, { design: d, lang, guest, qr: qrPath('https://wedding.co.tz/rsvp/x'), fonts: OG_FONTS }));

describe('the colours a card shows', () => {
  it('takes the named colours in the card language, else the other language, else the nearest name', () => {
    const d = { attire: [A('#1F2A44', 'Buluu', 'Navy'), A('#D4AF37', '', 'Gold'), A('#FFFFFF', '', '')], dress: [] };
    expect(dressChips(d, 'sw')).toEqual([
      { hex: '#1F2A44', name: 'Buluu' },
      { hex: '#D4AF37', name: 'Gold' },
      { hex: '#FFFFFF', name: 'Nyeupe' },
    ]);
    expect(dressChips(d, 'en')[0]?.name).toBe('Navy');
  });

  it('falls back to the dress hexes as bare swatches, and is empty with neither', () => {
    expect(dressChips({ attire: [], dress: ['#1f2a44', '#D4AF37'] }, 'sw')).toEqual([
      { hex: '#1F2A44', name: '' },
      { hex: '#D4AF37', name: '' },
    ]);
    expect(dressChips({ attire: [], dress: [] }, 'sw')).toEqual([]);
    expect(dressChips({ attire: null, dress: null }, 'en')).toEqual([]);
  });

  it('draws at most eight', () => {
    expect(dressChips({ attire: [...EIGHT, ...EIGHT], dress: [] }, 'sw')).toHaveLength(MAX_DRESS_CHIPS);
  });

  it('grows the banner only when there are colours', () => {
    for (const pass of ['card', 'glass', 'line', 'ticket', 'stack'] as const) expect(dressLift(pass, 0)).toBe(0);
    const b = DRESS_BANDS.card;
    expect(dressLift('card', 3)).toBe(b.row + b.strip - b.height - b.foot);
    expect(dressLift('stack', 4)).toBe(dressStackH(4));
    // Five to eight wrap to a second row of four on the narrow stack pass.
    expect(dressLift('stack', 5)).toBeGreaterThan(dressLift('stack', 4));
    expect(dressLift('stack', 8)).toBe(dressLift('stack', 5));
  });
});

/** Two boxes overlap, with a margin. */
const meets = (a: { left: number; top: number; right: number; bottom: number }, b: typeof a, gap: number) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom + gap && b.top < a.bottom + gap;

describe('the dress row on every template', () => {
  for (const t of TEMPLATES) {
    it(`${t.id} keeps its venue box clear of the taller ${t.pass} pass, for one to eight colours`, () => {
      for (let n = 1; n <= MAX_DRESS_CHIPS; n++) {
        const lift = dressLift(t.pass, n);
        const v = venueBoxAt(t.id, lift);
        const box = { left: v.left, top: v.top, right: v.left + v.width, bottom: v.top + v.height };
        const pass = passBoxAt(t.pass, lift);
        expect(box.top).toBeGreaterThanOrEqual(0);
        expect(pass.bottom).toBeLessThanOrEqual(1350);
        expect(meets(box, pass, 12)).toBe(false);
      }
    });

    it(`${t.id} names three colours under the label, in Kiswahili and English`, () => {
      const sw = markup(named(t.id, 3));
      expect(sw).toContain('data-dress="3"');
      expect(sw).toContain('Mavazi');
      for (const n of ['Buluu iliyokoza', 'Dhahabu', 'Nyeupe']) expect(sw).toContain(n);
      expect(sw.match(/data-chip=/g)).toHaveLength(3);
      const en = markup(named(t.id, 3, 'en'));
      expect(en).toContain('Dress code');
      for (const n of ['Navy', 'Gold', 'White']) expect(en).toContain(n);
    });

    it(`${t.id} fits eight colours, cutting long names with an ellipsis`, () => {
      const html = markup(named(t.id, 8));
      expect(html.match(/data-chip=/g)).toHaveLength(8);
      expect(html).toContain('text-overflow:ellipsis');
    });

    it(`${t.id} draws bare swatches for a design with only dress hexes`, () => {
      const html = markup(hexOnly(t.id));
      expect(html).toContain('data-dress="4"');
      expect(html.match(/data-chip=/g)).toHaveLength(4);
      expect(html).not.toContain('Buluu iliyokoza');
    });

    it(`${t.id} keeps the old banner and venue box with no colours`, () => {
      const html = markup(none(t.id));
      expect(html).not.toContain('data-dress');
      expect(html).not.toContain('data-chip');
      expect(venueBoxAt(t.id, dressLift(t.pass, 0))).toEqual(VENUE_BOXES[t.id]);
    });

    it(`${t.id} keeps the colours off the page hero (the page has its own dress section)`, () => {
      const d = named(t.id, 3);
      const html = renderToStaticMarkup(createElement(InviteCard, { design: d, lang: d.lang, guest: null, qr: qrPath('x'), fonts: OG_FONTS, cover: true }));
      expect(html).not.toContain('data-dress');
    });
  }
});

describe('dress row cards as images', () => {
  const CASES: [string, (tpl: string) => InviteDesign, string][] = [
    ['three', (tpl) => named(tpl, 3), 'Andrew na Franciana Uiso'],
    ['eight', (tpl) => named(tpl, 8), 'Mheshimiwa Bibi Rehema Mwakyusa na Familia ya Mwakatumbula'],
    ['hex', hexOnly, 'Andrew na Franciana Uiso'],
  ];
  for (const t of TEMPLATES) {
    for (const [tag, make, name] of CASES) {
      it(`${t.id} renders a double card with both venues and colours: ${tag}`, async () => {
        const res = await renderInviteImage({ design: make(t.id), guest: { ...guest, name }, qrText: 'https://wedding.co.tz/rsvp/sample' });
        expect(res.status).toBe(200);
        const bytes = new Uint8Array(await res.arrayBuffer());
        expect(Array.from(bytes.slice(0, 4))).toEqual(PNG_MAGIC);
        if (OUT) writeFileSync(join(OUT, `${t.id}-dress-${tag}.png`), bytes);
      }, 30000);
    }
  }
});

const legacyCard = (templateKey: string): InvitationCardView => ({
  templateKey,
  partnerA: 'Andrew',
  partnerB: 'Franciana',
  weddingDate: '2026-12-04T21:00:00.000Z',
  venueName: 'Golden Tulip Hotel',
  venueAddress: 'Msasani Peninsula, Dar es Salaam',
  guestName: 'Mheshimiwa Bibi Rehema Mwakyusa na Familia ya Mwakatumbula',
  partyAllowed: 2,
  cardNumber: '0468-002',
  rsvpUrl: 'https://wedding.co.tz/rsvp/sample',
});
const legacyDesign = {
  ceremony: { name: "St Joseph's Cathedral", addr: 'Sokoine Drive, Dar es Salaam', time: '10:00' },
  reception: { name: 'Golden Tulip Hotel', addr: 'Msasani Peninsula, Dar es Salaam', time: '18:00' },
};

describe('the legacy card', () => {
  it('reads the colours in English from the design, and none without one', () => {
    expect(legacyDress({ attire: EIGHT.slice(0, 2), dress: [] }).map((c) => c.name)).toEqual(['Navy', 'Gold']);
    expect(legacyDress({ dress: ['#FFFFFF'] })).toEqual([{ hex: '#FFFFFF', name: '' }]);
    expect(legacyDress(null)).toEqual([]);
    expect(legacyDress({})).toEqual([]);
  });

  for (const key of Object.keys(CARD_DESIGNS)) {
    it(`${key} draws eight colours in its banner with both venues`, async () => {
      const design = { ...legacyDesign, attire: EIGHT, dress: [] };
      const res = await renderCardImage(legacyCard(key), { kind: 'double', venues: legacyVenues(legacyCard(key), design), dress: legacyDress(design) });
      expect(res.status).toBe(200);
      const bytes = new Uint8Array(await res.arrayBuffer());
      expect(Array.from(bytes.slice(0, 4))).toEqual(PNG_MAGIC);
      if (OUT) writeFileSync(join(OUT, `legacy-${key}-dress.png`), bytes);
    }, 30000);
  }

  it('shows the colours on the HTML card, and nothing extra without them', () => {
    const card = legacyCard('garden_sage');
    const withDress = renderToStaticMarkup(createElement(InvitationCard, { card, qrSvg: '<svg/>', dress: legacyDress({ attire: EIGHT.slice(0, 3) }) }));
    expect(withDress).toContain('data-dress="3"');
    expect(withDress).toContain('Dress code');
    expect(withDress).toContain('Gold');
    const without = renderToStaticMarkup(createElement(InvitationCard, { card, qrSvg: '<svg/>' }));
    expect(without).not.toContain('data-dress');
  });
});

describe('the venue map button on the wedding page', () => {
  const venue = { name: 'Golden Tulip Hotel', addr: 'Msasani Peninsula', time: '18:00' };
  const page = (lang: Lang, label: string, v: typeof venue & { map?: string }) => {
    const d = sampleDesign('t02', lang);
    return renderToStaticMarkup(
      createElement(PalContext.Provider, { value: palette(theme(d, d.tpl)) }, createElement(Venues, { lang, items: [{ label, kind: 'reception', v }] })),
    );
  };

  it('takes only an https Google Maps link as the exact one', () => {
    expect(exactMapUrl({ map: 'https://maps.app.goo.gl/AbC123' })).toBe('https://maps.app.goo.gl/AbC123');
    expect(exactMapUrl({ map: 'https://www.google.com/maps/place/X/@-6.7,39.2,17z' })).not.toBeNull();
    expect(exactMapUrl({ map: 'https://goo.gl/maps/AbC' })).not.toBeNull();
    expect(exactMapUrl({ map: 'https://maps.google.com/?cid=1' })).not.toBeNull();
    for (const bad of ['', 'http://maps.app.goo.gl/x', 'https://example.com/maps', 'https://maps.app.goo.gl.evil.test/x', 'javascript:alert(1)']) {
      expect(exactMapUrl({ map: bad })).toBeNull();
    }
    expect(exactMapUrl({})).toBeNull();
  });

  it("opens the couple's own link, Fungua ramani / Open in Google Maps, when they saved one", () => {
    const map = 'https://maps.app.goo.gl/AbC123';
    const sw = page('sw', 'Ukumbi', { ...venue, map });
    expect(sw).toContain(`href="${map}"`);
    expect(sw).toContain('data-map-link="exact"');
    expect(sw).toContain('Fungua ramani');
    const en = page('en', 'Reception', { ...venue, map });
    expect(en).toContain('Open in Google Maps');
  });

  it('keeps the search link without one', () => {
    const html = page('en', 'Reception', venue);
    expect(html).toContain('https://www.google.com/maps/search/?api=1&amp;query=');
    expect(html).toContain('data-map-link="1"');
    expect(html).not.toContain('Open in Google Maps');
  });
});
