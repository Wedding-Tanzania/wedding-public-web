import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Wedding.co.tz - Plan your Tanzanian wedding',
    template: '%s | Wedding.co.tz',
  },
  description:
    'Find wedding vendors, build your wedding story page, and collect contributions with M-Pesa Changisha and Mixx by YAS Mchango. Built in Tanzania.',
  openGraph: {
    type: 'website',
    locale: 'en_TZ',
    siteName: 'Wedding.co.tz',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-secondary antialiased">{children}</body>
    </html>
  );
}
