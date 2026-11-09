import { describe, expect, it } from 'vitest';
import { isCampaignSlug, isCountedPath, siteEventFrom, viaFrom } from './site-events';

describe('isCountedPath', () => {
  it('counts the marketing pages and vendor profiles', () => {
    for (const p of ['/', '/features', '/app', '/vendors', '/vendors/join', '/vendors/petals-decor', '/privacy']) {
      expect(isCountedPath(p)).toBe(true);
    }
  });

  it('leaves the couples’ pages and links out', () => {
    for (const p of ['/neema-and-baraka-74385f', '/neema-and-baraka-74385f/wall', '/rsvp/abc', '/g/abcdef', '/changia/x']) {
      expect(isCountedPath(p)).toBe(false);
    }
  });
});

describe('isCampaignSlug', () => {
  it('takes 2 to 32 lowercase letters, digits and inner hyphens', () => {
    expect(isCampaignSlug('instagram')).toBe(true);
    expect(isCampaignSlug('poster-mlimani-2')).toBe(true);
    expect(isCampaignSlug('a')).toBe(false);
    expect(isCampaignSlug('-ig')).toBe(false);
    expect(isCampaignSlug('Instagram')).toBe(false);
    expect(isCampaignSlug('x'.repeat(33))).toBe(false);
    expect(isCampaignSlug(undefined)).toBe(false);
  });
});

describe('siteEventFrom', () => {
  it('accepts a page view of a counted page, with its campaign', () => {
    expect(siteEventFrom({ kind: 'page_view', path: '/app', via: 'instagram' })).toEqual({
      kind: 'page_view',
      path: '/app',
      via: 'instagram',
    });
  });

  it('drops a page view of a page that is not counted', () => {
    expect(siteEventFrom({ kind: 'page_view', path: '/neema-and-baraka-74385f' })).toBeNull();
  });

  it('needs a store for a store tap and drops a bad campaign', () => {
    expect(siteEventFrom({ kind: 'store_click', path: '/app' })).toBeNull();
    expect(siteEventFrom({ kind: 'store_click', path: '/app', store: 'play', via: 'Bad Slug' })).toEqual({
      kind: 'store_click',
      path: '/app',
      store: 'play',
    });
  });

  it('refuses anything else', () => {
    expect(siteEventFrom(null)).toBeNull();
    expect(siteEventFrom({ kind: 'click', path: '/' })).toBeNull();
    expect(siteEventFrom({ kind: 'page_view', path: 'app' })).toBeNull();
  });
});

describe('viaFrom', () => {
  it('reads a campaign from the query string', () => {
    expect(viaFrom('?via=tiktok&stay=1')).toBe('tiktok');
    expect(viaFrom('?via=<script>')).toBeUndefined();
    expect(viaFrom('')).toBeUndefined();
  });
});
