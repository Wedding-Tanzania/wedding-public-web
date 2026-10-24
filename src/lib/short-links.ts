/**
 * The short links in guest messages: wedding.co.tz/i/<code> opens the
 * guest's card, wedding.co.tz/k/<code> hands their phone the calendar file.
 * The code is resolved to the RSVP token by the API (GET /links/:code); the
 * long /rsvp/<token> links keep working beside them.
 */

/** Same alphabet as the API mints from: no 0/O, 1/l/I. */
const SHORT_CODE = /^[2-9a-km-zA-HJ-NP-Z]{8}$/;

export function isShortCode(code: string): boolean {
  return SHORT_CODE.test(code);
}

export function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1').replace(/\/$/, '');
}

type Fetch = typeof fetch;

/**
 * The token behind a code. `missing` for a code the API does not know (or an
 * API from before short links, which answers 404 too); `unavailable` when the
 * API could not be asked, so the page can say "try again" rather than "no
 * such link".
 */
export async function resolveShortCode(
  code: string,
  base: string = apiBase(),
  fetchImpl: Fetch = fetch,
): Promise<{ token: string } | 'missing' | 'unavailable'> {
  if (!isShortCode(code)) return 'missing';
  let res: Response;
  try {
    res = await fetchImpl(`${base}/links/${encodeURIComponent(code)}`, { cache: 'no-store' });
  } catch {
    return 'unavailable';
  }
  if (res.status === 404) return 'missing';
  if (!res.ok) return 'unavailable';
  const body = (await res.json().catch(() => null)) as { token?: unknown } | null;
  return typeof body?.token === 'string' && body.token !== '' ? { token: body.token } : 'unavailable';
}

/** A small branded page for a link that does not open, in Kiswahili and English. */
export function linkProblemPage(kind: 'missing' | 'unavailable'): Response {
  const [sw, en] =
    kind === 'missing'
      ? ['Kiungo hiki hakipatikani. Huenda kimeandikwa vibaya au kadi imefutwa.', 'This link does not open. It may be mistyped, or the card was removed.']
      : ['Tumeshindwa kufungua kiungo hiki sasa hivi. Tafadhali jaribu tena baada ya muda mfupi.', 'We could not open this link just now. Please try again in a moment.'];
  const html = `<!doctype html><html lang="sw"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Wedding.co.tz</title><meta name="robots" content="noindex"></head><body style="margin:0;background:#F1EADB;color:#1F2A1A;font-family:Manrope,system-ui,sans-serif"><main style="max-width:28rem;margin:0 auto;padding:4rem 1rem"><p style="font-weight:700;color:#4F6A42;letter-spacing:.08em;font-size:.75rem">WEDDING.CO.TZ</p><p style="font-size:1.125rem;line-height:1.5">${sw}</p><p style="color:#4A5840;line-height:1.5">${en}</p><p><a href="/" style="color:#4F6A42;font-weight:600">wedding.co.tz</a></p></main></body></html>`;
  return new Response(html, {
    status: kind === 'missing' ? 404 : 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

/** /i/<code>: 302 to the guest's card page. */
export async function cardRedirect(
  requestUrl: string,
  code: string,
  base: string = apiBase(),
  fetchImpl: Fetch = fetch,
): Promise<Response> {
  const r = await resolveShortCode(code, base, fetchImpl);
  if (r === 'missing' || r === 'unavailable') return linkProblemPage(r);
  return new Response(null, {
    status: 302,
    headers: { Location: new URL(`/rsvp/${encodeURIComponent(r.token)}`, requestUrl).toString(), 'Cache-Control': 'no-store' },
  });
}

/**
 * /k/<code>: the calendar file itself, served from wedding.co.tz with
 * text/calendar so the phone offers to add the day. Proxied rather than
 * redirected, so the API's address never shows; if the file cannot be
 * fetched, a 302 to the API's copy still gets the guest their calendar.
 */
export async function calendarResponse(code: string, base: string = apiBase(), fetchImpl: Fetch = fetch): Promise<Response> {
  const r = await resolveShortCode(code, base, fetchImpl);
  if (r === 'missing' || r === 'unavailable') return linkProblemPage(r);
  const direct = `${base}/rsvp/${encodeURIComponent(r.token)}/calendar.ics`;
  try {
    const res = await fetchImpl(direct, { cache: 'no-store' });
    if (res.status === 404) return linkProblemPage('missing');
    if (res.ok) {
      return new Response(await res.text(), {
        status: 200,
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': 'attachment; filename="wedding.ics"',
          'Cache-Control': 'private, no-store',
        },
      });
    }
  } catch {
    // Fall through to the redirect.
  }
  return new Response(null, { status: 302, headers: { Location: direct, 'Cache-Control': 'no-store' } });
}
