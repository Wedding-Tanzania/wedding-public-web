import { NAMED_COLOURS, hex } from './wcz';

/**
 * The dress-code photo library: one photograph per celebration colour of a
 * man in a suit and a woman in a gown of that colour, on a plain background.
 * Francis (2026-11-05) asked for human-looking people instead of the drawn
 * figures. The couple's own outfit photo, when uploaded, always wins over the
 * library (see Attire.tsx).
 *
 * The files live in public/attire/<key>.webp (720x960). Any colour a couple
 * picks is first named (the nearest of NAMED_COLOURS, the same naming the
 * swatches use) and that name picks the look, so "Mint" dresses in sage and
 * "Maroon" in burgundy rather than whatever is nearest in raw RGB.
 */
export interface LibraryLook {
  key: string;
  /** The colour the photograph was made for. */
  hex: string;
}

export const ATTIRE_LIBRARY: readonly LibraryLook[] = [
  { key: 'sage-green', hex: '#8A9A5B' },
  { key: 'emerald', hex: '#2E8B57' },
  { key: 'olive', hex: '#808000' },
  { key: 'dusty-pink', hex: '#DCAE96' },
  { key: 'fuchsia', hex: '#E75480' },
  { key: 'coral', hex: '#FF7F50' },
  { key: 'red', hex: '#B22222' },
  { key: 'burgundy', hex: '#800020' },
  { key: 'champagne', hex: '#F7E7CE' },
  { key: 'ivory', hex: '#FFFFF0' },
  { key: 'gold', hex: '#D4AF37' },
  { key: 'yellow', hex: '#FFD700' },
  { key: 'orange', hex: '#FF8C00' },
  { key: 'terracotta', hex: '#B57850' },
  { key: 'brown', hex: '#8B4513' },
  { key: 'grey', hex: '#808080' },
  { key: 'navy', hex: '#1F2A44' },
  { key: 'royal-blue', hex: '#4169E1' },
  { key: 'sky-blue', hex: '#87CEEB' },
  { key: 'teal', hex: '#008080' },
  { key: 'turquoise', hex: '#40E0D0' },
  { key: 'purple', hex: '#6A0DAD' },
  { key: 'lilac', hex: '#C8A2C8' },
  { key: 'black', hex: '#1F2A1A' },
];

/** Which look each named colour wears. Every NAMED_COLOURS entry has a row. */
export const LOOK_BY_NAME: Readonly<Record<string, string>> = {
  'Sage green': 'sage-green',
  'Forest green': 'emerald',
  Emerald: 'emerald',
  Mint: 'sage-green',
  Olive: 'olive',
  'Dusty rose': 'dusty-pink',
  'Blush pink': 'dusty-pink',
  Pink: 'fuchsia',
  Coral: 'coral',
  Red: 'red',
  Burgundy: 'burgundy',
  Maroon: 'burgundy',
  Champagne: 'champagne',
  Cream: 'ivory',
  Beige: 'champagne',
  Gold: 'gold',
  'Antique gold': 'gold',
  Yellow: 'yellow',
  Orange: 'orange',
  Terracotta: 'terracotta',
  Brown: 'brown',
  Silver: 'grey',
  Grey: 'grey',
  Navy: 'navy',
  'Royal blue': 'royal-blue',
  'Sky blue': 'sky-blue',
  'Dusty blue': 'sky-blue',
  Teal: 'teal',
  Turquoise: 'turquoise',
  Purple: 'purple',
  Lilac: 'lilac',
  Lavender: 'lilac',
  White: 'ivory',
  Ivory: 'ivory',
  Black: 'black',
};

function rgb(c: string): [number, number, number] {
  const h = hex(c).slice(1);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Weighted RGB distance, the same weights colourName uses. */
function dist(a: string, b: string): number {
  const [r, g, bl] = rgb(a);
  const [nr, ng, nb] = rgb(b);
  return 2 * (r - nr) ** 2 + 4 * (g - ng) ** 2 + 3 * (bl - nb) ** 2;
}

/** The library look for a colour: by its name first, else the nearest photograph. */
export function libraryLook(colour: string): LibraryLook {
  let named = NAMED_COLOURS[0];
  let best = Infinity;
  for (const n of NAMED_COLOURS) {
    const d = dist(colour, n.hex);
    if (d < best) {
      best = d;
      named = n;
    }
  }
  const key = named !== undefined ? LOOK_BY_NAME[named.en] : undefined;
  const byName = key !== undefined ? ATTIRE_LIBRARY.find((l) => l.key === key) : undefined;
  if (byName !== undefined) return byName;
  let look = ATTIRE_LIBRARY[0] as LibraryLook;
  best = Infinity;
  for (const l of ATTIRE_LIBRARY) {
    const d = dist(colour, l.hex);
    if (d < best) {
      best = d;
      look = l;
    }
  }
  return look;
}

/** The public path of a look's photograph. */
export function libraryImage(look: LibraryLook): string {
  return `/attire/${look.key}.webp`;
}
