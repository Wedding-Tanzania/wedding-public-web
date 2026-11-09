'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isCountedPath, sendSiteEvent, viaFrom } from '@/lib/site-events';

/**
 * Counts a view of each marketing page (not the couples' wedding pages), with
 * the campaign link that brought the visitor when the address names one. No
 * cookie and nothing about the visitor: see lib/site-events.
 */
export function SiteBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || !isCountedPath(pathname)) return;
    const via = viaFrom(window.location.search);
    sendSiteEvent({ kind: 'page_view', path: pathname, ...(via ? { via } : {}) });
  }, [pathname]);
  return null;
}
