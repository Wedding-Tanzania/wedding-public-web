import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

// The two files that let the Wedding app open wedding.co.tz links: Android
// App Links read assetlinks.json, iOS Universal Links read
// apple-app-site-association. Both must name the app, and iOS must claim
// only a guest's card and the short link, so the app never takes over the
// marketing pages, the story pages or /k/<code> (the calendar file).

const wellKnown = (name: string) =>
  readFileSync(path.join(__dirname, '../../public/.well-known', name), 'utf8');

type Component = { '/': string; exclude?: boolean };
const aasa = JSON.parse(wellKnown('apple-app-site-association')) as {
  applinks: { details: { appIDs: string[]; components: Component[] }[] };
};
const [detail] = aasa.applinks.details;

/** Apple's component matching: `*` is any run of characters, `?` one. */
function pathMatches(pattern: string, pathname: string): boolean {
  const re = pattern
    .split('')
    .map((c) => (c === '*' ? '.*' : c === '?' ? '.' : c.replace(/[.+^${}()|[\]\\]/g, '\\$&')))
    .join('');
  return new RegExp(`^${re}$`).test(pathname);
}

/** The first component that matches decides, as on the phone. */
function opensInApp(pathname: string): boolean {
  const hit = detail.components.find((c) => pathMatches(c['/'], pathname));
  return hit !== undefined && hit.exclude !== true;
}

describe('apple-app-site-association', () => {
  it('names the Wedding app on team 9J398UCV98', () => {
    expect(aasa.applinks.details).toHaveLength(1);
    expect(detail.appIDs).toEqual(['9J398UCV98.tz.co.wedding']);
  });

  it("claims a guest's card and the short link", () => {
    expect(opensInApp('/rsvp/q9Xk2V_mT4rLp8Zs-1nB6cYw3HdJf0Ae')).toBe(true);
    expect(opensInApp('/i/Ab3dEf7h')).toBe(true);
  });

  it('leaves everything else to Safari', () => {
    for (const p of [
      '/',
      '/pricing',
      '/app',
      '/andrew-franciana',
      '/andrew-franciana/wishes',
      '/k/Ab3dEf7h',
      '/changia/abc',
      '/rsvp/',
      '/i/',
      '/rsvp/q9Xk2V_mT4rLp8Zs-1nB6cYw3HdJf0Ae/card.png',
      '/rsvp/preview/abc123',
      '/rsvp/preview/abc123/card.png',
      '/i/Ab3dEf7h/extra',
    ]) {
      expect(opensInApp(p), p).toBe(false);
    }
  });
});

describe('assetlinks.json', () => {
  it('names the same app for Android', () => {
    const [statement] = JSON.parse(wellKnown('assetlinks.json')) as {
      target: { package_name: string; sha256_cert_fingerprints: string[] };
    }[];
    expect(statement.target.package_name).toBe('tz.co.wedding');
    expect(statement.target.sha256_cert_fingerprints.length).toBeGreaterThan(0);
  });
});

describe('netlify.toml', () => {
  it('serves the association file as JSON', () => {
    const toml = readFileSync(path.join(__dirname, '../../netlify.toml'), 'utf8');
    expect(toml).toMatch(
      /for = "\/\.well-known\/apple-app-site-association"\s*\[headers\.values\]\s*Content-Type = "application\/json"/,
    );
  });
});
