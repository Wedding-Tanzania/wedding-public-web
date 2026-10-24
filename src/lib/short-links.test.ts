import { afterEach, describe, expect, it, vi } from 'vitest';
import { calendarResponse, cardRedirect, isShortCode, resolveShortCode } from './short-links';
import { GET as cardGET } from '../app/i/[code]/route';
import { GET as calendarGET } from '../app/k/[code]/route';

const API = 'https://api.test/api/v1';
const TOKEN = 'fo9Sl1AV5rEW7bCXvGM4oywS-Dzb8hLbP';
const ICS = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n';

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

describe('/k/<code>', () => {
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

    const cal = await calendarGET(new Request('https://wedding.co.tz/k/abcdEFGH'), { params: { code: 'abcdEFGH' } });
    expect(cal.status).toBe(200);
    expect(cal.headers.get('content-type')).toBe('text/calendar; charset=utf-8');
  });
});
