import { describe, expect, it, vi } from 'vitest';
import { refreshStory, storyTag } from './story-refresh';

const secret = 's3cret-value-long-enough';

function call(body: unknown, opts: { header?: string | null; configured?: string } = {}) {
  const drop = vi.fn();
  const res = refreshStory({
    secret: opts.configured ?? secret,
    given: opts.header === undefined ? secret : opts.header,
    body,
    drop,
  });
  return { res, drop };
}

describe('refreshStory', () => {
  it('drops the page for the slug when the secret matches', () => {
    const { res, drop } = call({ slug: 'andrew-and-franciana-bc01d4' });
    expect(res).toEqual({ status: 200, body: { refreshed: 'andrew-and-franciana-bc01d4' } });
    expect(drop).toHaveBeenCalledWith('andrew-and-franciana-bc01d4');
  });

  it('refuses a wrong or missing secret, and drops nothing', () => {
    expect(call({ slug: 'a-b' }, { header: 'nope' }).res.status).toBe(401);
    const missing = call({ slug: 'a-b' }, { header: null });
    expect(missing.res.status).toBe(401);
    expect(missing.drop).not.toHaveBeenCalled();
  });

  it('is off until a secret is configured', () => {
    const { res, drop } = call({ slug: 'a-b' }, { configured: '' });
    expect(res.status).toBe(503);
    expect(drop).not.toHaveBeenCalled();
  });

  it('refuses anything that is not a couple slug', () => {
    for (const slug of ['', '../admin', 'A B', 'x'.repeat(200), 42]) {
      const { res, drop } = call({ slug });
      expect(res.status).toBe(400);
      expect(drop).not.toHaveBeenCalled();
    }
  });

  it('tags each page by its slug', () => {
    expect(storyTag('andrew-and-franciana-bc01d4')).toBe('story:andrew-and-franciana-bc01d4');
  });
});
