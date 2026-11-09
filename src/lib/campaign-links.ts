import { API_TIMEOUT_MS, apiBase } from './short-links';
import { isCampaignSlug } from './site-events';
import { detectPlatform, playUrlFor } from './store-links';
import { VISITOR_COOKIE } from './tracked-links';

/**
 * wedding.co.tz/app/<slug>: a campaign link made in the admin console for a
 * social post, a poster or a partner. The open is counted by the API
 * (POST /campaign-links/:slug/open), then Android phones go straight to
 * Google Play (counted as a Play tap, with the campaign as the Play install
 * referrer) and everyone else lands on /app?via=<slug>, which credits its
 * page view and badge taps to the campaign.
 *
 * People are counted with the site's random visitor cookie, here scoped to
 * /app the way the guests' links scope it to /g. An unknown or removed link
 * still lands on /app, uncredited, so an old post never dead-ends.
 */

const VISITOR_ID = /^[A-Za-z0-9_-]{8,64}$/;
const VISITOR_MAX_AGE = 400 * 24 * 3600;

type Fetch = typeof fetch;

function visitorFrom(cookieHeader: string | undefined): string | null {
  for (const part of (cookieHeader ?? '').split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === VISITOR_COOKIE) {
      const value = rest.join('=');
      return VISITOR_ID.test(value) ? value : null;
    }
  }
  return null;
}

function redirect(location: string, cookie?: string): Response {
  const headers = new Headers({ Location: location, 'Cache-Control': 'no-store' });
  if (cookie !== undefined) headers.set('Set-Cookie', cookie);
  return new Response(null, { status: 302, headers });
}

export async function campaignLinkRedirect(
  rawSlug: string,
  visitorReq: { userAgent?: string; cookie?: string },
  playStore: string | null,
  base: string = apiBase(),
  fetchImpl: Fetch = fetch,
  newVisitorId: () => string = () => crypto.randomUUID(),
): Promise<Response> {
  const slug = rawSlug.toLowerCase();
  if (!isCampaignSlug(slug)) return redirect('/app');

  const known = visitorFrom(visitorReq.cookie);
  const visitor = known ?? newVisitorId();
  const cookie =
    known === null
      ? `${VISITOR_COOKIE}=${visitor}; Path=/app; Max-Age=${VISITOR_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`
      : undefined;
  const ua = (visitorReq.userAgent ?? '').slice(0, 512);
  const uaHeader: Record<string, string> = ua ? { 'X-Guest-User-Agent': ua } : {};

  let res: Response | null = null;
  try {
    res = await fetchImpl(`${base}/campaign-links/${encodeURIComponent(slug)}/open`, {
      method: 'POST',
      cache: 'no-store',
      headers: { ...uaHeader, 'X-Visitor-Id': visitor },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
  } catch {
    res = null;
  }
  // A link that never existed or was removed: the download page, uncredited.
  if (res !== null && res.status === 404) return redirect('/app', cookie);

  if (playStore !== null && detectPlatform(ua) === 'android') {
    void fetchImpl(`${base}/site-events`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'content-type': 'application/json', ...uaHeader },
      body: JSON.stringify({ kind: 'store_click', path: `/app/${slug}`, store: 'play', via: slug }),
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    }).catch(() => undefined);
    return redirect(playUrlFor(playStore, slug), cookie);
  }
  return redirect(`/app?via=${encodeURIComponent(slug)}`, cookie);
}
