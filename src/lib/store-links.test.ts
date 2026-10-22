import { describe, expect, it } from 'vitest';
import { detectPlatform, openInBrowserHref, storeRedirect } from './store-links';

const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36';
const DESKTOP_CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const IPAD_AS_MAC_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';

const APP_STORE = 'https://apps.apple.com/app/id6822616728';
const PLAY = 'https://play.google.com/store/apps/details?id=tz.co.wedding.app';

describe('detectPlatform', () => {
  it('detects an iPhone', () => {
    expect(detectPlatform(IPHONE_UA)).toBe('ios');
  });

  it('detects Android', () => {
    expect(detectPlatform(ANDROID_UA)).toBe('android');
  });

  it('treats desktop Chrome as other', () => {
    expect(detectPlatform(DESKTOP_CHROME_UA)).toBe('other');
  });

  it('treats iPadOS reporting as Macintosh with touch as iOS', () => {
    expect(detectPlatform(IPAD_AS_MAC_UA, 5)).toBe('ios');
  });

  it('treats a real Mac without touch as other', () => {
    expect(detectPlatform(IPAD_AS_MAC_UA, 0)).toBe('other');
    expect(detectPlatform(IPAD_AS_MAC_UA)).toBe('other');
  });
});

describe('storeRedirect', () => {
  it('sends iOS to the App Store when the link is set', () => {
    expect(storeRedirect(IPHONE_UA, { appStore: APP_STORE, playStore: null })).toBe(APP_STORE);
  });

  it('keeps Android on the page while Play is not live', () => {
    expect(storeRedirect(ANDROID_UA, { appStore: APP_STORE, playStore: null })).toBeNull();
  });

  it('sends Android to Play once the link is set', () => {
    expect(storeRedirect(ANDROID_UA, { appStore: APP_STORE, playStore: PLAY })).toBe(PLAY);
  });

  it('keeps desktop on the page', () => {
    expect(storeRedirect(DESKTOP_CHROME_UA, { appStore: APP_STORE, playStore: PLAY })).toBeNull();
  });

  it('sends an iPad reporting as Macintosh to the App Store', () => {
    expect(storeRedirect(IPAD_AS_MAC_UA, { appStore: APP_STORE, playStore: null }, 5)).toBe(APP_STORE);
  });
});

describe('openInBrowserHref', () => {
  it('falls back to home when next is missing', () => {
    expect(openInBrowserHref(undefined)).toBe('/');
    expect(openInBrowserHref('')).toBe('/');
  });

  it('keeps a same-site relative path', () => {
    expect(openInBrowserHref('/rsvp/abc')).toBe('/rsvp/abc');
    expect(openInBrowserHref('/i/xyz?lang=sw')).toBe('/i/xyz?lang=sw');
  });

  it('rejects absolute URLs', () => {
    expect(openInBrowserHref('https://evil')).toBe('/');
    expect(openInBrowserHref('javascript:alert(1)')).toBe('/');
  });

  it('rejects protocol relative URLs', () => {
    expect(openInBrowserHref('//evil')).toBe('/');
    expect(openInBrowserHref('/\\evil')).toBe('/');
  });
});
