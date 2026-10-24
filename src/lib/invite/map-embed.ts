import { exactMapUrl, type Lang, type Venue } from './wcz';

/**
 * The small interactive map on each venue card: Google's keyless embed
 * (https://www.google.com/maps?q=...&output=embed), pointed at the best
 * place we know, in this order:
 *
 * 1. `mapQuery`, which the API read from the couple's Google Maps link when
 *    the design was saved (it follows a maps.app.goo.gl link once, which a
 *    browser cannot do: Google's short links send no CORS headers);
 * 2. the pin or place read here from a full google.com/maps link;
 * 3. the venue's name and address.
 *
 * mapQueryFromLink is a copy of shared-types utils/map-link.ts (this site
 * does not install that package); keep the two in step.
 */

/** The place a full Google Maps link points at, or null (always null for a short link). */
export function mapQueryFromLink(link: string): string | null {
  if (exactMapUrl({ map: link }) === null) return null;
  const u = new URL(link.trim());
  const host = u.hostname.toLowerCase();
  if (host === 'maps.app.goo.gl' || host === 'goo.gl') return null;

  const pin = /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/.exec(decodeURIComponent(u.pathname + u.search));
  const fromPin = pin !== null ? coords(pin[1], pin[2]) : null;
  if (fromPin !== null) return fromPin;

  for (const key of ['q', 'query', 'll', 'destination', 'daddr']) {
    const v = u.searchParams.get(key)?.trim() ?? '';
    if (v === '') continue;
    const ll = /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/.exec(v);
    if (ll !== null) {
      const c = coords(ll[1], ll[2]);
      if (c !== null) return c;
      continue;
    }
    return clean(v);
  }

  const place = /\/maps\/(?:place|search)\/([^/@]+)/.exec(u.pathname);
  if (place?.[1] !== undefined) {
    const name = clean(decodeURIComponent(place[1].replace(/\+/g, ' ')));
    if (name !== '') return name;
  }

  const at = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/.exec(u.pathname);
  return at !== null ? coords(at[1], at[2]) : null;
}

/** What the venue's embedded map asks Google for, or null when we know nothing to show. */
export function venueMapQuery(v: Pick<Venue, 'name' | 'addr' | 'map' | 'mapQuery'>): string | null {
  const stored = (v.mapQuery ?? '').trim();
  if (stored !== '') return clean(stored);
  const fromLink = mapQueryFromLink(v.map ?? '');
  if (fromLink !== null) return fromLink;
  const place = [v.name, v.addr].map((x) => (x ?? '').trim()).filter((x) => x !== '').join(', ');
  return place !== '' ? clean(place) : null;
}

/** Google's keyless embed for a query, in the page's language. Coordinates get a street-level zoom. */
export function mapEmbedUrl(query: string, lang: Lang): string {
  const isCoords = /^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/.test(query);
  const params = new URLSearchParams({ q: query, hl: lang, z: isCoords ? '16' : '15', output: 'embed' });
  return `https://www.google.com/maps?${params.toString()}`;
}

function coords(lat: string | undefined, lng: string | undefined): string | null {
  const a = Number(lat);
  const b = Number(lng);
  if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(a) > 90 || Math.abs(b) > 180) return null;
  if (a === 0 && b === 0) return null;
  return `${Math.round(a * 1e6) / 1e6},${Math.round(b * 1e6) / 1e6}`;
}

function clean(s: string): string {
  return s.replace(/\s+/g, ' ').trim().slice(0, 200);
}
