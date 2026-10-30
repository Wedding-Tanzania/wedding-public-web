import { shrinkImage } from './image-shrink';

/**
 * The photo step after a wish is sent: the contract in
 * PLAN-wish-wall-2026-10-30.md ("API (wedding-api)" and "Public web").
 *
 * POST /story/:slug/guestbook answers { entry, editToken }. The token is the
 * only proof the guest wrote the wish, so it lives in component state and in
 * sessionStorage keyed by the entry id (a reload mid-upload keeps it; closing
 * the tab forgets it). It is never put in a URL or sent anywhere but the
 * photo route.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';

/** Most photos one wish may carry (the API's cap, repeated here for the UI). */
export const MAX_WISH_PHOTOS = 3;
/** Longest caption, in characters. */
export const WISH_CAPTION_MAX = 140;

export interface GuestbookPhoto {
  id: string;
  url: string;
  caption?: string;
  via?: 'web' | 'whatsapp';
  createdAt?: string;
}

export interface SentWish {
  entryId: string;
  editToken: string;
  photos: GuestbookPhoto[];
}

export type PhotoUploadFailure =
  /** 403 WISH_TOKEN_INVALID: the wish can no longer be changed from here. */
  | 'token'
  /** 409 WISH_PHOTOS_FULL: three photos already. */
  | 'full'
  /** 413, or 400 VALIDATION_ERROR: too large, or not a jpeg/png/webp. */
  | 'bad_photo'
  /** The wish is gone (404). */
  | 'gone'
  /** fetch threw: offline, or the connection dropped. */
  | 'network'
  /** Anything else (a 5xx, an unexpected body). */
  | 'other';

export type PhotoUploadResult =
  | { ok: true; photos: GuestbookPhoto[] }
  | { ok: false; reason: PhotoUploadFailure };

/** Which failure a response status stands for. */
export function failureFor(status: number): PhotoUploadFailure {
  if (status === 403) return 'token';
  if (status === 409) return 'full';
  if (status === 413 || status === 400) return 'bad_photo';
  if (status === 404) return 'gone';
  return 'other';
}

interface UploadInput {
  slug: string;
  entryId: string;
  editToken: string;
  file: File;
  caption: string;
  /** For tests; defaults to the browser's fetch. */
  fetchImpl?: typeof fetch;
}

/**
 * Shrinks the photo, then POSTs it as multipart to
 * /story/:slug/guestbook/:entryId/photos with fields photo, caption and
 * editToken. The API answers { entry } carrying the new photo list.
 */
export async function uploadWishPhoto(input: UploadInput): Promise<PhotoUploadResult> {
  const doFetch = input.fetchImpl ?? fetch;
  const shrunk = await shrinkImage(input.file);
  const body = new FormData();
  body.append('photo', shrunk.blob, shrunk.name);
  const caption = input.caption.trim().slice(0, WISH_CAPTION_MAX);
  if (caption !== '') body.append('caption', caption);
  body.append('editToken', input.editToken);
  let res: Response;
  try {
    res = await doFetch(
      `${API_BASE}/story/${encodeURIComponent(input.slug)}/guestbook/${encodeURIComponent(input.entryId)}/photos`,
      { method: 'POST', body, headers: { 'x-wish-token': input.editToken } },
    );
  } catch {
    return { ok: false, reason: 'network' };
  }
  if (!res.ok) return { ok: false, reason: failureFor(res.status) };
  try {
    const data = (await res.json()) as { entry?: { photos?: GuestbookPhoto[] } };
    return { ok: true, photos: data.entry?.photos ?? [] };
  } catch {
    return { ok: false, reason: 'other' };
  }
}

/* sessionStorage: the guest's last wish on this page, so a reload during the
 * photo step lands back on it with its token and the photos so far. */

const WISH_KEY = (entryId: string) => `wedding.wish.${entryId}`;
const LAST_KEY = (slug: string) => `wedding.wish.last.${slug}`;

export function rememberSentWish(slug: string, wish: SentWish): void {
  try {
    sessionStorage.setItem(WISH_KEY(wish.entryId), JSON.stringify({ editToken: wish.editToken, photos: wish.photos }));
    sessionStorage.setItem(LAST_KEY(slug), wish.entryId);
  } catch {
    // Storage can be off in a private window; the step still works for this load.
  }
}

export function recallSentWish(slug: string): SentWish | null {
  try {
    const entryId = sessionStorage.getItem(LAST_KEY(slug));
    if (entryId === null) return null;
    const raw = sessionStorage.getItem(WISH_KEY(entryId));
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as { editToken?: unknown; photos?: unknown };
    if (typeof parsed.editToken !== 'string') return null;
    const photos = Array.isArray(parsed.photos) ? (parsed.photos as GuestbookPhoto[]) : [];
    return { entryId, editToken: parsed.editToken, photos };
  } catch {
    return null;
  }
}

/** Called on Done: the token is no longer needed on this device. */
export function forgetSentWish(slug: string, entryId: string): void {
  try {
    sessionStorage.removeItem(WISH_KEY(entryId));
    if (sessionStorage.getItem(LAST_KEY(slug)) === entryId) sessionStorage.removeItem(LAST_KEY(slug));
  } catch {
    // ignore
  }
}
