import type { Metadata, Viewport } from 'next';
import { Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

// CLAUDE.md notes JetBrains Mono has no SemiBold; we substitute Bold where 600 was used.
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
  weight: ['400', '500', '700'],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://wedding.co.tz';

const SITE_DESCRIPTION =
  "East Africa's dedicated wedding planning platform. Verified vendors, bookings, budget, guest list, and a personalised wedding website. One place, every stage.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Wedding by Lockwood · Plan your perfect day',
    template: '%s | Wedding by Lockwood',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'Wedding by Lockwood',
  authors: [{ name: 'Lockwood Technology Tanzania', url: SITE_URL }],
  keywords: [
    'wedding tanzania',
    'wedding planning',
    'east africa wedding',
    'wedding vendors',
    'wedding budget',
    'changisha',
    'mchango',
    'lipa namba',
    'malipopay',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_TZ',
    siteName: 'Wedding by Lockwood',
    url: '/',
    title: 'Wedding by Lockwood · Plan your perfect day',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wedding by Lockwood',
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  themeColor: '#4F6A42',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrains.variable}`}>
      <body className="bg-linen text-ink-1 min-h-screen antialiased font-sans">
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
