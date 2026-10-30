import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { qrSvg } from '@/lib/qr';
import { fetchWall, type WishWallResponse } from '@/lib/wall';
import { WishWall } from './WishWall';

const wall: WishWallResponse = {
  slug: 'andrew-and-franciana-bc01d4',
  couple: { partnerA: 'Andrew Wilson', partnerB: 'Franciana George', weddingDate: '2026-10-31T00:00:00.000Z' },
  hashtag: 'AndrewNaFranciana',
  wishesUrl: 'https://wedding.co.tz/andrew-and-franciana-bc01d4/wishes',
  items: [
    {
      id: 'w3',
      name: 'Mama Asha',
      message: 'Hongereni sana! Mungu awabariki.',
      createdAt: '2026-10-31T15:02:00.000Z',
      photos: [{ id: 'p1', url: 'https://pub.example/wish/p1.jpg', caption: 'Familia ya Mushi' }],
    },
    { id: 'w2', name: 'Baraka Juma', message: 'Wishing you a lifetime of joy.', createdAt: '2026-10-31T15:01:00.000Z', photos: [] },
    { id: 'w1', name: 'Neema Mushi', message: 'Pongezi!', createdAt: '2026-10-31T15:00:00.000Z', photos: [] },
  ],
  total: 3,
  serverTime: '2026-10-31T15:03:00.000Z',
};

function mockFetch(body: unknown, status = 200) {
  const impl = vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));
  vi.stubGlobal('fetch', impl);
  return impl;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('WishWall', () => {
  it('renders the names, the live count and the QR panel from the wall payload', async () => {
    const impl = mockFetch(wall);
    const data = await fetchWall(wall.slug);
    const [url, init] = impl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain('/story/andrew-and-franciana-bc01d4/wall');
    expect(init.cache).toBe('no-store');

    const qr = { svg: await qrSvg(data.wishesUrl, '#1F2A1A'), url: data.wishesUrl };
    const html = renderToStaticMarkup(<WishWall slug={wall.slug} lang="sw" initial={data} qr={qr} />);

    expect(html).toContain('Andrew &amp; Franciana');
    expect(html).toContain('31 Oktoba 2026');
    expect(html).toContain('#AndrewNaFranciana');
    expect(html).toContain('Mama Asha');
    expect(html).toContain('Baraka Juma');
    expect(html).toContain('Neema Mushi');
    expect(html).toContain('3 salamu');
    expect(html).toContain('data-wall-count="3"');
    expect(html).toContain('Scan ili kuacha salamu na picha yako');
    expect(html).toContain('wedding.co.tz/andrew-and-franciana-bc01d4/wishes');
    expect(html).toContain('<svg');
    // The photo wish is in the spotlight, and its caption shows.
    expect(html).toContain('data-wall-spotlight="w3"');
    expect(html).toContain('Familia ya Mushi');
    // Every wish scrolls in the two columns, the spotlight one included, so the words can be read.
    expect(html).toContain('data-wall-columns="2"');
    for (const id of ['w1', 'w2', 'w3']) expect(html).toContain(`data-wall-card="${id}"`);
  });

  it('speaks English with ?lang=en', async () => {
    mockFetch(wall);
    const data = await fetchWall(wall.slug);
    const html = renderToStaticMarkup(<WishWall slug={wall.slug} lang="en" initial={data} qr={null} />);
    expect(html).toContain('3 wishes');
    expect(html).toContain('Scan to leave your wish and photo');
    expect(html).toContain('31 October 2026');
  });

  it('invites the first wish when the wall is empty', async () => {
    mockFetch({ ...wall, items: [], total: 0 });
    const data = await fetchWall(wall.slug);
    const html = renderToStaticMarkup(<WishWall slug={wall.slug} lang="sw" initial={data} qr={null} />);
    expect(html).toContain('Salamu ya kwanza bado haijafika');
    expect(html).toContain('0 salamu');
    expect(html).toContain('Scan ili kuacha salamu na picha yako');
  });

  it('still draws the frame and the QR text before the first payload', () => {
    const html = renderToStaticMarkup(<WishWall slug={wall.slug} lang="sw" initial={null} qr={{ svg: '<svg></svg>', url: wall.wishesUrl }} />);
    expect(html).toContain('Maharusi');
    expect(html).toContain('Ukuta wa salamu');
    expect(html).toContain('wedding.co.tz/andrew-and-franciana-bc01d4/wishes');
  });
});
