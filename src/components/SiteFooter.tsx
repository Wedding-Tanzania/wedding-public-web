import Link from 'next/link';

const cols = [
  {
    title: 'Plan',
    links: [
      { href: '/features', label: 'Features' },
      { href: '/vendors', label: 'Vendor directory' },
      { href: '/testimonials', label: 'Real weddings' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'For vendors',
    links: [
      { href: '/vendors/join', label: 'Become a vendor' },
      { href: 'https://vendors.wedding.co.tz', label: 'Vendor portal' },
      { href: '/contact?topic=vendor', label: 'Sales enquiry' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/about#story', label: 'Our story' },
      { href: '/contact', label: 'Contact' },
      { href: '/press', label: 'Press' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/security', label: 'Security' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-blush-900 text-blush-200 mt-32">
      <div className="max-w-wrap mx-auto px-6 lg:px-12 pt-20 pb-12">
        <div className="grid lg:grid-cols-[1.4fr_repeat(4,1fr)] gap-10">
          <div>
            <div className="font-display italic text-3xl text-blush-50">Wedding</div>
            <div className="text-[10px] uppercase tracking-widest3 text-blush-300 mt-1">
              by Lockwood
            </div>
            <p className="font-display italic text-lg text-blush-200 mt-6 max-w-xs leading-relaxed">
              For the day that begins a lifetime together. Built in Dar es Salaam, made for East
              Africa.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <div className="text-[10px] uppercase tracking-widest3 text-blush-400">
                {col.title}
              </div>
              <ul className="mt-4 space-y-3 text-sm text-blush-200">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-blush-50">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-blush-800 mt-16 pt-8 flex flex-wrap items-center justify-between gap-4 text-[11px] uppercase tracking-widest3 text-blush-400">
          <div>© {new Date().getFullYear()} Lockwood Technology Tanzania</div>
          <div className="font-display italic normal-case tracking-normal text-blush-300 text-base">
            Payments powered by Malipopay
          </div>
        </div>
      </div>
    </footer>
  );
}
