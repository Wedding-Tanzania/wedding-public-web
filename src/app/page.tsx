import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { FeatureBlock, features } from '@/components/marketing/features';
import { MoreFeatures } from '@/components/marketing/MoreFeatures';
import { START_URL } from '@/lib/site-links';

export const metadata: Metadata = {
  title: { absolute: 'Wedding by Lockwood · Plan the day. Track every shilling.' },
  description:
    'Guests, invitation cards, michango by mobile money, the budget and your kamati, together in one app. Built for weddings in Tanzania.',
};

export default function HomePage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Features />
      <More />
      <BuiltForTanzania />
      <Trust />
      <Faq />
      <ClosingCta />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-herb-900">
      <Image
        src="/marketing/hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hidden object-cover object-[70%_center] md:block"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-gradient-to-r from-herb-900/95 via-herb-900/70 to-transparent md:block"
      />
      <div className="relative aspect-[4/5] max-h-[440px] w-full md:hidden">
        <Image
          src="/marketing/hero-mobile.webp"
          alt="A bride and groom at their garden reception while a guest sends a gift from her phone"
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
      <div className="relative mx-auto flex max-w-wrap items-center px-6 pb-16 pt-6 md:min-h-[680px] md:py-28 lg:px-12">
        <div className="max-w-2xl">
          <span className="eyebrow on-dark !font-mono !tracking-[0.1em]">Harusi · michango · kamati</span>
          <h1 className="mt-6 font-sans text-[clamp(2.4rem,6vw,4rem)] font-bold leading-[1.05] tracking-[-0.02em] text-linen text-balance">
            Plan the day.
            <br />
            Track every shilling.
          </h1>
          <p className="mt-6 max-w-lg font-sans text-[17px] leading-relaxed text-herb-100">
            Guests, invitation cards, michango by mobile money, the budget and your kamati,
            together in one app. Built for weddings in Tanzania.
          </p>
          <div className="mt-9 flex flex-wrap gap-3.5">
            <Link href={START_URL} className="btn bg-linen text-herb-800 hover:bg-paper">
              Start planning
            </Link>
            <Link
              href="/app"
              className="btn text-linen ring-1 ring-inset ring-linen/60 hover:ring-linen"
            >
              Get the app
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    title: 'Create your wedding',
    body: 'Add the date and venue, set the budget, and invite your kamati to join you.',
  },
  {
    title: 'Send cards, collect michango',
    body: 'Each guest gets their own card by SMS or WhatsApp. Pledges and mobile-money payments land in one ledger.',
  },
  {
    title: 'Welcome everyone on the day',
    body: 'Ushers scan the QR on each card at the gate, and wishes play on the live wall.',
  },
];

function HowItWorks() {
  return (
    <Section tone="ivory" className="scroll-mt-20 !py-20" >
      <div id="how" className="scroll-mt-28">
        <div className="max-w-2xl">
          <span className="eyebrow !font-mono !tracking-[0.1em]">How it works</span>
          <h2 className="mt-5 font-sans text-[clamp(1.9rem,4vw,2.75rem)] font-bold leading-[1.12] text-ink-1 text-balance">
            From the first kamati meeting to the last guest through the gate.
          </h2>
        </div>
        <ol className="mt-12 grid gap-px bg-bordr sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-3 bg-linen p-7 sm:first:pl-0">
              <span className="font-mono text-[13px] font-bold text-herb-600">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-sans text-xl font-bold leading-tight text-ink-1">{s.title}</span>
              <span className="font-sans text-[15px] leading-relaxed text-ink-2">{s.body}</span>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

function Features() {
  return (
    <Section tone="paper">
      <div className="mb-16 max-w-2xl">
        <span className="eyebrow !font-mono !tracking-[0.1em]">What you get</span>
        <h2 className="mt-5 font-sans text-[clamp(1.9rem,4vw,2.75rem)] font-bold leading-[1.12] text-ink-1 text-balance">
          Everything the wedding needs, in one place.
        </h2>
      </div>
      <div className="flex flex-col gap-28 lg:gap-32">
        {features.map((f, i) => (
          <FeatureBlock key={f.id} feature={f} index={i} />
        ))}
      </div>
    </Section>
  );
}

function More() {
  return (
    <Section tone="cream">
      <MoreFeatures />
    </Section>
  );
}

const pillars = [
  {
    title: 'The kamati is built in',
    body: 'Weddings here are planned by a committee, so the app is too: shared tasks, one ledger, the couple approves.',
  },
  {
    title: 'Mobile money, not cards',
    body: 'Michango come in by M-Pesa, Mixx by Yas and Airtel Money, and cash is recorded next to them.',
  },
  {
    title: 'Made for WhatsApp and SMS',
    body: 'Cards, reminders and the wedding page are sent the way your guests already talk.',
  },
  {
    title: 'No app needed for guests',
    body: 'Guests open their card and your wedding page in the browser, answer RSVP and leave wishes.',
  },
];

function BuiltForTanzania() {
  return (
    <Section tone="ink">
      <div className="max-w-2xl">
        <span className="eyebrow on-dark !font-mono !tracking-[0.1em]">Imetengenezwa Tanzania</span>
        <h2 className="mt-5 font-sans text-[clamp(1.9rem,4vw,2.75rem)] font-bold leading-[1.12] text-linen text-balance">
          Built for the way Tanzanian weddings really happen.
        </h2>
      </div>
      <div className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2">
        {pillars.map((p) => (
          <div key={p.title} className="border-t border-herb-700 pt-6">
            <div className="font-sans text-xl font-bold text-linen">{p.title}</div>
            <p className="mt-2 font-sans text-[15px] leading-relaxed text-herb-200">{p.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

const rails = [
  { label: 'M-Pesa', dot: 'bg-rails-mpesa' },
  { label: 'Mixx by Yas', dot: 'bg-rails-tigo' },
  { label: 'Airtel Money', dot: 'bg-rails-airtel' },
  { label: 'Cash, recorded', dot: 'bg-herb-600' },
];

function Trust() {
  return (
    <Section tone="cream" className="!py-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col items-start gap-5">
          <span className="eyebrow !font-mono !tracking-[0.1em]">Money you can trust</span>
          <h2 className="font-sans text-[clamp(1.7rem,3.5vw,2.4rem)] font-bold leading-[1.15] text-ink-1 text-balance">
            Every contribution accounted for.
          </h2>
          <p className="max-w-xl font-sans text-base leading-relaxed text-ink-2">
            Michango are paid through Malipopay, a Tanzanian payment gateway, and each payment is
            matched to the person who sent it. Wedding by Lockwood takes no fee from a
            contribution. Your guest list and your money records belong to you.
          </p>
          <div className="flex flex-wrap gap-4 font-sans text-sm font-semibold">
            <Link href="/privacy" className="text-herb-700 underline decoration-herb-300 underline-offset-4 hover:decoration-herb-700">
              Privacy policy
            </Link>
            <Link href="/security" className="text-herb-700 underline decoration-herb-300 underline-offset-4 hover:decoration-herb-700">
              Security
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-3 bg-paper p-7 ring-1 ring-inset ring-bordr">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-3">
            Michango by
          </span>
          <div className="flex flex-wrap gap-2.5">
            {rails.map((r) => (
              <span key={r.label} className="rail-chip !text-[13px]">
                <span className={`dot ${r.dot}`} />
                {r.label}
              </span>
            ))}
          </div>
          <span className="mt-2 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-herb-600">
            Powered by Malipopay
          </span>
        </div>
      </div>
    </Section>
  );
}

const faqs = [
  {
    q: 'Do our guests need to install the app?',
    a: 'No. Guests get their card by SMS or WhatsApp and open it, and your wedding page, in any browser. There they can answer RSVP, send michango and leave a wish. The app is for the couple and the kamati.',
  },
  {
    q: 'How do guests send michango?',
    a: 'By mobile money: M-Pesa, Mixx by Yas or Airtel Money. Each payment is matched to the guest who sent it. Cash handed to the treasurer can be recorded in the same ledger.',
  },
  {
    q: 'Can the whole kamati use it?',
    a: 'Yes. The couple invites the kamati members, and each one signs in with their own account and works from the same tasks, guest list and ledger.',
  },
  {
    q: 'What is the wedding page?',
    a: 'A page at wedding.co.tz with your names, your story, the order of the day, the dress code, directions and RSVP. Guests can leave wishes with photos, and the live wish wall shows them on a screen at the reception.',
  },
  {
    q: 'How do I delete my account?',
    a: 'In the app go to Settings, then Delete account, or ask us on the delete account page.',
    link: { href: '/delete-account', label: 'Delete account page' },
  },
];

function Faq() {
  return (
    <Section tone="paper" className="!py-20">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <span className="eyebrow !font-mono !tracking-[0.1em]">Maswali · questions</span>
          <h2 className="mt-5 font-sans text-[clamp(1.7rem,3.5vw,2.4rem)] font-bold leading-[1.15] text-ink-1">
            Good to know
          </h2>
          <p className="mt-4 font-sans text-[15px] text-ink-2">
            Anything else?{' '}
            <Link href="/contact" className="font-semibold text-herb-700 underline underline-offset-4">
              Contact us
            </Link>
            .
          </p>
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
  );
}

function ClosingCta() {
  return (
    <section className="bg-herb-800 px-6 py-20 lg:px-12 lg:py-24">
      <div className="mx-auto flex max-w-wrap flex-col items-start gap-8">
        <h2 className="max-w-2xl font-sans text-[clamp(1.9rem,4vw,2.75rem)] font-bold leading-[1.12] text-linen text-balance">
          Panga harusi pamoja. Start with your kamati today.
        </h2>
        <div className="flex flex-wrap gap-3.5">
          <Link href={START_URL} className="btn bg-linen text-herb-800 hover:bg-paper">
            Start planning
          </Link>
          <Link href="/app" className="btn text-linen ring-1 ring-inset ring-linen/60 hover:ring-linen">
            Get the app
          </Link>
        </div>
      </div>
    </section>
  );
}
