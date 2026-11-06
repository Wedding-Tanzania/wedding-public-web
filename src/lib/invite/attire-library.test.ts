import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ATTIRE_LIBRARY, LOOK_BY_NAME, LOOK_VARIANTS, libraryImage, libraryLook, menVariant } from './attire-library';
import { NAMED_COLOURS } from './wcz';

describe('attire library', () => {
  it('has all four photographs on disk for every look', () => {
    for (const l of ATTIRE_LIBRARY) {
      for (const v of LOOK_VARIANTS) {
        expect(existsSync(path.join(process.cwd(), 'public', libraryImage(l, v))), `${l.key} ${v}`).toBe(true);
      }
    }
  });

  it("picks the men's photograph from how the row says the men wear it", () => {
    expect(menVariant('suit')).toBe('men-suit');
    expect(menVariant('blazer')).toBe('men-blazer');
    expect(menVariant('black')).toBe('men-black');
    expect(libraryImage(libraryLook('#2E8B57'), menVariant('black'))).toBe('/attire/emerald-men-black.webp');
  });

  it('dresses every named colour in a look that exists', () => {
    const keys = new Set(ATTIRE_LIBRARY.map((l) => l.key));
    for (const n of NAMED_COLOURS) {
      expect(LOOK_BY_NAME[n.en], n.en).toBeDefined();
      expect(keys.has(LOOK_BY_NAME[n.en] ?? ''), n.en).toBe(true);
    }
  });

  it('picks the look by the colour name, not raw distance', () => {
    // Mint is a pale green: nearest in RGB would be champagne or ivory.
    expect(libraryLook('#C9D6BC').key).toBe('sage-green');
    expect(libraryLook('#800000').key).toBe('burgundy');
    expect(libraryLook('#E6E6FA').key).toBe('lilac');
    expect(libraryLook('#fff').key).toBe('ivory');
    // Andrew and Franciana's kind of picks.
    expect(libraryLook('#1F2A44').key).toBe('navy');
    expect(libraryLook('#D4AF37').key).toBe('gold');
  });
});
