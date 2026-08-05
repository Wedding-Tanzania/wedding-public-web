import Link from 'next/link';
import { Section, SectionHead } from '@/components/Section';

export const metadata = {
  title: 'Become a vendor',
  description:
    'Apply to list your wedding business on Wedding by Lockwood. Verified profile, real leads, daily payouts.',
};

const steps: Array<{ t: string; b: string }> = [
  { t: 'Create your profile', b: 'Business name, category, service areas, portfolio photos, theme tags, packages.' },
  { t: 'Get verified',        b: 'Our team reviews your profile and supporting documents (most approvals in 48 hours).' },
  { t: 'Receive leads',       b: 'Couples enquire through your profile. Every enquiry lands in your unified inbox.' },
  { t: 'Quote, book, get paid', b: 'Send quotes, accept bookings, and collect deposits via Malipopay. Funds settle daily.' },
];

const pricingTiers: Array<{ name: string; price: string; cadence: string; highlight: boolean; perks: string[] }> = [
  {
    name: 'Starter',
    price: 'Free',
    cadence: 'For new businesses',
    highlight: false,
    perks: ['Verified listing', 'Up to 6 portfolio photos', 'Lead inbox', 'Per-booking commission'],
  },
  {
    name: 'Studio',
    price: 'TSh 49,000',
    cadence: 'Per month',
    highlight: true,
    perks: ['Everything in Starter', 'Unlimited portfolio', 'Featured placement in two categories', 'Reduced commission', 'Booking calendar'],
  },
  {
    name: 'House',
    price: 'TSh 149,000',
    cadence: 'Per month',
    highlight: false,
    perks: ['Everything in Studio', 'Homepage editorial rotation', 'Lowest commission tier', 'Dedicated account manager', 'API access'],
  },
];

const testimonials: Array<{ quote: string; who: string; sub: string }> = [
  {
    quote:
      'I went from cold WhatsApp leads to a booked diary in eight weeks. The lead inbox is the whole game.',
    who: 'Faraja Mwakatumbula',
    sub: 'Founder, Kilima Gardens Estate',
  },
  {
    quote:
      'The verification process took 36 hours and the badge changes how couples message me. I quote less, I book more.',
    who: 'Eunice Mushi',
    sub: 'Mushi Studios · Photography',
  },
  {
    quote:
      'Settlement is the next morning. After ten years of chasing balances on event day, this alone was worth signing up.',
    who: 'Joseph Komba',
    sub: 'Komba Catering',
  },
];

const faqs: Array<{ q: string; a: string }> = [
  {
    q: 'Who can apply?',
    a: 'Any registered wedding-industry business operating in Tanzania (or in markets we have launched in). You will need to share business registration and tax identification documents during verification.',
  },
  {
    q: 'How long does verification take?',
    a: 'Most profiles are reviewed within 48 hours of submission. We may ask for one round of clarifications. Once approved, your profile goes live the same day.',
  },
  {
    q: 'How are leads delivered?',
    a: 'Couples enquire through your profile page. Enquiries land in your unified inbox in the vendor portal, with a push notification on the mobile app. You can reply, quote, and book all in one thread.',
  },
  {
    q: 'How does payment work?',
    a: 'Couples pay deposits and balances through Malipopay using M-Pesa, Mixx by Yas, Airtel Money, Halotel, TTCL Pesa, CRDB, or NMB. Funds settle daily into your nominated mobile money or bank account, less the per-booking commission on your tier.',
  },
  {
    q: 'Is there an escrow option?',
    a: 'Yes. For event-day vendor payments, couples can choose "escrow on" at checkout. Funds sit in a Lockwood-managed escrow account at the partner bank and release 24 hours after the event. Refunds within that window are processed inside 24 hours of an upheld dispute.',
  },
  {
    q: 'Can I list in more than one category?',
    a: 'Yes, although we recommend leading with the category that drives the most enquiries. The Studio and House tiers include featured placement in up to two categories.',
  },
  {
    q: 'What does verification check?',
    a: 'Active business registration, tax identification, identity of the primary contact, recent client testimonials, and a baseline portfolio review for category fit.',
  },
  {
    q: 'Can I leave the platform later?',
    a: 'Yes. You can pause or close your listing at any time from your settings. We retain transaction records for the period required by Tanzanian tax and AML rules.',
  },
];

export default function VendorJoinPage() {
  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="eyebrow justify-center">For vendors</div>
          <h1 className="mt-4 font-sans font-light text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-tight text-herb-900">
            Put your work
            <br />
            <em className="not-italic font-extrabold text-herb-600">in front of every couple.</em>
          </h1>
          <p className="mt-6 font-sans text-xl text-ink-2 leading-relaxed">
            Verified vendors only. Real leads, real bookings, real reviews. Built for the way
            Tanzanian vendors actually operate.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <Link href="/contact?topic=vendor" className="btn btn-primary">Apply to join</Link>
            <Link href="/pricing" className="btn btn-outline">See pricing</Link>
          </div>
        </div>
      </Section>

      <Section tone="paper">
        <SectionHead
          eyebrow="How it works"
          title={<>Four steps to <em className="not-italic font-extrabold text-herb-600">your first booking.</em></>}
        />
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-2 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <div
              key={s.t}
              className="py-8 border-b border-bordr grid grid-cols-[60px_1fr] gap-6 items-start"
            >
              <div className="font-mono text-[13px] text-herb-600 font-bold pt-1">0{i + 1}.</div>
              <div>
                <div className="font-sans text-2xl text-herb-900">{s.t}</div>
                <p className="text-ink-2 leading-relaxed mt-2">{s.b}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream">
        <SectionHead
          eyebrow="Pricing"
          title={<>Three tiers. <em className="not-italic font-extrabold text-herb-600">Pick what fits.</em></>}
        />
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingTiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-lg p-8 flex flex-col gap-4 ${
                t.highlight
                  ? 'bg-herb-800 text-herb-50 shadow-brand'
                  : 'bg-paper text-ink-1 border border-bordr shadow-soft'
              }`}
            >
              <div className={`text-[11px] uppercase tracking-widest ${t.highlight ? 'text-herb-300' : 'text-herb-600'}`}>
                {t.cadence}
              </div>
              <div className={`font-sans text-3xl ${t.highlight ? 'text-herb-50' : 'text-herb-900'}`}>
                {t.name}
              </div>
              <div className={`font-sans text-4xl font-bold tracking-tight ${t.highlight ? 'text-herb-50' : 'text-herb-900'}`}>
                {t.price}
              </div>
              <ul className={`mt-2 space-y-2 text-sm ${t.highlight ? 'text-herb-100' : 'text-ink-2'}`}>
                {t.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className={`mt-1 inline-block w-1.5 h-1.5 rounded-full ${t.highlight ? 'bg-herb-300' : 'bg-herb-600'}`} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/pricing" className="btn btn-outline">Full pricing &amp; commissions</Link>
        </div>
      </Section>

      <Section tone="paper">
        <SectionHead
          eyebrow="From the field"
          title={
            <>
              Vendors who <em className="not-italic font-extrabold text-herb-600">grew with us.</em>
            </>
          }
        />
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((q) => (
            <figure
              key={q.who}
              className="bg-paper border border-champagne rounded-lg p-10 relative shadow-soft"
            >
              <div className="font-sans text-herb-300 text-6xl leading-none">&ldquo;</div>
              <blockquote className="font-sans text-xl text-ink-1 leading-relaxed mt-2">
                {q.quote}
              </blockquote>
              <figcaption className="mt-6 pt-4 border-t border-bordr">
                <div className="font-sans text-lg">{q.who}</div>
                <div className="text-xs uppercase tracking-widest text-ink-3 mt-1">{q.sub}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section tone="ivory">
        <SectionHead
          eyebrow="Questions"
          title={<>Frequently <em className="not-italic font-extrabold text-herb-600">asked.</em></>}
        />
        <div className="max-w-3xl mx-auto divide-y divide-bordr bg-paper border border-bordr rounded-lg overflow-hidden">
          {faqs.map((f) => (
            <details key={f.q} className="group">
              <summary className="cursor-pointer list-none p-6 flex items-start justify-between gap-6 hover:bg-herb-50/40 transition">
                <span className="font-sans text-lg text-herb-900">{f.q}</span>
                <span
                  aria-hidden
                  className="mt-1 inline-block text-herb-600 text-2xl leading-none transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="px-6 pb-6 -mt-2 text-ink-2 leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </Section>

      <Section tone="cream">
        <div className="text-center max-w-3xl mx-auto">
          <div className="eyebrow justify-center">Ready when you are</div>
          <h2 className="mt-4 font-sans font-light text-[clamp(2rem,4.5vw,3.4rem)] leading-tight text-herb-900">
            Submit your application
            <br />
            <em className="not-italic font-extrabold text-herb-600">in under five minutes.</em>
          </h2>
          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <Link href="/contact?topic=vendor" className="btn btn-primary">Apply to join</Link>
            <Link href="/contact?topic=sales" className="btn btn-outline">Talk to sales</Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
