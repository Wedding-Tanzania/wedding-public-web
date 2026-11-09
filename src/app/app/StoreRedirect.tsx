'use client';
import { useEffect, useState } from 'react';
import { sendSiteEvent, viaFrom } from '@/lib/site-events';
import { detectPlatform, playUrlFor, storeRedirect } from '@/lib/store-links';

interface Props {
  appStore: string | null;
  playStore: string | null;
}

/**
 * Sends phones straight to their store on mount, once that store has the
 * app: Android to Google Play now, iPhone and iPad to the App Store when it
 * is live. The redirect counts as a store tap, credited to the campaign in
 * ?via=. Desktop stays on the page, and ?stay=1 (or ?noredirect=1) keeps any
 * device on the page.
 */
export function StoreRedirect({ appStore, playStore }: Props) {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('stay') === '1' || params.get('noredirect') === '1') return;
    const url = storeRedirect(navigator.userAgent, { appStore, playStore }, navigator.maxTouchPoints);
    if (!url) return;
    const via = viaFrom(window.location.search);
    const android = detectPlatform(navigator.userAgent, navigator.maxTouchPoints) === 'android';
    sendSiteEvent({ kind: 'store_click', path: '/app', store: android ? 'play' : 'appstore', ...(via ? { via } : {}) });
    const go = android ? playUrlFor(url, via ?? null) : url;
    setTarget(go);
    window.location.replace(go);
  }, [appStore, playStore]);

  if (!target) return null;

  return (
    <p role="status" className="mx-auto mb-8 max-w-xl text-center text-sm text-ink-3">
      Taking you to the store…{' '}
      <a href="/app?stay=1" className="underline hover:text-ink-1">
        Stay on this page
      </a>
    </p>
  );
}
