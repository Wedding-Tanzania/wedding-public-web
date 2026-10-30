import { describe, expect, it, vi } from 'vitest';
import {
  clampIndex,
  coupleLabel,
  fetchWall,
  freshIds,
  gridWindow,
  hashtagLabel,
  shortMessage,
  shortUrl,
  columnSeconds,
  splitColumns,
  splitWall,
  spotlightOrder,
  wallDate,
  wordsSize,
  type WishWallItem,
} from './wall';

function item(id: string, at: string, photo = false): WishWallItem {
  return {
    id,
    name: `Guest ${id}`,
    message: `Hongera ${id}`,
    createdAt: at,
    photos: photo ? [{ id: `p${id}`, url: `https://cdn.example/${id}.jpg` }] : [],
  };
}

/** Newest first, as splitWall orders before it builds the spotlight. */
function newest(items: WishWallItem[]): WishWallItem[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

describe('wordsSize', () => {
  it('sets a short wish large and a long one smaller so it fits the panel', () => {
    expect(wordsSize('Hongera sana Kaka')).toBe('xl');
    expect(wordsSize('x'.repeat(120))).toBe('lg');
    expect(wordsSize('x'.repeat(250))).toBe('md');
    expect(wordsSize('x'.repeat(480))).toBe('sm');
  });
});

describe('splitWall', () => {
  it('orders newest first and puts every wish in the spotlight, photos and words taking turns', () => {
    const items = [
      item('a', '2026-10-31T10:00:00Z'),
      item('b', '2026-10-31T12:00:00Z', true),
      item('c', '2026-10-31T11:00:00Z', true),
      item('d', '2026-10-31T13:00:00Z'),
    ];
    const { spotlight, all } = splitWall(items);
    expect(all.map((i) => i.id)).toEqual(['d', 'b', 'c', 'a']);
    expect(spotlight.map((i) => i.id)).toEqual(['b', 'd', 'c', 'a']);
  });

  it('shows words in the spotlight when nobody has sent a photo yet', () => {
    const items = [item('a', '2026-10-31T10:00:00Z'), item('b', '2026-10-31T11:00:00Z')];
    expect(splitWall(items).spotlight.map((i) => i.id)).toEqual(['b', 'a']);
  });

  it('lets the longer kind follow once the other runs out', () => {
    const items = [
      item('p1', '2026-10-31T10:00:00Z', true),
      item('w1', '2026-10-31T11:00:00Z'),
      item('w2', '2026-10-31T12:00:00Z'),
      item('w3', '2026-10-31T13:00:00Z'),
    ];
    expect(spotlightOrder(newest(items)).map((i) => i.id)).toEqual(['p1', 'w3', 'w2', 'w1']);
  });

  it('treats a photo row with no url as words', () => {
    const odd: WishWallItem = { ...item('x', '2026-10-31T10:00:00Z'), photos: [{ id: 'p', url: '' }] };
    expect(splitWall([odd]).spotlight.map((i) => i.id)).toEqual(['x']);
    expect(splitWall([odd]).all).toHaveLength(1);
  });

  it('handles an empty wall', () => {
    expect(splitWall([])).toEqual({ spotlight: [], all: [] });
  });
});

describe('gridWindow', () => {
  const twenty = Array.from({ length: 20 }, (_, i) => `w${i}`);

  it('shows everything when it fits', () => {
    expect(gridWindow(['a', 'b'], 5, 12)).toEqual(['a', 'b']);
  });

  it('cuts a window of max cards from the offset and wraps round', () => {
    expect(gridWindow(twenty, 0, 12)).toEqual(twenty.slice(0, 12));
    expect(gridWindow(twenty, 15, 12)).toEqual([...twenty.slice(15), ...twenty.slice(0, 7)]);
    expect(gridWindow(twenty, 20, 12)).toEqual(twenty.slice(0, 12));
  });
});

describe('freshIds and clampIndex', () => {
  it('names only the ids that just arrived', () => {
    const before = [item('a', '2026-10-31T10:00:00Z')];
    const after = [item('b', '2026-10-31T11:00:00Z'), ...before];
    expect([...freshIds(before, after)]).toEqual(['b']);
    expect(freshIds(after, after).size).toBe(0);
  });

  it('keeps the spotlight index in range when the list shrinks', () => {
    expect(clampIndex(5, 3)).toBe(2);
    expect(clampIndex(2, 0)).toBe(0);
    expect(clampIndex(-1, 3)).toBe(2);
  });
});

describe('labels', () => {
  it('formats the wedding date in Dar time in both languages', () => {
    expect(wallDate('2026-10-31T00:00:00.000Z', 'sw')).toBe('31 Oktoba 2026');
    expect(wallDate('2026-10-31T00:00:00.000Z', 'en')).toBe('31 October 2026');
    // 22:00 UTC is already the next day in Dar es Salaam.
    expect(wallDate('2026-10-30T22:00:00.000Z', 'en')).toBe('31 October 2026');
    expect(wallDate(undefined, 'en')).toBe('');
    expect(wallDate('not a date', 'sw')).toBe('');
  });

  it('shortens the wishes URL for the screen', () => {
    expect(shortUrl('https://wedding.co.tz/andrew-and-franciana-bc01d4/wishes')).toBe('wedding.co.tz/andrew-and-franciana-bc01d4/wishes');
    expect(shortUrl('http://www.example.com/x/')).toBe('example.com/x');
  });

  it('names the couple by first names and falls back when unknown', () => {
    expect(coupleLabel({ partnerA: 'Andrew Wilson', partnerB: 'Franciana George' }, 'sw')).toBe('Andrew & Franciana');
    expect(coupleLabel(null, 'sw')).toBe('Maharusi');
    expect(coupleLabel(null, 'en')).toBe('The couple');
  });

  it('shows one hash on the hashtag', () => {
    expect(hashtagLabel('AndrewNaFranciana')).toBe('#AndrewNaFranciana');
    expect(hashtagLabel('##AndrewNaFranciana')).toBe('#AndrewNaFranciana');
    expect(hashtagLabel(null)).toBe('');
    expect(hashtagLabel('  ')).toBe('');
  });

  it('cuts a long message on a word with an ellipsis', () => {
    const long = 'Hongereni sana wapendwa wetu, Mungu awabariki na kuwajalia furaha, amani na upendo wa kudumu katika maisha yenu yote mapya mliyoyaanza leo.';
    const short = shortMessage(long, 60);
    expect(short.length).toBeLessThanOrEqual(61);
    expect(short.endsWith('…')).toBe(true);
    expect(short).not.toMatch(/\s…$/);
    expect(shortMessage('Hongera!', 60)).toBe('Hongera!');
  });
});

describe('fetchWall', () => {
  it('asks the wall route with no-store and returns the body', async () => {
    const payload = { slug: 's', couple: null, hashtag: null, wishesUrl: 'https://wedding.co.tz/s/wishes', items: [], total: 0, serverTime: 'now' };
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } }));
    const data = await fetchWall('s', fetchImpl as unknown as typeof fetch);
    expect(data).toEqual(payload);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/story\/s\/wall$/);
    expect(init.cache).toBe('no-store');
  });

  it('throws on a non-2xx so the screen keeps its last good data', async () => {
    const fetchImpl = vi.fn(async () => new Response('nope', { status: 503 }));
    await expect(fetchWall('s', fetchImpl as unknown as typeof fetch)).rejects.toThrow(/503/);
  });
});

describe('the two scrolling columns', () => {
  it('deals wishes left and right so both columns move and the newest top each', () => {
    const all = ['a', 'b', 'c', 'd', 'e'].map((id, i) => item(id, `2026-10-31T1${i}:00:00Z`));
    const [left, right] = splitColumns(all);
    expect(left.map((i) => i.id)).toEqual(['a', 'c', 'e']);
    expect(right.map((i) => i.id)).toEqual(['b', 'd']);
    expect(splitColumns([])).toEqual([[], []]);
  });

  it('scrolls slowly enough to read and never faster than a 20 second pass', () => {
    expect(columnSeconds(1)).toBe(20);
    expect(columnSeconds(10)).toBe(70);
  });
});
