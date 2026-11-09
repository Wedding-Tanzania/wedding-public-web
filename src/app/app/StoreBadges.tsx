'use client';
import { sendSiteEvent, type Store } from '@/lib/site-events';
import { playUrlFor } from '@/lib/store-links';

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function AndroidIcon({ className }: { className?: string }) {
  // Robot head: a dome with two antennae and two eyes cut out of the dome.
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M3.5 17.5a8.5 8.5 0 0 1 17 0zM8.6 14.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4zm6.8 0a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z"
      />
      <path d="M7.3 10.1 5.4 6.9M16.7 10.1l1.9-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

interface BadgeProps {
  icon: React.ReactNode;
  small: string;
  large: string;
  href: string | null;
  soon: string;
  store: Store;
  via?: string;
}

/** A store badge; a live one counts its tap (credited to the campaign) before the store opens. */
function StoreBadge({ icon, small, large, href, soon, store, via }: BadgeProps) {
  const inner = (
    <>
      <span className="shrink-0">{icon}</span>
      <span className="flex flex-col items-start text-left leading-none">
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] opacity-80">{href ? small : soon}</span>
        <span className="mt-1 text-xl font-semibold leading-none">{large}</span>
      </span>
    </>
  );
  const base = 'inline-flex h-16 w-full items-center gap-3 rounded px-4 sm:w-auto sm:min-w-[220px]';
  return href ? (
    <a
      href={href}
      rel="noopener"
      onClick={() => sendSiteEvent({ kind: 'store_click', path: '/app', store, ...(via ? { via } : {}) })}
      className={`${base} bg-ink-1 text-paper transition hover:bg-herb-800`}
    >
      {inner}
    </a>
  ) : (
    <span aria-disabled="true" className={`${base} border border-ink-4 bg-paper/60 text-ink-3`}>
      {inner}
    </span>
  );
}

export function StoreBadges({
  appStore,
  playStore,
  via,
}: {
  appStore: string | null;
  playStore: string | null;
  via?: string;
}) {
  return (
    <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
      <StoreBadge
        icon={<AndroidIcon className="h-8 w-8" />}
        small="Get it on"
        large="Google Play"
        href={playStore === null ? null : playUrlFor(playStore, via ?? null)}
        soon="Coming soon to"
        store="play"
        {...(via ? { via } : {})}
      />
      <StoreBadge
        icon={<AppleIcon className="h-8 w-8" />}
        small="Download on the"
        large="App Store"
        href={appStore}
        soon="Coming soon to the"
        store="appstore"
        {...(via ? { via } : {})}
      />
    </div>
  );
}
