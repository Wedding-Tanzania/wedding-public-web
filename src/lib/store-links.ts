/**
 * Store links for the Wedding by Lockwood app and the pure helpers behind
 * https://wedding.co.tz/app. Framework free so it can be unit tested.
 *
 * NEXT_PUBLIC_APP_STORE_URL overrides the App Store link. The fallback is the
 * App Store Connect id of the app; the listing resolves once it is public.
 * NEXT_PUBLIC_PLAY_STORE_URL is unset until the Google Play listing exists,
 * so PLAY_STORE_URL is null and the page shows the "coming soon" badge.
 */
export const APP_STORE_URL: string =
  process.env.NEXT_PUBLIC_APP_STORE_URL?.trim() || 'https://apps.apple.com/app/id6822616728';

export const PLAY_STORE_URL: string | null = process.env.NEXT_PUBLIC_PLAY_STORE_URL?.trim() || null;

export type StorePlatform = 'ios' | 'android' | 'other';

export interface StoreLinks {
  appStore: string | null;
  playStore: string | null;
}

/**
 * Detects the phone platform from a user agent string.
 * iPadOS 13+ Safari reports itself as a Macintosh, so a Mac user agent with
 * touch points counts as iOS when maxTouchPoints is passed.
 */
export function detectPlatform(userAgent: string, maxTouchPoints?: number): StorePlatform {
  const ua = userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Macintosh/i.test(ua) && typeof maxTouchPoints === 'number' && maxTouchPoints > 1) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'other';
}

/**
 * The store URL to send this device to, or null to stay on the page.
 */
export function storeRedirect(userAgent: string, links: StoreLinks, maxTouchPoints?: number): string | null {
  const platform = detectPlatform(userAgent, maxTouchPoints);
  if (platform === 'ios') return links.appStore || null;
  if (platform === 'android') return links.playStore || null;
  return null;
}

/**
 * Keeps the "open in browser" link on this site: only a relative path that
 * starts with a single slash is accepted, anything else falls back to home.
 */
export function openInBrowserHref(next: string | undefined): string {
  if (typeof next !== 'string') return '/';
  const value = next.trim();
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  if (/^\/[\\]/.test(value)) return '/';
  if (/[\r\n]/.test(value)) return '/';
  return value;
}
