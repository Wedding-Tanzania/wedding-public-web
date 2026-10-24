import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  calendarPage,
  calendarResponse,
  cardRedirect,
  googleCalendarUrl,
  isGoogleMapsTarget,
  isShortCode,
  mapRedirect,
  openShortCode,
  pageRedirect,
  parseCalendarEvent,
  parseMapSegment,
  resolveShortCode,
} from './short-links';
import { GET as cardGET } from '../app/i/[code]/route';
import { GET as calendarPageGET } from '../app/k/[code]/route';
import { GET as calendarFileGET } from '../app/k/[code]/wedding.ics/route';
import { GET as mapGET } from '../app/m/[code]/route';
import { GET as pageGET } from '../app/p/[code]/route';

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

const MAP_C = 'https://www.google.com/maps/place/St+Joseph/@-6.81,39.29,17z';

/**
 * A stand-in API: knows one code, serves its calendar file. POST
 * /links/:code/open follows `links` unless `open` says otherwise: 'absent'
 * is an API from before tracking (Express's own 404 page), and `target`
 * is what it answers for a map or page link.
 */
function api(
  opts: {
    links?: 'ok' | 404 | 500 | 'throw';
    ics?: 'ok' | 404 | 500 | 'throw';
    open?: 'absent' | 429 | 'hang';
    target?: string | null;
  } = {},
) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    if (url.endsWith('/open')) {
      if (opts.open === 'absent') return new Response('Cannot POST', { status: 404, headers: { 'Content-Type': 'text/html' } });
      if (opts.open === 429) return json({ code: 'TOO_MANY' }, 429);
      if (opts.open === 'hang') {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        });
      }
      if (opts.links === 'throw') throw new Error('ECONNREFUSED');
      if (opts.links === 404 || !url.endsWith('/links/abcdEFGH/open')) return json({ code: 'LINK_NOT_FOUND' }, 404);
      if (opts.links === 500) return json({}, 500);
      const body = JSON.parse(String(init?.body ?? '{}')) as { kind?: string; venue?: string };
      if (body.kind === 'map' && body.venue === undefined) return json({ code: 'VALIDATION_ERROR' }, 400);
      return json({ token: TOKEN, target: body.kind === 'map' || body.kind === 'page' ? (opts.target ?? null) : null });
    }
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

  it('links to the site\'s own address, not the host the function was called on', async () => {
    const res = await calendarPage(
      'https://6adcb4beef068c4644c441c1--deluxe-semolina-969edc.netlify.app/k/abcdEFGH',
      'abcdEFGH',
      IPHONE,
      API,
      api(),
      'https://wedding.co.tz',
    );
    const html = await res.text();
    expect(html).toContain('href="webcal://wedding.co.tz/k/abcdEFGH/wedding.ics"');
    expect(html).toContain('href="https://wedding.co.tz/k/abcdEFGH/wedding.ics"');
    expect(html).not.toContain('netlify.app');
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
    expect(String(f.mock.calls[0]?.[0])).toBe(`${base}/links/abcdEFGH/open`);

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

describe('openShortCode', () => {
  it('posts the kind, the venue for a map, and the guest browser, and reads the answer', async () => {
    const f = api({ target: MAP_C });
    expect(await openShortCode('abcdEFGH', 'map', { venue: 'ceremony', userAgent: ANDROID }, API, f)).toEqual({ token: TOKEN, target: MAP_C });
    const [url, init] = f.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API}/links/abcdEFGH/open`);
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ kind: 'map', venue: 'ceremony' });
    expect((init.headers as Record<string, string>)['X-Guest-User-Agent']).toBe(ANDROID);
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('falls back to the plain lookup on an API from before tracking', async () => {
    const f = api({ open: 'absent' });
    expect(await openShortCode('abcdEFGH', 'card', {}, API, f)).toEqual({ token: TOKEN, target: null });
    expect(String(f.mock.calls[1]?.[0])).toBe(`${API}/links/abcdEFGH`);
  });

  it('is missing for an unknown code, unavailable when the API is down, busy or slow', async () => {
    expect(await openShortCode('zzzzzzzz', 'card', {}, API, api())).toBe('missing');
    expect(await openShortCode('abcdEFGH', 'card', {}, API, api({ links: 'throw' }))).toBe('unavailable');
    expect(await openShortCode('abcdEFGH', 'card', {}, API, api({ open: 429 }))).toBe('unavailable');
    vi.useFakeTimers();
    try {
      const pending = openShortCode('abcdEFGH', 'card', {}, API, api({ open: 'hang' }));
      await vi.advanceTimersByTimeAsync(3000);
      expect(await pending).toBe('unavailable');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('/m/<code>-c and -r', () => {
  it('reads the venue from the suffix, and nothing else', () => {
    expect(parseMapSegment('abcdEFGH-c')).toEqual({ code: 'abcdEFGH', venue: 'ceremony' });
    expect(parseMapSegment('abcdEFGH-r')).toEqual({ code: 'abcdEFGH', venue: 'reception' });
    for (const bad of ['abcdEFGH', 'abcdEFGH-x', 'abcdEFG0-c', 'abcdEFGH-cc', '../abcdEF-c']) expect(parseMapSegment(bad)).toBeNull();
  });

  it('302s to the venue Google Maps link the API names', async () => {
    const res = await mapRedirect('https://wedding.co.tz/m/abcdEFGH-c', 'abcdEFGH-c', IPHONE, API, api({ target: MAP_C }));
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(MAP_C);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('opens the card when there is no map, the API is from before tracking, or the target is not Google Maps', async () => {
    for (const f of [api({ target: null }), api({ open: 'absent' }), api({ target: 'https://evil.example.com/maps' })]) {
      const res = await mapRedirect('https://wedding.co.tz/m/abcdEFGH-r', 'abcdEFGH-r', ANDROID, API, f);
      expect(res.status).toBe(302);
      expect(res.headers.get('location')).toBe(`https://wedding.co.tz/rsvp/${TOKEN}`);
    }
  });

  it('is the not-found page for a bad suffix or an unknown code, try again when the API is down', async () => {
    const f = api();
    expect((await mapRedirect('https://wedding.co.tz/m/abcdEFGH', 'abcdEFGH', '', API, f)).status).toBe(404);
    expect(f).not.toHaveBeenCalled();
    expect((await mapRedirect('https://wedding.co.tz/m/zzzzzzzz-c', 'zzzzzzzz-c', '', API, api())).status).toBe(404);
    expect((await mapRedirect('https://wedding.co.tz/m/abcdEFGH-c', 'abcdEFGH-c', '', API, api({ links: 'throw' }))).status).toBe(503);
  });

  it('only follows Google Maps addresses', () => {
    expect(isGoogleMapsTarget(MAP_C)).toBe(true);
    expect(isGoogleMapsTarget('https://www.google.com/maps/search/?api=1&query=Mlimani')).toBe(true);
    expect(isGoogleMapsTarget('https://maps.app.goo.gl/AbC1')).toBe(true);
    for (const bad of ['http://www.google.com/maps', 'https://google.com.evil.com/maps', 'https://www.google.com/search?q=x', 'javascript:alert(1)', '/rsvp/x']) {
      expect(isGoogleMapsTarget(bad)).toBe(false);
    }
  });
});

describe('/p/<code>', () => {
  it('302s to the wedding page on the site address', async () => {
    const res = await pageRedirect('https://x--site.netlify.app/p/abcdEFGH', 'abcdEFGH', IPHONE, API, api({ target: '/amina-juma' }), 'https://wedding.co.tz');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://wedding.co.tz/amina-juma');
  });

  it('opens the card for an unpublished page, an old API, or a target off this site', async () => {
    for (const f of [api({ target: null }), api({ open: 'absent' }), api({ target: '//evil.example.com/x' }), api({ target: 'https://evil.example.com/' })]) {
      const res = await pageRedirect('https://wedding.co.tz/p/abcdEFGH', 'abcdEFGH', '', API, f, 'https://wedding.co.tz');
      expect(res.headers.get('location')).toBe(`https://wedding.co.tz/rsvp/${TOKEN}`);
    }
    expect((await pageRedirect('https://wedding.co.tz/p/zzzzzzzz', 'zzzzzzzz', '', API, api())).status).toBe(404);
  });
});

describe('counting opens', () => {
  it('records the /k page as the calendar open, never the .ics file it links to', async () => {
    const f = api();
    await calendarPage('https://wedding.co.tz/k/abcdEFGH', 'abcdEFGH', IPHONE, API, f, 'https://wedding.co.tz');
    expect(JSON.parse(String((f.mock.calls[0] as [string, RequestInit])[1].body))).toEqual({ kind: 'calendar' });
    const g = api();
    await calendarResponse('abcdEFGH', API, g);
    expect(g.mock.calls.some((c) => String(c[0]).endsWith('/open'))).toBe(false);
  });

  it('forwards the guest browser from /i, /m and /p', async () => {
    const f = api({ target: MAP_C });
    vi.stubGlobal('fetch', f);
    try {
      await cardGET(new Request('https://wedding.co.tz/i/abcdEFGH', { headers: { 'user-agent': ANDROID } }), { params: { code: 'abcdEFGH' } });
      const map = await mapGET(new Request('https://wedding.co.tz/m/abcdEFGH-c', { headers: { 'user-agent': ANDROID } }), { params: { code: 'abcdEFGH-c' } });
      const page = await pageGET(new Request('https://wedding.co.tz/p/abcdEFGH', { headers: { 'user-agent': ANDROID } }), { params: { code: 'abcdEFGH' } });
      expect(map.headers.get('location')).toBe(MAP_C);
      expect(page.status).toBe(302);
      const sent = f.mock.calls.map((c) => [JSON.parse(String((c[1] as RequestInit).body)), ((c[1] as RequestInit).headers as Record<string, string>)['X-Guest-User-Agent']]);
      expect(sent).toEqual([
        [{ kind: 'card' }, ANDROID],
        [{ kind: 'map', venue: 'ceremony' }, ANDROID],
        [{ kind: 'page' }, ANDROID],
      ]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
