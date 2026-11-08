import Link from 'next/link';
import { Wordmark } from './Wordmark';
import { DEMO_STORY_URL, START_URL } from '@/lib/site-links';

const cols = [
  {
    title: 'Platform',
    links: [
      { href: '/#how', label: 'How it works' },
      { href: '/features', label: 'Features' },
      { href: '/app', label: 'The app' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Kamati',
    links: [
      { href: START_URL, label: 'Create your wedding' },
      { href: '/features#kamati', label: 'Plan with your kamati' },
      { href: '/features#michango', label: 'Michango' },
      { href: DEMO_STORY_URL, label: 'Sample wedding page' },
    ],
  },
  {
    title: 'Vendors',
    links: [
      { href: '/vendors', label: 'Vendors' },
      { href: '/vendors/join', label: 'Join as vendor' },
      { href: 'https://vendors.wedding.co.tz', label: 'Vendor portal' },
      { href: '/press', label: 'Resources' },
    ],
  },
  {
    title: 'Lockwood',
    links: [
      { href: '/about', label: 'About' },
      { href: '/press', label: 'Press' },
      { href: '/contact', label: 'Contact' },
      { href: '/security', label: 'Security' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/delete-account', label: 'Delete account' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-linen text-ink-2 border-t border-bordr">
      <div className="max-w-wrap mx-auto px-6 lg:px-12 pt-20 pb-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Wordmark tone="dark" />
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <div className="font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-ink-3">
                {col.title}
              </div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={`${col.title}-${l.href}-${l.label}`}>
                    <Link
                      href={l.href}
                      className="font-sans font-semibold text-[13px] text-ink-2 hover:text-ink-1"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 font-mono text-[9px] font-medium uppercase tracking-[0.04em] text-ink-3">
          <div>Wedding by Lockwood · built on Malipopay rails · Dar es Salaam</div>
          <div>© {new Date().getFullYear()} Lockwood Technology Tanzania</div>
        </div>
      </div>
    </footer>
  );
}
