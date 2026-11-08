'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Wordmark } from './Wordmark';
import { LOGIN_URL, START_URL } from '@/lib/site-links';

const navItems = [
  { href: '/#how', label: 'How it works' },
  { href: '/features', label: 'Features' },
  { href: '/#michango', label: 'Michango' },
  { href: '/app', label: 'The app' },
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
          <Link href={LOGIN_URL} className="btn btn-outline !py-3 !px-5 !text-[11px]">
            Log in
          </Link>
          <Link href={START_URL} className="btn btn-primary !py-3 !px-5 !text-[11px]">
            Start planning
          </Link>
        </div>
        <button
          className="md:hidden text-herb-700"
          aria-label="Open menu"
          aria-expanded={open}
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
              href={LOGIN_URL}
              className="btn btn-outline !py-3 mt-2 justify-center"
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>
            <Link
              href={START_URL}
              className="btn btn-primary !py-3 justify-center"
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
