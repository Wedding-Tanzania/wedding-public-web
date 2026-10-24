'use client';
import { useEffect, useState } from 'react';
import { STR } from '@/lib/invite/wcz';
import { storeRedirect } from '@/lib/store-links';

interface Props {
  appStore: string | null;
  playStore: string | null;
}

/**
 * Sends phones straight to their store on mount: iPhone and iPad to the App
 * Store, Android to Google Play once that listing is live. Desktop stays on
 * the page, and ?stay=1 (or ?noredirect=1) keeps any device on the page.
 */
export function StoreRedirect({ appStore, playStore }: Props) {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('stay') === '1' || params.get('noredirect') === '1') return;
    const url = storeRedirect(navigator.userAgent, { appStore, playStore }, navigator.maxTouchPoints);
    if (!url) return;
    setTarget(url);
    window.location.replace(url);
  }, [appStore, playStore]);

  if (!target) return null;

  return (
    <p role="status" className="mx-auto mb-8 max-w-xl text-center text-sm text-ink-3">
      {STR.sw.redirectingToStore} {STR.en.redirectingToStore}{' '}
      <a href="/app?stay=1" className="underline hover:text-ink-1">
        {STR.sw.stayHere} / {STR.en.stayHere}
      </a>
    </p>
  );
}
