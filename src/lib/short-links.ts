/**
 * The short links in guest messages: wedding.co.tz/i/<code> opens the
 * guest's card, wedding.co.tz/k/<code> offers the ways to add the day to their
 * calendar (the file itself is /k/<code>/wedding.ics).
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
 * /k/<code>/wedding.ics: the calendar file itself, served from wedding.co.tz
 * with text/calendar. Proxied rather than redirected, so the API's address
 * never shows; if the file cannot be fetched, a 302 to the API's copy still
 * gets the guest their calendar.
 */
export async function calendarResponse(code: string, base: string = apiBase(), fetchImpl: Fetch = fetch): Promise<Response> {
  const r = await resolveShortCode(code, base, fetchImpl);
  if (r === 'missing' || r === 'unavailable') return linkProblemPage(r);
  const direct = `${base}/rsvp/${encodeURIComponent(r.token)}/calendar.ics`;
  const file = await fetchCalendar(direct, fetchImpl);
  if (file === 'missing') return linkProblemPage('missing');
  if (file !== 'unavailable') {
    return new Response(file.text, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="wedding.ics"',
        'Cache-Control': 'private, no-store',
      },
    });
  }
  return new Response(null, { status: 302, headers: { Location: direct, 'Cache-Control': 'no-store' } });
}

async function fetchCalendar(url: string, fetchImpl: Fetch): Promise<{ text: string } | 'missing' | 'unavailable'> {
  try {
    const res = await fetchImpl(url, { cache: 'no-store' });
    if (res.status === 404) return 'missing';
    if (res.ok) return { text: await res.text() };
  } catch {
    // Unavailable.
  }
  return 'unavailable';
}

/** The parts of the guest's event the add-to-calendar page needs. */
export type CalendarEvent = {
  title: string;
  description: string;
  location: string;
  /** Google Calendar's `dates` value: `start/end`, all-day or timed. */
  googleDates: string;
  /** Set when the times are local to a named zone rather than UTC. */
  timeZone: string | null;
  /** For the page: the day, as written in the file (YYYYMMDD...). */
  start: string;
};

/**
 * The first VEVENT of an iCalendar file, enough to build a Google Calendar
 * link. Undoes line folding and text escaping (RFC 5545 3.1, 3.3.11). Null
 * when there is no event with a start.
 */
export function parseCalendarEvent(ics: string): CalendarEvent | null {
  const lines = ics.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '').split(/\r?\n/);
  const fields = new Map<string, { params: string; value: string }>();
  let inEvent = false;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { inEvent = true; continue; }
    if (line === 'END:VEVENT') break;
    if (!inEvent || line.startsWith('BEGIN:') || line.startsWith('END:')) {
      if (line === 'BEGIN:VALARM') inEvent = false;
      continue;
    }
    const colon = line.indexOf(':');
    if (colon < 0) continue;
    const [name, ...params] = line.slice(0, colon).split(';');
    if (!fields.has(name.toUpperCase())) fields.set(name.toUpperCase(), { params: params.join(';'), value: line.slice(colon + 1) });
  }
  const start = fields.get('DTSTART');
  if (!start) return null;
  const end = fields.get('DTEND');
  const text = (key: string) =>
    (fields.get(key)?.value ?? '').replace(/\\n/gi, '\n').replace(/\\([,;\\])/g, '$1');
  const allDay = /VALUE=DATE(?!-)/i.test(start.params) || /^\d{8}$/.test(start.value);
  const tz = /TZID=([^;:]+)/i.exec(start.params)?.[1] ?? null;
  let endValue = end?.value ?? start.value;
  if (allDay && endValue === start.value) endValue = nextDay(start.value);
  return {
    title: text('SUMMARY'),
    description: text('DESCRIPTION'),
    location: text('LOCATION'),
    googleDates: `${start.value}/${endValue}`,
    timeZone: allDay || start.value.endsWith('Z') ? null : tz,
    start: start.value,
  };
}

function nextDay(yyyymmdd: string): string {
  const d = new Date(Date.UTC(+yyyymmdd.slice(0, 4), +yyyymmdd.slice(4, 6) - 1, +yyyymmdd.slice(6, 8) + 1));
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

/** A Google Calendar "add event" link for [e]. */
export function googleCalendarUrl(e: CalendarEvent): string {
  const q = new URLSearchParams({ action: 'TEMPLATE', text: e.title, dates: e.googleDates });
  if (e.description) q.set('details', e.description);
  if (e.location) q.set('location', e.location);
  if (e.timeZone) q.set('ctz', e.timeZone);
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * /k/<code>: a small page with the ways to add the day, rather than the bare
 * file. WhatsApp and other in-app browsers show a calendar file as text
 * instead of offering to add it, so the page links to:
 * - the iPhone Calendar app, through webcal://, which in-app browsers hand
 *   to iOS;
 * - Google Calendar, with the event filled in;
 * - the file itself (/k/<code>/wedding.ics), which Safari and Android open
 *   with their calendar.
 */
export async function calendarPage(
  requestUrl: string,
  code: string,
  userAgent: string = '',
  base: string = apiBase(),
  fetchImpl: Fetch = fetch,
): Promise<Response> {
  const r = await resolveShortCode(code, base, fetchImpl);
  if (r === 'missing' || r === 'unavailable') return linkProblemPage(r);
  const file = await fetchCalendar(`${base}/rsvp/${encodeURIComponent(r.token)}/calendar.ics`, fetchImpl);
  if (file === 'missing') return linkProblemPage('missing');
  const event = file === 'unavailable' ? null : parseCalendarEvent(file.text);

  const url = new URL(requestUrl);
  const filePath = `/k/${encodeURIComponent(code)}/wedding.ics`;
  const httpsFile = new URL(filePath, url).toString();
  const webcal = `webcal://${url.host}${filePath}`;
  const google = event ? googleCalendarUrl(event) : null;
  const apple = /iPhone|iPad|iPod|Macintosh/i.test(userAgent);

  const button = (href: string, sw: string, en: string, primary: boolean) =>
    `<a href="${escapeHtml(href)}" style="display:block;margin:0 0 .75rem;padding:14px 20px;text-align:center;text-decoration:none;font-weight:600;letter-spacing:.04em;${
      primary ? 'background:#4F6A42;color:#FFFFFF' : 'background:#FFFFFF;color:#1F2A1A;border:1px solid #E0DCC8'
    }">${sw}<span style="display:block;font-weight:400;font-size:.8125rem;opacity:.8">${en}</span></a>`;
  const appleButton = button(webcal, 'Ongeza kwenye kalenda ya iPhone', 'Add to iPhone calendar', apple);
  const googleButton = google ? button(google, 'Ongeza kwenye Google Calendar', 'Add to Google Calendar', !apple) : '';
  const buttons = (apple ? [appleButton, googleButton] : [googleButton, appleButton]).join('');
  const title = event?.title ? escapeHtml(event.title) : 'Siku ya harusi';

  const html = `<!doctype html><html lang="sw"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="robots" content="noindex"></head><body style="margin:0;background:#F1EADB;color:#1F2A1A;font-family:Manrope,system-ui,sans-serif"><main style="max-width:28rem;margin:0 auto;padding:3rem 1rem"><p style="font-weight:700;color:#4F6A42;letter-spacing:.08em;font-size:.75rem">WEDDING.CO.TZ</p><h1 style="font-size:1.5rem;line-height:1.25;margin:.5rem 0 .25rem">${title}</h1><p style="color:#4A5840;margin:0 0 1.5rem">Weka siku hii kwenye kalenda yako. <span style="display:block">Save the day in your calendar.</span></p>${buttons}<p style="margin:1.5rem 0 0;font-size:.875rem;color:#4A5840"><a href="${escapeHtml(httpsFile)}" style="color:#4F6A42;font-weight:600">Pakua faili la kalenda (.ics)</a> <span style="display:block">Download the calendar file. If it opens as text, open this page in Safari or Chrome.</span></p></main></body></html>`;
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' },
  });
}
