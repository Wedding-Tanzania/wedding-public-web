/**
 * The public site's own counts, sent to the API (POST /site-events) through
 * /api/site-event: a marketing page viewed, and a tap on a store badge (or
 * the automatic redirect to the store). No cookie and no IP address; the API
 * keeps only the kind of device, and robots are never counted.
 *
 * `via` is the campaign link a visitor arrived through (wedding.co.tz/app/
 * <slug> lands on /app?via=<slug>), so the admin console can see which post
 * or poster brought them. Framework free so it can be unit tested.
 */

export type SiteEventKind = 'page_view' | 'store_click';
export type Store = 'play' | 'appstore';

export interface SiteEvent {
  kind: SiteEventKind;
  path: string;
  store?: Store;
  via?: string;
}

/** Same rule as the API: 2 to 32 lowercase letters, digits or hyphens. */
export const CAMPAIGN_SLUG = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])$/;

export function isCampaignSlug(value: unknown): value is string {
  return typeof value === 'string' && CAMPAIGN_SLUG.test(value);
}

/**
 * Marketing pages only. A couple's wedding page, a guest's RSVP or card and
 * the short links are the couples' traffic, not the site's, and are left out.
 */
const COUNTED_EXACT = new Set([
  '/',
  '/features',
  '/app',
  '/vendors',
  '/vendors/join',
  '/pricing',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/delete-account',
  '/security',
  '/press',
  '/testimonials',
]);

export function isCountedPath(path: string): boolean {
  if (COUNTED_EXACT.has(path)) return true;
  return /^\/vendors\/[a-z0-9-]+$/.test(path);
}

/** The event to send, or null when there is nothing valid to count. */
export function siteEventFrom(input: unknown): SiteEvent | null {
  if (typeof input !== 'object' || input === null) return null;
  const o = input as Record<string, unknown>;
  if (o.kind !== 'page_view' && o.kind !== 'store_click') return null;
  if (typeof o.path !== 'string' || !o.path.startsWith('/') || o.path.length > 200) return null;
  const event: SiteEvent = { kind: o.kind, path: o.path };
  if (o.kind === 'store_click') {
    if (o.store !== 'play' && o.store !== 'appstore') return null;
    event.store = o.store;
  } else if (!isCountedPath(o.path)) {
    return null;
  }
  if (isCampaignSlug(o.via)) event.via = o.via;
  return event;
}

/** The `via` in a query string, when it names a campaign link. */
export function viaFrom(search: string): string | undefined {
  const via = new URLSearchParams(search).get('via');
  return isCampaignSlug(via) ? via : undefined;
}

/**
 * Sends one event from the browser without holding up a navigation: a
 * beacon survives the page being left for the store.
 */
export function sendSiteEvent(event: SiteEvent): void {
  if (typeof window === 'undefined') return;
  const body = JSON.stringify(event);
  try {
    if (navigator.sendBeacon?.('/api/site-event', new Blob([body], { type: 'application/json' }))) return;
  } catch {
    // fall through to fetch
  }
  void fetch('/api/site-event', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
