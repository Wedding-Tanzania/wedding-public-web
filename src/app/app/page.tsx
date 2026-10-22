import type { Metadata } from 'next';
import { STR } from '@/lib/invite/wcz';
import { APP_STORE_URL, PLAY_STORE_URL, openInBrowserHref } from '@/lib/store-links';
import { StoreRedirect } from './StoreRedirect';

export const metadata: Metadata = {
  title: 'Wedding app',
  description: 'The Wedding by Lockwood app: your programme, card and contributions on your phone.',
};

/**
 * The smart link every invitation message carries (https://wedding.co.tz/app).
 * Phones are sent straight to their store (see StoreRedirect); everyone else
 * sees the two store badges and the "open in browser" path. The Google Play
 * badge stays in its "coming soon" state until NEXT_PUBLIC_PLAY_STORE_URL is
 * set, since the Play listing is not live yet.
 */

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

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
      <path
        d="M7.3 10.1 5.4 6.9M16.7 10.1l1.9-3.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

interface BadgeProps {
  icon: React.ReactNode;
  small: string;
  large: string;
  href: string | null;
  soon: string;
}

function StoreBadge({ icon, small, large, href, soon }: BadgeProps) {
  const inner = (
    <>
      <span className="shrink-0">{icon}</span>
      <span className="flex flex-col items-start text-left leading-none">
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] opacity-80">{href ? small : soon}</span>
        <span className="mt-1 text-xl font-semibold leading-none">{large}</span>
      </span>
    </>
  );
  const base = 'inline-flex h-16 w-full items-center gap-3 rounded px-4 sm:w-auto sm:min-w-[200px]';
  return href ? (
    <a href={href} rel="noopener" className={`${base} bg-ink-1 text-paper transition hover:bg-herb-800`}>
      {inner}
    </a>
  ) : (
    <span aria-disabled="true" className={`${base} border border-ink-4 bg-paper/60 text-ink-3`}>
      {inner}
    </span>
  );
}

export default function AppPage({ searchParams }: { searchParams?: SearchParams }) {
  const sw = STR.sw;
  const en = STR.en;
  const browserHref = openInBrowserHref(first(searchParams?.next));

  return (
    <main className="bg-linen px-4 py-16 sm:px-6 sm:py-20">
      <StoreRedirect appStore={APP_STORE_URL} playStore={PLAY_STORE_URL} />
      <div className="mx-auto max-w-xl text-center">
        <div className="eyebrow justify-center">Wedding by Lockwood</div>
        <h1 className="mt-4 font-sans text-4xl font-light text-herb-900">{sw.getApp}</h1>
        <p className="mt-2 font-sans text-xl font-light text-ink-2">{en.getApp}</p>
        <p className="mt-6 text-ink-2">{sw.getAppNote}</p>
        <p className="mt-1 text-sm text-ink-3">{en.getAppNote}</p>

        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <StoreBadge
            icon={<AppleIcon className="h-8 w-8" />}
            small={`${sw.downloadOn} / ${en.downloadOn}`}
            large={en.appStore}
            href={APP_STORE_URL}
            soon={`${sw.comingSoon} / ${en.comingSoon}`}
          />
          <StoreBadge
            icon={<AndroidIcon className="h-8 w-8" />}
            small={`${sw.getItOn} / ${en.getItOn}`}
            large={en.playStore}
            href={PLAY_STORE_URL}
            soon={`${sw.comingSoon} / ${en.comingSoon}`}
          />
        </div>

        <div className="mt-6">
          <a href={browserHref} className="btn btn-outline w-full justify-center sm:w-auto">
            {sw.openInBrowser} / {en.openInBrowser}
          </a>
        </div>

        <div className="mt-10 rounded-lg border border-bordr bg-paper p-6 text-left">
          <p className="text-ink-1">{sw.appAvailableNote}</p>
          <p className="mt-2 text-sm text-ink-3">{en.appAvailableNote}</p>
          <p className="mt-4 text-ink-1">{sw.appOpenInvite}</p>
          <p className="mt-1 text-sm text-ink-3">{en.appOpenInvite}</p>
        </div>
      </div>
    </main>
  );
}
