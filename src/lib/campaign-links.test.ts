import { describe, expect, it, vi } from 'vitest';
import { campaignLinkRedirect } from './campaign-links';

const BASE = 'https://api.test/api/v1';
const PLAY = 'https://play.google.com/store/apps/details?id=tz.co.wedding';
const ANDROID =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36';
const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const WHATSAPP = 'WhatsApp/2.24.1.0 A';

function api(status: number) {
  return vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => new Response(JSON.stringify({ slug: 'x' }), { status }));
}
const newId = () => 'visitor-1234abcd';

describe('campaignLinkRedirect', () => {
  it('sends Android to Play with the campaign, counts the open and the Play tap, and sets the visitor cookie', async () => {
    const f = api(200);
    const res = await campaignLinkRedirect('Instagram', { userAgent: ANDROID }, PLAY, BASE, f, newId);
    expect(res.status).toBe(302);
    const loc = new URL(res.headers.get('location') ?? '');
    expect(loc.origin + loc.pathname).toBe('https://play.google.com/store/apps/details');
    expect(loc.searchParams.get('referrer')).toBe('utm_source=instagram&utm_medium=campaign_link');
    expect(res.headers.get('set-cookie')).toContain('wl_v=visitor-1234abcd; Path=/app');

    const [openUrl, openInit] = f.mock.calls[0] ?? [];
    expect(openUrl).toBe(`${BASE}/campaign-links/instagram/open`);
    expect((openInit?.headers as Record<string, string>)['X-Visitor-Id']).toBe('visitor-1234abcd');
    const [eventUrl, eventInit] = f.mock.calls[1] ?? [];
    expect(eventUrl).toBe(`${BASE}/site-events`);
    expect(JSON.parse(String(eventInit?.body))).toEqual({
      kind: 'store_click',
      path: '/app/instagram',
      store: 'play',
      via: 'instagram',
    });
  });

  it('lands an iPhone on /app with the campaign while the App Store is not live', async () => {
    const f = api(200);
    const res = await campaignLinkRedirect('tiktok', { userAgent: IPHONE }, PLAY, BASE, f, newId);
    expect(res.headers.get('location')).toBe('/app?via=tiktok');
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('lands a link preview robot on /app too, so the preview shows the download page', async () => {
    const res = await campaignLinkRedirect('tiktok', { userAgent: WHATSAPP }, PLAY, BASE, api(200), newId);
    expect(res.headers.get('location')).toBe('/app?via=tiktok');
  });

  it('keeps a returning visitor’s cookie', async () => {
    const res = await campaignLinkRedirect(
      'tiktok',
      { userAgent: IPHONE, cookie: 'other=1; wl_v=known-visitor-99' },
      PLAY,
      BASE,
      api(200),
      newId,
    );
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('sends an unknown or removed link to /app, uncredited', async () => {
    const res = await campaignLinkRedirect('old-poster', { userAgent: ANDROID }, PLAY, BASE, api(404), newId);
    expect(res.headers.get('location')).toBe('/app');
  });

  it('still lands on /app with the campaign when the API is down', async () => {
    const down = vi.fn(async () => {
      throw new Error('down');
    });
    const res = await campaignLinkRedirect('tiktok', { userAgent: IPHONE }, PLAY, BASE, down, newId);
    expect(res.headers.get('location')).toBe('/app?via=tiktok');
  });

  it('refuses a malformed slug without calling the API', async () => {
    const f = api(200);
    const res = await campaignLinkRedirect('<script>', { userAgent: IPHONE }, PLAY, BASE, f, newId);
    expect(res.headers.get('location')).toBe('/app');
    expect(f).not.toHaveBeenCalled();
  });
});
