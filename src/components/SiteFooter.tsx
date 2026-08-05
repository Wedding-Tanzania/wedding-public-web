import Link from 'next/link';
import { Wordmark } from './Wordmark';

const cols = [
  {
    title: 'Platform',
    links: [
      { href: '/features', label: 'Features' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/vendors', label: 'Vendors' },
      { href: '/testimonials', label: 'Stories' },
    ],
  },
  {
    title: 'Kamati',
    links: [
      { href: '/contact', label: 'Create wedding' },
      { href: '/features', label: 'Join committee' },
      { href: '/features#michango', label: 'Michango guide' },
    ],
  },
  {
    title: 'Vendors',
    links: [
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
