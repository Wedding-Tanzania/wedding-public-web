import { API_TIMEOUT_MS, apiBase, linkProblemPage } from './short-links';

/**
 * wedding.co.tz/g/<code>: a couple's own link (the photographer's gallery, a
 * live stream), made on the couple app's Links page. Opened through the API
 * (POST /tracked-links/:code/open), which answers where it goes and records
 * the open after answering, so counting never slows the redirect.
 *
 * The guest's browser is forwarded (X-Guest-User-Agent) so the API can tell
 * WhatsApp's link preview from a guest; the preview is still redirected, or
 * WhatsApp could not draw the gallery's own preview. To count people rather
 * than taps on the shared code without an IP address, the site keeps a
 * random id in a cookie of its own, on /g only, and forwards it
 * (X-Visitor-Id). A guest's own code already names the guest.
 */

/** Same alphabet as the API mints from: no 0/O, 1/l/I. */
const TRACKED_CODE = /^[2-9a-km-zA-HJ-NP-Z]{6}$/;
const VISITOR_ID = /^[A-Za-z0-9_-]{8,64}$/;

export const VISITOR_COOKIE = 'wl_v';
/** About 400 days, the longest a browser keeps a cookie, and as long as the API keeps opens. */
const VISITOR_MAX_AGE = 400 * 24 * 3600;

export function isTrackedCode(code: string): boolean {
  return TRACKED_CODE.test(code);
}

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

/** Only a web page the guest's phone can open; never javascript:, data: or credentials in the address. */
function isWebTarget(target: unknown): target is string {
  if (typeof target !== 'string') return false;
  let u: URL;
  try {
    u = new URL(target);
  } catch {
    return false;
  }
  return (u.protocol === 'https:' || u.protocol === 'http:') && u.username === '' && u.password === '';
}

type Fetch = typeof fetch;

export async function trackedLinkRedirect(
  code: string,
  guest: { userAgent?: string; cookie?: string },
  base: string = apiBase(),
  fetchImpl: Fetch = fetch,
  newVisitorId: () => string = () => crypto.randomUUID(),
): Promise<Response> {
  if (!isTrackedCode(code)) return linkProblemPage('missing', 'link');
  const known = visitorFrom(guest.cookie);
  const visitor = known ?? newVisitorId();
  let res: Response;
  try {
    res = await fetchImpl(`${base}/tracked-links/${encodeURIComponent(code)}/open`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        ...(guest.userAgent ? { 'X-Guest-User-Agent': guest.userAgent.slice(0, 512) } : {}),
        'X-Visitor-Id': visitor,
      },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
  } catch {
    return linkProblemPage('unavailable', 'link');
  }
  if (res.status === 404) return linkProblemPage('missing', 'link');
  if (!res.ok) return linkProblemPage('unavailable', 'link');
  const body = (await res.json().catch(() => null)) as { target?: unknown } | null;
  if (!isWebTarget(body?.target)) return linkProblemPage('missing', 'link');
  const headers = new Headers({ Location: body.target, 'Cache-Control': 'no-store' });
  if (known === null) {
    headers.set('Set-Cookie', `${VISITOR_COOKIE}=${visitor}; Path=/g; Max-Age=${VISITOR_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`);
  }
  return new Response(null, { status: 302, headers });
}
