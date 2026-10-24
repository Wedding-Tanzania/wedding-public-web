import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  calendarPage,
  calendarResponse,
  cardRedirect,
  googleCalendarUrl,
  isShortCode,
  parseCalendarEvent,
  resolveShortCode,
} from './short-links';
import { GET as cardGET } from '../app/i/[code]/route';
import { GET as calendarPageGET } from '../app/k/[code]/route';
import { GET as calendarFileGET } from '../app/k/[code]/wedding.ics/route';

const API = 'https://api.test/api/v1';
const TOKEN = 'fo9Sl1AV5rEW7bCXvGM4oywS-Dzb8hLbP';
// What the API sends today (wedding-api calendar-feed), folded as it folds.
const ICS = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Wedding by Lockwood//Calendar//EN',
  'BEGIN:VEVENT',
  'UID:invite-6ad84aa8982b6f3e0ee049cb@wedding.co.tz',
  'DTSTAMP:20261024T132710Z',
  'DTSTART;VALUE=DATE:20261031',
  'DTEND;VALUE=DATE:20261101',
  'SUMMARY:Wedding of Andrew & Franciana',
  'DESCRIPTION:Your card: 0468-001. Your invitation: https://wedding.co.tz/i/v',
  ' KHe6n24',
  'BEGIN:VALARM',
  'ACTION:DISPLAY',
  'DESCRIPTION:Wedding of Andrew & Franciana',
  'TRIGGER:-P1D',
  'END:VALARM',
  'END:VEVENT',
  'END:VCALENDAR',
  '',
].join('\r\n');
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WhatsApp/2.24';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

/** A stand-in API: knows one code, serves its calendar file. */
function api(opts: { links?: 'ok' | 404 | 500 | 'throw'; ics?: 'ok' | 404 | 500 | 'throw' } = {}) {
  return vi.fn(async (input: RequestInfo | URL): Promise<Response> => {
    const url = String(input);
    if (url.includes('/links/')) {
      if (opts.links === 'throw') throw new Error('ECONNREFUSED');
      if (opts.links === 404 || !url.endsWith('/links/abcdEFGH')) return json({ code: 'LINK_NOT_FOUND' }, 404);
      if (opts.links === 500) return json({}, 500);
      return json({ token: TOKEN });
    }
    if (url.endsWith(`/rsvp/${TOKEN}/calendar.ics`)) {
      if (opts.ics === 'throw') throw new Error('timeout');
      if (opts.ics === 404) return new Response('Not found', { status: 404 });
      if (opts.ics === 500) return new Response('boom', { status: 500 });
      return new Response(ICS, { status: 200, headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
    }
    return new Response('unexpected', { status: 418 });
  });
}

describe('isShortCode', () => {
  it('takes the API alphabet only, eight long', () => {
    expect(isShortCode('abcdEFGH')).toBe(true);
    expect(isShortCode('23456789')).toBe(true);
    for (const bad of ['abcdEFG', 'abcdEFGHJ', 'abcdEFG0', 'abcdEFGl', 'abcdEFGO', 'abcd-FGH', '../x/abc']) {
      expect(isShortCode(bad)).toBe(false);
    }
  });
});

describe('resolveShortCode', () => {
  it('returns the token, missing for an unknown code, unavailable when the API is down', async () => {
    expect(await resolveShortCode('abcdEFGH', API, api())).toEqual({ token: TOKEN });
    expect(await resolveShortCode('zzzzzzzz', API, api())).toBe('missing');
    expect(await resolveShortCode('abcdEFGH', API, api({ links: 500 }))).toBe('unavailable');
    expect(await resolveShortCode('abcdEFGH', API, api({ links: 'throw' }))).toBe('unavailable');
  });

  it('never asks the API about something that is not a code', async () => {
    const f = api();
    expect(await resolveShortCode('../../admin', API, f)).toBe('missing');
    expect(f).not.toHaveBeenCalled();
  });
});

describe('/i/<code>', () => {
  it('302s to the guest card page on wedding.co.tz', async () => {
    const res = await cardRedirect('https://wedding.co.tz/i/abcdEFGH', 'abcdEFGH', API, api());
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(`https://wedding.co.tz/rsvp/${TOKEN}`);
  });

  it('shows a plain page for an unknown code, and for an API without the endpoint yet', async () => {
    const res = await cardRedirect('https://wedding.co.tz/i/zzzzzzzz', 'zzzzzzzz', API, api());
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(await res.text()).toContain('Kiungo hiki hakipatikani');
    expect((await cardRedirect('https://wedding.co.tz/i/abcdEFGH', 'abcdEFGH', API, api({ links: 404 }))).status).toBe(404);
  });

  it('says try again when the API is unreachable', async () => {
    const res = await cardRedirect('https://wedding.co.tz/i/abcdEFGH', 'abcdEFGH', API, api({ links: 'throw' }));
    expect(res.status).toBe(503);
    expect(await res.text()).toContain('jaribu tena');
  });
});

describe('/k/<code>/wedding.ics', () => {
  it('serves the calendar file from wedding.co.tz as text/calendar', async () => {
    const res = await calendarResponse('abcdEFGH', API, api());
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/calendar; charset=utf-8');
    expect(res.headers.get('content-disposition')).toContain('wedding.ics');
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(await res.text()).toBe(ICS);
  });

  it('302s to the API copy when the file cannot be proxied', async () => {
    for (const ics of [500, 'throw'] as const) {
      const res = await calendarResponse('abcdEFGH', API, api({ ics }));
      expect(res.status).toBe(302);
      expect(res.headers.get('location')).toBe(`${API}/rsvp/${TOKEN}/calendar.ics`);
    }
  });

  it('is a 404 page for an unknown code or a card with no wedding', async () => {
    expect((await calendarResponse('zzzzzzzz', API, api())).status).toBe(404);
    expect((await calendarResponse('abcdEFGH', API, api({ ics: 404 }))).status).toBe(404);
  });
});

describe('/k/<code>', () => {
  // WhatsApp's in-app browser shows a bare calendar file as text, so the
  // short link is a page that offers each way to add the day.
  it('is an HTML page, never the raw file', async () => {
    const res = await calendarPage('https://wedding.co.tz/k/abcdEFGH', 'abcdEFGH', IPHONE, API, api());
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    const html = await res.text();
    expect(html).not.toContain('BEGIN:VCALENDAR');
    expect(html).toContain('<title>Wedding of Andrew &amp; Franciana</title>');
  });

  it('links the iPhone Calendar app, Google Calendar and the file', async () => {
    const html = await (await calendarPage('https://wedding.co.tz/k/abcdEFGH', 'abcdEFGH', IPHONE, API, api())).text();
    expect(html).toContain('href="webcal://wedding.co.tz/k/abcdEFGH/wedding.ics"');
    expect(html).toContain('href="https://wedding.co.tz/k/abcdEFGH/wedding.ics"');
    expect(html).toContain('href="https://calendar.google.com/calendar/render?action=TEMPLATE&amp;text=Wedding+of+Andrew+%26+Franciana&amp;dates=20261031%2F20261101');
  });

  it('puts the phone\'s own calendar first', async () => {
    const first = (html: string) => (html.indexOf('webcal://') < html.indexOf('calendar.google.com') ? 'apple' : 'google');
    expect(first(await (await calendarPage('https://wedding.co.tz/k/abcdEFGH', 'abcdEFGH', IPHONE, API, api())).text())).toBe('apple');
    expect(first(await (await calendarPage('https://wedding.co.tz/k/abcdEFGH', 'abcdEFGH', ANDROID, API, api())).text())).toBe('google');
  });

  it('still offers the iPhone app and the file when the event cannot be read', async () => {
    const html = await (await calendarPage('https://wedding.co.tz/k/abcdEFGH', 'abcdEFGH', ANDROID, API, api({ ics: 500 }))).text();
    expect(html).toContain('webcal://wedding.co.tz/k/abcdEFGH/wedding.ics');
    expect(html).not.toContain('calendar.google.com');
  });

  it('is a 404 page for an unknown code or a card with no wedding', async () => {
    expect((await calendarPage('https://wedding.co.tz/k/zzzzzzzz', 'zzzzzzzz', IPHONE, API, api())).status).toBe(404);
    expect((await calendarPage('https://wedding.co.tz/k/abcdEFGH', 'abcdEFGH', IPHONE, API, api({ ics: 404 }))).status).toBe(404);
  });
});

describe('parseCalendarEvent', () => {
  it('reads the folded, escaped event the API sends, ignoring its alarms', () => {
    const e = parseCalendarEvent(ICS)!;
    expect(e.title).toBe('Wedding of Andrew & Franciana');
    expect(e.description).toBe('Your card: 0468-001. Your invitation: https://wedding.co.tz/i/vKHe6n24');
    expect(e.googleDates).toBe('20261031/20261101');
    expect(e.timeZone).toBeNull();
  });

  it('keeps local times with their zone, UTC times as they are, and unescapes text', () => {
    const local = parseCalendarEvent(
      'BEGIN:VEVENT\r\nDTSTART;TZID=Africa/Dar_es_Salaam:20261031T100000\r\nDTEND;TZID=Africa/Dar_es_Salaam:20261031T160000\r\nSUMMARY:A\\, B\\; C\r\nLOCATION:St Joseph\\nDar\r\nEND:VEVENT',
    )!;
    expect(local.googleDates).toBe('20261031T100000/20261031T160000');
    expect(local.timeZone).toBe('Africa/Dar_es_Salaam');
    expect(local.title).toBe('A, B; C');
    expect(local.location).toBe('St Joseph\nDar');
    expect(googleCalendarUrl(local)).toContain('ctz=Africa%2FDar_es_Salaam');

    const utc = parseCalendarEvent('BEGIN:VEVENT\nDTSTART:20261031T070000Z\nDTEND:20261031T130000Z\nEND:VEVENT')!;
    expect(utc.googleDates).toBe('20261031T070000Z/20261031T130000Z');
    expect(utc.timeZone).toBeNull();
  });

  it('gives an all-day event with no end a one-day span, and nothing without a start', () => {
    expect(parseCalendarEvent('BEGIN:VEVENT\nDTSTART;VALUE=DATE:20261231\nEND:VEVENT')!.googleDates).toBe('20261231/20270101');
    expect(parseCalendarEvent('BEGIN:VEVENT\nSUMMARY:x\nEND:VEVENT')).toBeNull();
  });
});

describe('the route handlers', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('wire /i and /k to the API named in NEXT_PUBLIC_API_BASE', async () => {
    const f = api();
    vi.stubGlobal('fetch', f);
    const base = (process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1').replace(/\/$/, '');

    const card = await cardGET(new Request('https://wedding.co.tz/i/abcdEFGH'), { params: { code: 'abcdEFGH' } });
    expect(card.status).toBe(302);
    expect(card.headers.get('location')).toBe(`https://wedding.co.tz/rsvp/${TOKEN}`);
    expect(String(f.mock.calls[0]?.[0])).toBe(`${base}/links/abcdEFGH`);

    const page = await calendarPageGET(
      new Request('https://wedding.co.tz/k/abcdEFGH', { headers: { 'user-agent': IPHONE } }),
      { params: { code: 'abcdEFGH' } },
    );
    expect(page.status).toBe(200);
    expect(page.headers.get('content-type')).toBe('text/html; charset=utf-8');

    const file = await calendarFileGET(new Request('https://wedding.co.tz/k/abcdEFGH/wedding.ics'), { params: { code: 'abcdEFGH' } });
    expect(file.status).toBe(200);
    expect(file.headers.get('content-type')).toBe('text/calendar; charset=utf-8');
  });
});
