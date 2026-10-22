import { describe, expect, it } from 'vitest';
import { DEFAULT_NOTES, SECTION_KEYS, STR, attireOf, colourName, countdown, notesOf, normalise, page, venueBlurb, words } from './wcz';

const saved = normalise({
  tpl: 't03',
  lang: 'en',
  names: { a: 'Andrew', b: 'Franciana' },
  date: '2026-10-24',
  ceremony: { name: 'St. Joseph Cathedral', addr: 'Sokoine Drive, Dar es Salaam', time: '10:00' },
  dress: ['#8A9A5B', '#DCAE96'],
});

describe('normalise: designs saved before the new fields', () => {
  it('fills venue photos and blurbs, colours and notes with defaults', () => {
    expect(saved.attire).toEqual([]);
    expect(saved.notes).toEqual([]);
    expect(saved.ceremony.photo).toBeNull();
    expect(saved.reception).toEqual({ name: '', addr: '', time: '', photo: null, sw: '', en: '' });
    expect(saved.sections.quote).toBe(true);
    expect(saved.sections.notes).toBe(true);
    expect(saved.sections.wishes).toBe(true);
  });

  it('keeps a stored section order and appends the new sections after it', () => {
    const d = normalise({ ...saved, pageOver: { t03: { order: ['countdown', 'rsvp', 'venues'] } } });
    const order = page(d, 't03').order;
    expect(order.slice(0, 3)).toEqual(['countdown', 'rsvp', 'venues']);
    expect(order).toEqual(expect.arrayContaining(['quote', 'notes', 'wishes']));
    expect(order).toHaveLength(SECTION_KEYS.length);
  });
});

describe('celebration colours', () => {
  it('names a colour in both languages by its nearest match', () => {
    expect(colourName('#8A9A5B')).toEqual({ en: 'Sage green', sw: 'Kijani cha sage' });
    expect(colourName('#dcae96')).toEqual({ en: 'Dusty rose', sw: 'Waridi hafifu' });
    expect(colourName('#1F2A44').en).toBe('Navy');
    expect(colourName('#F7E7CE').en).toBe('Champagne');
  });

  it('derives the colour cards from the dress hexes until the couple names them', () => {
    expect(attireOf(saved)).toEqual([
      { hex: '#8A9A5B', en: 'Sage green', sw: 'Kijani cha sage', photo: null },
      { hex: '#DCAE96', en: 'Dusty rose', sw: 'Waridi hafifu', photo: null },
    ]);
    const named = normalise({ ...saved, attire: [{ hex: '#8A9A5B', en: 'Olive sage', sw: '', photo: 'https://cdn.test/a.jpg' }] });
    expect(attireOf(named)).toEqual([{ hex: '#8A9A5B', en: 'Olive sage', sw: 'Kijani cha sage', photo: 'https://cdn.test/a.jpg' }]);
  });
});

describe('guest notes and venue blurbs', () => {
  it('shows three default notes in each language until the couple writes their own', () => {
    expect(notesOf(saved, 'en').map((n) => n.title)).toEqual(['Adults only', 'Kindly be on time', 'Invitation required']);
    expect(notesOf(saved, 'sw').map((n) => n.title)).toEqual(DEFAULT_NOTES.map((n) => n.sw));
    const own = normalise({ ...saved, notes: [{ sw: 'Zawadi', en: 'Gifts', bodySw: '', bodyEn: 'Your presence is the gift.' }] });
    expect(notesOf(own, 'en')).toEqual([{ title: 'Gifts', body: 'Your presence is the gift.' }]);
    // A Swahili title the couple left blank falls back to the English one.
    expect(notesOf(own, 'sw')[0]?.title).toBe('Zawadi');
    expect(notesOf(own, 'sw')[0]?.body).toBe('Your presence is the gift.');
  });

  it('falls back to the default blurb for a venue without one', () => {
    expect(venueBlurb(saved.ceremony, 'en')).toBe(STR.en.venueBlurb);
    expect(venueBlurb(saved.ceremony, 'en', 'ceremony')).toBe('Join us as we exchange our vows.');
    expect(venueBlurb(saved.ceremony, 'sw', 'ceremony')).toBe(STR.sw.venueBlurbCeremony);
    expect(venueBlurb({ ...saved.ceremony, en: 'Join us at noon.' }, 'sw')).toBe('Join us at noon.');
    expect(venueBlurb({ ...saved.ceremony, sw: 'Karibuni saa sita.', en: 'Join us at noon.' }, 'sw')).toBe('Karibuni saa sita.');
  });
});

describe('wording', () => {
  it('has a quote, its signature and a tagline in both languages, with the couple as the default signature', () => {
    const en = words(saved, 'en');
    expect(en.quote).toBe(STR.en.quote);
    expect(en.quoteBy).toBe('Andrew & Franciana');
    expect(en.tagline).toBe('A beautiful chapter begins');
    const sw = words(normalise({ ...saved, words: { sw: { quoteBy: 'Familia ya Uiso' }, en: {} } }), 'sw');
    expect(sw.quote).toBe(STR.sw.quote);
    expect(sw.quoteBy).toBe('Familia ya Uiso');
  });

  it('says how many the entry pass admits', () => {
    expect(STR.en.entryFor(1)).toBe('Single');
    expect(STR.en.entryFor(2)).toBe('Entry for two');
    expect(STR.sw.entryFor(3)).toBe('Kuingia watu 3');
  });
});

describe('countdown', () => {
  it('counts to the ceremony in Dar es Salaam time', () => {
    // 09:00 Dar on the day is 06:00 UTC: one hour to a 10:00 ceremony.
    expect(countdown(saved, Date.UTC(2026, 9, 24, 6, 0, 0))).toEqual([0, 1, 0, 0]);
    expect(countdown(saved, Date.UTC(2026, 9, 25))).toEqual([0, 0, 0, 0]);
  });
});

describe('programme layout', () => {
  it('is the vertical timeline on every template until the couple picks another', () => {
    for (const t of ['t01', 't04', 't10', 't16', 't23']) expect(page(saved, t).ratiba).toBe('line');
    expect(page(normalise({ ...saved, pageOver: { t04: { ratiba: 'cards' } } }), 't04').ratiba).toBe('cards');
  });
});
