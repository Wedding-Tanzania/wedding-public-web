'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Wordmark } from './Wordmark';

const navItems = [
  { href: '/vendors', label: 'Vendors' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/testimonials', label: 'Stories' },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-linen/80 backdrop-blur border-b border-bordr">
      <div className="max-w-wrap mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
        <Link href="/" aria-label="Wedding by Lockwood home">
          <Wordmark tone="dark" />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-[12px] uppercase tracking-widest font-medium text-ink-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-herb-700">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link href="https://app.wedding.co.tz" className="btn btn-outline !py-3 !px-5 !text-[11px]">
            Log in
          </Link>
          <Link href="/contact" className="btn btn-primary !py-3 !px-5 !text-[11px]">
            Start planning
          </Link>
        </div>
        <button
          className="md:hidden text-herb-700"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-bordr bg-paper">
          <div className="px-6 py-4 flex flex-col gap-3 text-sm text-ink-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="btn btn-primary !py-3 mt-2 justify-center"
              onClick={() => setOpen(false)}
            >
              Start planning
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
