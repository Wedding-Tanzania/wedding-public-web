import type { Metadata } from 'next';
import { STR } from '@/lib/invite/wcz';

export const metadata: Metadata = {
  title: 'Wedding app',
  description: 'The Wedding by Lockwood app: your programme, card and contributions on your phone.',
};

/**
 * The smart link every invitation message carries (https://wedding.co.tz/app).
 * The store badges stay marked "coming soon" until the App Store and Play
 * listings are public; until then the page says the invitation works in the
 * browser, so nobody is sent hunting for a TestFlight build.
 */
const STORES = {
  appStore: null as string | null,
  playStore: null as string | null,
};

function Badge({ label, sub, href, soon }: { label: string; sub: string; href: string | null; soon: string }) {
  const inner = (
    <span className="flex flex-col items-start leading-tight">
      <span className="text-[10px] uppercase tracking-[0.12em] opacity-80">{href === null ? soon : sub}</span>
      <span className="text-lg font-semibold">{label}</span>
    </span>
  );
  return href === null ? (
    <span aria-disabled className="flex min-w-[180px] items-center justify-center rounded border border-ink-4 px-5 py-3 text-ink-3">
      {inner}
    </span>
  ) : (
    <a href={href} className="flex min-w-[180px] items-center justify-center rounded bg-ink-1 px-5 py-3 text-paper hover:bg-herb-800">
      {inner}
    </a>
  );
}

export default function AppPage() {
  const sw = STR.sw;
  const en = STR.en;
  return (
    <main className="bg-linen px-6 py-20">
      <div className="mx-auto max-w-xl text-center">
        <div className="eyebrow justify-center">Wedding by Lockwood</div>
        <h1 className="mt-4 font-sans text-4xl font-light text-herb-900">{sw.getApp}</h1>
        <p className="mt-2 font-sans text-xl font-light text-ink-2">{en.getApp}</p>
        <p className="mt-6 text-ink-2">{sw.getAppNote}</p>
        <p className="mt-1 text-sm text-ink-3">{en.getAppNote}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Badge label={sw.appStore} sub="Download on the" href={STORES.appStore} soon={`${sw.comingSoon} · ${en.comingSoon}`} />
          <Badge label={sw.playStore} sub="Get it on" href={STORES.playStore} soon={`${sw.comingSoon} · ${en.comingSoon}`} />
        </div>
        <div className="mt-10 rounded-lg border border-bordr bg-paper p-6 text-left">
          <p className="text-ink-1">{sw.appPageNote}</p>
          <p className="mt-2 text-sm text-ink-3">{en.appPageNote}</p>
          <p className="mt-4 text-ink-1">{sw.appOpenInvite}</p>
          <p className="mt-1 text-sm text-ink-3">{en.appOpenInvite}</p>
        </div>
      </div>
    </main>
  );
}
