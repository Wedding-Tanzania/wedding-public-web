import type { Metadata } from 'next';
import './globals.css';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: {
    default: 'Wedding by Lockwood — Plan your perfect day',
    template: '%s | Wedding by Lockwood',
  },
  description:
    "East Africa's dedicated wedding planning platform — verified vendors, bookings, budget, guest list, and a personalised wedding website. One place, every stage.",
  openGraph: {
    type: 'website',
    locale: 'en_TZ',
    siteName: 'Wedding by Lockwood',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-linen text-ink-1 min-h-screen antialiased font-sans">
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
