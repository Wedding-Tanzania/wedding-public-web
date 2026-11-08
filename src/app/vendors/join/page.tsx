import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { VENDOR_LOGIN_URL, VENDOR_SIGNUP_URL } from '@/lib/site-links';

export const metadata: Metadata = {
  title: 'For wedding businesses',
  description:
    'List your wedding business free on Wedding by Lockwood. Answer quote requests from couples, confirm bookings and keep your calendar and team in one vendor portal.',
};

/**
 * What a wedding business gets from the vendor portal (vendors.wedding.co.tz).
 * Every claim maps to a portal page that calls the API today: listing,
 * leads, quotes, bookings, calendar, resources, team and the overview.
 * No prices, review or payout promises: those are not built.
 */

const categories = [
  'Photography',
  'Catering',
  'Decor',
  'Venues',
  'DJ and MC',
  'Cakes',
  'Transport',
  'Beauty',
  'Officiants',
  'Bridal wear',
];

const steps = [
  {
    title: 'Create your free account',
    body: 'Sign up in the vendor portal with your phone number or email. It takes a minute and costs nothing.',
  },
  {
    title: 'List and get verified',
    body: 'Add your category, the areas you serve, packages and photos. Our team checks the listing, then it appears in the directory.',
  },
  {
    title: 'Answer quote requests',
    body: 'Couples who find you request a quote from your profile. It lands in your leads inbox and you reply with a price.',
  },
  {
    title: 'Confirm the booking',
    body: 'When the couple accepts, confirm the booking. It goes straight onto your calendar.',
  },
];

interface Block {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  photo: string;
  photoAlt: string;
}

const blocks: Block[] = [
  {
    eyebrow: 'Leads and quotes',
    title: 'Every enquiry in one inbox',
    body: 'No more chasing couples across WhatsApp, Instagram and phone calls. Quote requests from couples arrive in one inbox with their wedding date and note, and you answer each one with a quote they can accept.',
    bullets: [
      'Every request in one list, nothing lost',
      'Send a quote from the request itself',
      'See which quotes were accepted or declined',
    ],
    photo: '/marketing/vendor-photographer.webp',
    photoAlt: 'A wedding photographer at his studio desk replying to a couple on his laptop',
  },
  {
    eyebrow: 'Bookings and calendar',
    title: 'Know which days are taken',
    body: 'Confirmed bookings fill your calendar, next to your resources: the hall, the tent, the van or the sound system. Couples can pay the deposit through Malipopay.',
    bullets: [
      'Confirm, complete or cancel a booking in one place',
      'A calendar built from your bookings and resources',
      'Deposits recorded against each booking',
    ],
    photo: '/marketing/vendor-caterer.webp',
    photoAlt: 'A caterer confirming the guest count on his phone with the bride’s mother at an outdoor wedding',
  },
];

const extras = [
  {
    title: 'Your team, with the right access',
    body: 'Invite staff as Owner, Operations Manager, Sales Officer, Calendar Coordinator or Resource Manager. Each sees what their job needs.',
  },
  {
    title: 'A business overview',
    body: 'The portal opens on an overview of your business: enquiries, quotes and bookings at a glance.',
  },
  {
    title: 'Kiswahili and English',
    body: 'Run the portal in the language your team works in.',
  },
  {
    title: 'Found by the right couples',
    body: 'Couples filter the directory by category and wedding theme, and request a quote straight from your profile.',
  },
];

const faqs: Array<{ q: string; a: string; link?: { href: string; label: string } }> = [
  {
    q: 'Who can list a business?',
    a: 'Any wedding business in Tanzania: photographers, caterers, decorators, venues, DJs and MCs, cake makers, transport, beauty, officiants and bridal wear. Your listing goes live once our team has verified it.',
  },
  {
    q: 'How do couples find me?',
    a: 'Verified businesses appear in the vendor directory at wedding.co.tz/vendors, where couples filter by category and wedding theme and request a quote from your profile. Each request lands in your leads inbox.',
  },
  {
    q: 'Can my staff use the portal too?',
    a: 'Yes. Invite them from the Team page and give each one a role, so sales staff handle enquiries and coordinators handle the calendar.',
  },
  {
    q: 'What does it cost?',
    a: 'Nothing. Creating your account, listing your business and using the vendor portal are free.',
  },
];

export default function VendorJoinPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-herb-900">
        <Image
          src="/marketing/vendors-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hidden object-cover object-[65%_center] md:block"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-gradient-to-r from-herb-900/95 via-herb-900/70 to-transparent md:block"
        />
        <div className="relative aspect-[4/5] max-h-[440px] w-full md:hidden">
          <Image
            src="/marketing/vendors-hero-mobile.webp"
            alt="A wedding decor business owner in her studio checking a new booking on her phone"
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-herb-900 to-transparent"
          />
        </div>
        <div className="relative mx-auto flex max-w-wrap items-center px-6 pb-16 pt-6 md:min-h-[620px] md:py-24 lg:px-12">
          <div className="max-w-2xl">
            <span className="eyebrow on-dark !font-mono !tracking-[0.1em]">Kwa wafanyabiashara · for vendors</span>
            <h1 className="mt-6 font-sans text-[clamp(2.3rem,5.5vw,3.6rem)] font-bold leading-[1.06] tracking-[-0.02em] text-linen text-balance">
              Your wedding business, booked and organised.
            </h1>
            <p className="mt-6 max-w-lg font-sans text-[17px] leading-relaxed text-herb-100">
              List your business free where Tanzanian couples plan their weddings. Answer quote
              requests, confirm bookings and keep your calendar and team in one vendor portal.
            </p>
            <div className="mt-9 flex flex-wrap gap-3.5">
              <Link href={VENDOR_SIGNUP_URL} className="btn bg-linen text-herb-800 hover:bg-paper">
                Create a free account
              </Link>
              <Link
                href={VENDOR_LOGIN_URL}
                className="btn text-linen ring-1 ring-inset ring-linen/60 hover:ring-linen"
              >
                Vendor log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Section tone="ivory" className="!py-20">
        <div className="max-w-2xl">
          <span className="eyebrow !font-mono !tracking-[0.1em]">How it works</span>
          <h2 className="mt-5 font-sans text-[clamp(1.9rem,4vw,2.75rem)] font-bold leading-[1.12] text-ink-1 text-balance">
            From listing to a confirmed booking.
          </h2>
        </div>
        <ol className="mt-12 grid gap-px bg-bordr sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-3 bg-linen p-7">
              <span className="font-mono text-[13px] font-bold text-herb-600">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-sans text-xl font-bold leading-tight text-ink-1">{s.title}</span>
              <span className="font-sans text-[15px] leading-relaxed text-ink-2">{s.body}</span>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap items-center gap-2.5">
          <span className="mr-2 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-3">
            Categories
          </span>
          {categories.map((c) => (
            <span
              key={c}
              className="rounded-full bg-paper px-3.5 py-1.5 font-sans text-[13px] font-semibold text-ink-2 ring-1 ring-inset ring-bordr"
            >
              {c}
            </span>
          ))}
        </div>
      </Section>

      <Section tone="paper">
        <div className="flex flex-col gap-24 lg:gap-28">
          {blocks.map((b, i) => (
            <div key={b.title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
              <div className={`relative aspect-[4/3] overflow-hidden bg-herb-100 ${i % 2 ? 'lg:order-2' : ''}`}>
                <Image src={b.photo} alt={b.photoAlt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
              </div>
              <div className={`flex flex-col items-start gap-5 ${i % 2 ? 'lg:order-1' : ''}`}>
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-herb-600">
                  {b.eyebrow}
                </span>
                <h2 className="font-sans text-[clamp(1.6rem,3vw,2.25rem)] font-bold leading-[1.15] text-ink-1 text-balance">
                  {b.title}
                </h2>
                <p className="font-sans text-base leading-relaxed text-ink-2">{b.body}</p>
                <ul className="flex flex-col gap-2.5">
                  {b.bullets.map((t) => (
                    <li key={t} className="flex gap-3 font-sans text-[15px] text-ink-1">
                      <span className="mt-[9px] h-1.5 w-1.5 flex-shrink-0 bg-herb-600" aria-hidden="true" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream" className="!py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {extras.map((e) => (
            <div key={e.title} className="flex flex-col gap-3 bg-paper p-7 ring-1 ring-inset ring-bordr">
              <span className="font-sans text-lg font-bold leading-snug text-ink-1">{e.title}</span>
              <p className="font-sans text-[15px] leading-relaxed text-ink-2">{e.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="paper" className="!py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <span className="eyebrow !font-mono !tracking-[0.1em]">Maswali · questions</span>
            <h2 className="mt-5 font-sans text-[clamp(1.7rem,3.5vw,2.4rem)] font-bold leading-[1.15] text-ink-1">
              For vendors
            </h2>
          </div>
          <div className="divide-y divide-bordr border-y border-bordr">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-sans text-[17px] font-semibold text-ink-1 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <svg
                    aria-hidden="true"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    className="flex-shrink-0 text-herb-600 transition-transform group-open:rotate-90"
                  >
                    <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </summary>
                <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink-2">
                  {f.a}
                  {f.link && (
                    <>
                      {' '}
                      <Link href={f.link.href} className="font-semibold text-herb-700 underline underline-offset-4">
                        {f.link.label}
                      </Link>
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      <section className="bg-herb-800 px-6 py-20 lg:px-12 lg:py-24">
        <div className="mx-auto flex max-w-wrap flex-col items-start gap-8">
          <h2 className="max-w-2xl font-sans text-[clamp(1.9rem,4vw,2.75rem)] font-bold leading-[1.12] text-linen text-balance">
            Ready when the next couple is looking for you.
          </h2>
          <div className="flex flex-wrap gap-3.5">
            <Link href={VENDOR_SIGNUP_URL} className="btn bg-linen text-herb-800 hover:bg-paper">
              Create a free account
            </Link>
            <Link href="/vendors" className="btn text-linen ring-1 ring-inset ring-linen/60 hover:ring-linen">
              See the directory
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
