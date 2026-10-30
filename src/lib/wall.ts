import type { GuestbookPhoto } from './wish-photos';

/**
 * The live wall: GET /story/:slug/wall (PLAN-wish-wall-2026-10-30.md). The
 * screen polls it every 8 seconds; these helpers decide what the screen shows
 * from the list it gets back, and are pure so they can be tested.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';

export type WallLang = 'sw' | 'en';

export interface WishWallItem {
  id: string;
  name: string;
  message: string;
  photos: GuestbookPhoto[];
  createdAt: string;
}

export interface WishWallResponse {
  slug: string;
  couple: { partnerA: string; partnerB: string; weddingDate?: string } | null;
  hashtag: string | null;
  /** https://wedding.co.tz/<slug>/wishes */
  wishesUrl: string;
  /** Visible, newest first, at most 100. */
  items: WishWallItem[];
  /** Visible wishes in all. */
  total: number;
  serverTime: string;
}

/** How often the screen asks the API, in ms. */
export const WALL_POLL_MS = 8000;
/** How long one spotlight item stays, in ms. */
export const SPOTLIGHT_MS = 7000;
/** How many cards the grid shows at once. */
export const GRID_MAX = 12;
/** How often the grid lets the next older card in, when there are more than it shows. */
export const GRID_CYCLE_MS = 15000;

export async function fetchWall(slug: string, fetchImpl: typeof fetch = fetch): Promise<WishWallResponse> {
  const res = await fetchImpl(`${API_BASE}/story/${encodeURIComponent(slug)}/wall`, {
    cache: 'no-store',
    headers: { accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`wall ${res.status}`);
  return (await res.json()) as WishWallResponse;
}

function time(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** Newest first, whatever order the API sent (it promises newest first; this makes sure). */
export function newestFirst(items: WishWallItem[]): WishWallItem[] {
  return [...items].sort((a, b) => time(b.createdAt) - time(a.createdAt));
}

export function hasPhoto(item: WishWallItem): boolean {
  return Array.isArray(item.photos) && item.photos.some((p) => typeof p.url === 'string' && p.url !== '');
}

export interface WallSplit {
  /**
   * Every wish, for the spotlight: photo wishes and word-only wishes taking
   * turns (newest first in each), so the big panel is never empty while there
   * are wishes, and photos still come round often.
   */
  spotlight: WishWallItem[];
  /** Every item, newest first: the grid window is cut from this. */
  all: WishWallItem[];
}

/**
 * Photo wishes and word-only wishes taking turns, each newest first, starting
 * with a photo; whichever runs out first, the rest follow in order.
 */
export function spotlightOrder(all: WishWallItem[]): WishWallItem[] {
  const photos = all.filter(hasPhoto);
  const words = all.filter((i) => !hasPhoto(i));
  const out: WishWallItem[] = [];
  for (let i = 0; i < Math.max(photos.length, words.length); i += 1) {
    const p = photos[i];
    const w = words[i];
    if (p !== undefined) out.push(p);
    if (w !== undefined) out.push(w);
  }
  return out;
}

/**
 * Orders the items for the spotlight and the grid. The grid lists every item
 * too, so a short wall still fills both sides.
 */
export function splitWall(items: WishWallItem[]): WallSplit {
  const all = newestFirst(items);
  return { spotlight: spotlightOrder(all), all };
}

/**
 * The two scrolling columns beside the spotlight: wishes dealt left, right,
 * left, right, newest first, so both columns move and the newest sit at the
 * top of each.
 */
export function splitColumns(all: WishWallItem[]): [WishWallItem[], WishWallItem[]] {
  const a: WishWallItem[] = [];
  const b: WishWallItem[] = [];
  all.forEach((item, i) => (i % 2 === 0 ? a : b).push(item));
  return [a, b];
}

/** Seconds for one full pass of a column: slow enough to read, never shorter than 20 s. */
export function columnSeconds(count: number, perCard = 7): number {
  return Math.max(20, count * perCard);
}

/** The spotlight quote's size class by length, so a long wish still fits the panel. */
export function wordsSize(message: string): 'xl' | 'lg' | 'md' | 'sm' {
  const n = message.trim().length;
  if (n <= 60) return 'xl';
  if (n <= 140) return 'lg';
  if (n <= 280) return 'md';
  return 'sm';
}

/**
 * The `max` cards on show, starting `offset` cards into the list and wrapping,
 * so a long night's wishes all get their turn. With `max` or fewer items the
 * offset is ignored and every item shows.
 */
export function gridWindow<T>(all: T[], offset: number, max: number = GRID_MAX): T[] {
  if (all.length <= max) return all;
  const start = ((offset % all.length) + all.length) % all.length;
  const out: T[] = [];
  for (let i = 0; i < max; i += 1) out.push(all[(start + i) % all.length]);
  return out;
}

/** The ids in `next` that were not in `prev`: the cards that animate in. */
export function freshIds(prev: WishWallItem[], next: WishWallItem[]): Set<string> {
  const seen = new Set(prev.map((i) => i.id));
  return new Set(next.filter((i) => !seen.has(i.id)).map((i) => i.id));
}

/** The index the spotlight should sit on after a refresh, kept in range. */
export function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

const MONTHS: Record<WallLang, string[]> = {
  sw: ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

/**
 * "31 Oktoba 2026" / "31 October 2026", in Dar es Salaam time, the same on the
 * server and in the browser (toLocaleDateString differs by runtime and would
 * mismatch on hydration).
 */
export function wallDate(iso: string | undefined | null, lang: WallLang): string {
  if (iso === undefined || iso === null || iso === '') return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  // Dar es Salaam is UTC+3 all year.
  const local = new Date(d.getTime() + 3 * 60 * 60 * 1000);
  return `${local.getUTCDate()} ${MONTHS[lang][local.getUTCMonth()]} ${local.getUTCFullYear()}`;
}

/** The wishes URL as a guest would type it: no scheme, no www, no trailing slash. */
export function shortUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
}

/** "Andrew & Franciana" from the API couple, or a Swahili fallback. */
export function coupleLabel(couple: WishWallResponse['couple'], lang: WallLang): string {
  if (couple === null) return lang === 'sw' ? 'Maharusi' : 'The couple';
  const first = (s: string) => s.trim().split(/\s+/)[0] ?? s;
  return `${first(couple.partnerA)} & ${first(couple.partnerB)}`;
}

/** "#AndrewNaFranciana2026" with exactly one hash, or '' when there is none. */
export function hashtagLabel(tag: string | null): string {
  if (tag === null) return '';
  const t = tag.trim().replace(/^#+/, '');
  return t === '' ? '' : `#${t}`;
}

/** A short cut of the message for a grid card, whole words, with an ellipsis. */
export function shortMessage(message: string, max: number = 140): string {
  const m = message.trim().replace(/\s+/g, ' ');
  if (m.length <= max) return m;
  const cut = m.slice(0, max);
  const at = cut.lastIndexOf(' ');
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).trimEnd()}…`;
}
