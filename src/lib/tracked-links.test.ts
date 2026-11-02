import { describe, expect, it, vi } from 'vitest';
import { isTrackedCode, trackedLinkRedirect, VISITOR_COOKIE } from './tracked-links';
import { GET as galleryGET } from '../app/g/[code]/route';

const API = 'https://api.test/api/v1';
const GALLERY = 'https://codestudiostz.client-gallery.com/gallery/andrew-and-franciana-wedding-day';
const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

/** A stand-in API that knows one code, abc234. */
function api(opts: { status?: 200 | 404 | 500 | 429 | 'throw' | 'hang'; target?: string } = {}) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    if (opts.status === 'throw') throw new Error('ECONNREFUSED');
    if (opts.status === 'hang') {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      });
    }
    if (opts.status === 500) return json({}, 500);
    if (opts.status === 429) return json({ code: 'TOO_MANY' }, 429);
    if (opts.status === 404 || !url.endsWith('/tracked-links/abc234/open')) return json({ code: 'LINK_NOT_FOUND' }, 404);
    return json({ target: opts.target ?? GALLERY });
  });
}

const call = (f: ReturnType<typeof api>) => f.mock.calls[0] as [string, RequestInit];
const headersOf = (f: ReturnType<typeof api>) => new Headers(call(f)[1].headers);

describe('isTrackedCode', () => {
  it('takes the API alphabet only, six long', () => {
    expect(isTrackedCode('abc234')).toBe(true);
    for (const bad of ['abc23', 'abc2345', 'abc230', 'abcl23', 'abcO23', 'ab-234', '../abc']) {
      expect(isTrackedCode(bad)).toBe(false);
    }
  });
});

describe('/g/<code>', () => {
  it('302s to the couple’s address, forwarding the browser and a visitor id', async () => {
    const f = api();
    const res = await trackedLinkRedirect('abc234', { userAgent: IPHONE, cookie: `${VISITOR_COOKIE}=visitor-1234abcd` }, API, f);

    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(GALLERY);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(call(f)[0]).toBe(`${API}/tracked-links/abc234/open`);
    expect(call(f)[1].method).toBe('POST');
    expect(headersOf(f).get('x-guest-user-agent')).toBe(IPHONE);
    expect(headersOf(f).get('x-visitor-id')).toBe('visitor-1234abcd');
    // A visitor who already has the cookie is not given another.
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('gives a first-time browser a random visitor id in a cookie of the site’s own', async () => {
    const f = api();
    const res = await trackedLinkRedirect('abc234', { userAgent: IPHONE, cookie: 'other=1' }, API, f, () => 'fresh-visitor-0001');

    expect(headersOf(f).get('x-visitor-id')).toBe('fresh-visitor-0001');
    const cookie = res.headers.get('set-cookie') ?? '';
    expect(cookie).toContain(`${VISITOR_COOKIE}=fresh-visitor-0001`);
    expect(cookie).toContain('Path=/g');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Lax');
  });

  it('ignores a visitor cookie that is not one of ours', async () => {
    const f = api();
    await trackedLinkRedirect('abc234', { userAgent: IPHONE, cookie: `${VISITOR_COOKIE}=<script>` }, API, f, () => 'fresh-visitor-0002');
    expect(headersOf(f).get('x-visitor-id')).toBe('fresh-visitor-0002');
  });

  it('still redirects a link-preview robot, so WhatsApp can draw the gallery’s preview', async () => {
    const f = api();
    const res = await trackedLinkRedirect('abc234', { userAgent: 'WhatsApp/2.24.20.79 A' }, API, f);
    expect(res.status).toBe(302);
    expect(headersOf(f).get('x-guest-user-agent')).toBe('WhatsApp/2.24.20.79 A');
  });

  it('says the link does not open for an unknown code, never asking the API about a non-code', async () => {
    const unknown = await trackedLinkRedirect('zzz234', {}, API, api());
    expect(unknown.status).toBe(404);
    expect(await unknown.text()).toContain('This link does not open');

    const f = api();
    const bad = await trackedLinkRedirect('../admin', {}, API, f);
    expect(bad.status).toBe(404);
    expect(f).not.toHaveBeenCalled();
  });

  it('asks the guest to try again when the API is down, busy or slow', async () => {
    for (const status of [500, 429, 'throw', 'hang'] as const) {
      const res = await trackedLinkRedirect('abc234', {}, API, api({ status }));
      expect(res.status).toBe(503);
      expect(await res.text()).toContain('Please try again');
    }
  });

  it('only ever sends a guest to a web page', async () => {
    for (const target of ['javascript:alert(1)', 'data:text/html,hi', '/relative', 'https://user:pw@evil.example/']) {
      const res = await trackedLinkRedirect('abc234', {}, API, api({ target }));
      expect(res.status).toBe(404);
      expect(res.headers.get('location')).toBeNull();
    }
  });

  it('is served at /g/<code> with the guest’s browser and cookies', async () => {
    const f = api();
    vi.stubGlobal('fetch', f);
    try {
      const res = await galleryGET(
        new Request('https://wedding.co.tz/g/abc234', { headers: { 'user-agent': IPHONE, cookie: `${VISITOR_COOKIE}=visitor-1234abcd` } }),
        { params: { code: 'abc234' } },
      );
      expect(res.status).toBe(302);
      expect(res.headers.get('location')).toBe(GALLERY);
      expect(headersOf(f).get('x-visitor-id')).toBe('visitor-1234abcd');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
