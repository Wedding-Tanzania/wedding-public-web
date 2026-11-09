import type { Metadata } from 'next';
import Link from 'next/link';
import { isCampaignSlug } from '@/lib/site-events';
import { START_URL } from '@/lib/site-links';
import { APP_STORE_URL, PLAY_STORE_URL, openInBrowserHref } from '@/lib/store-links';
import { StoreBadges } from './StoreBadges';
import { StoreRedirect } from './StoreRedirect';

export const metadata: Metadata = {
  title: 'Download the app',
  description:
    'Get the Wedding by Lockwood app on Google Play: plan the wedding with your kamati, or keep your invitation, the programme and your contribution on your phone.',
};

/**
 * The link every invitation message carries (wedding.co.tz/app), and where
 * campaign links land (/app?via=<slug>). Android phones are sent straight to
 * Google Play (see StoreRedirect); iPhones stay here while the App Store
 * version is on its way, and anyone can carry on in the browser.
 */

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function AppPage({ searchParams }: { searchParams?: SearchParams }) {
  const browserHref = openInBrowserHref(first(searchParams?.next));
  const viaRaw = first(searchParams?.via)?.toLowerCase();
  const via = isCampaignSlug(viaRaw) ? viaRaw : undefined;
  const iosLive = APP_STORE_URL !== null;

  return (
    <main className="bg-linen px-4 py-16 sm:px-6 sm:py-20">
      <StoreRedirect appStore={APP_STORE_URL} playStore={PLAY_STORE_URL} />
      <div className="mx-auto max-w-xl text-center">
        <div className="eyebrow justify-center !font-mono !tracking-[0.1em]">Wedding by Lockwood</div>
        <h1 className="mt-5 font-sans text-[clamp(2.2rem,6vw,3rem)] font-bold leading-[1.1] tracking-[-0.02em] text-ink-1">
          Download the Wedding app
        </h1>
        <p className="mx-auto mt-5 max-w-md font-sans text-[17px] leading-relaxed text-ink-2">
          Plan the wedding with your kamati, or keep your invitation, the programme and your
          contribution on your phone.
        </p>

        <div className="mt-10">
          <StoreBadges appStore={APP_STORE_URL} playStore={PLAY_STORE_URL} {...(via ? { via } : {})} />
        </div>

        {!iosLive && (
          <p className="mt-5 font-sans text-sm text-ink-3">
            On an iPhone? The App Store version is on its way. Until then, everything works in your
            browser.
          </p>
        )}

        <div className="mt-8">
          <a href={browserHref} className="btn btn-outline w-full justify-center sm:w-auto">
            Continue in the browser
          </a>
        </div>

        <div className="mt-12 grid gap-4 text-left sm:grid-cols-2">
          <div className="bg-paper p-6 ring-1 ring-inset ring-bordr">
            <p className="font-sans text-base font-bold text-ink-1">Got an invitation?</p>
            <p className="mt-2 font-sans text-[15px] leading-relaxed text-ink-2">
              Open it from the link in your SMS or WhatsApp message. It works in any browser, with
              no app needed.
            </p>
          </div>
          <div className="bg-paper p-6 ring-1 ring-inset ring-bordr">
            <p className="font-sans text-base font-bold text-ink-1">Planning a wedding?</p>
            <p className="mt-2 font-sans text-[15px] leading-relaxed text-ink-2">
              Use the app, or start on the web and invite your kamati.{' '}
              <Link href={START_URL} className="font-semibold text-herb-700 underline underline-offset-4">
                Start planning
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
