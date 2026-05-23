import Link from 'next/link';
import { Section, SectionHead } from '@/components/Section';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Principles />
      <ForCouples />
      <ForVendors />
      <Testimonials />
      <CTA />
    </main>
  );
}

function Hero() {
  return (
    <section
      className="relative overflow-hidden px-6 lg:px-12"
      style={{
        background:
          'radial-gradient(ellipse at top, var(--w-herb-50), var(--w-linen) 60%)',
        padding: '120px 0 140px',
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 25%, rgba(168,188,151,0.26), transparent 40%), radial-gradient(circle at 88% 80%, rgba(210,148,105,0.18), transparent 40%)',
        }}
      />
      <div className="relative max-w-wrap mx-auto">
        <div className="eyebrow">Design System v0.3 · Sage edition · Weddings &amp; the money behind them</div>
        <h1 className="mt-6 font-sans font-light text-herb-900 leading-[1.02] tracking-tightest text-[clamp(2.75rem,6vw,5.5rem)] max-w-5xl">
          A garden, <em className="not-italic font-extrabold text-herb-600">two families,</em>
          <br />
          and <span className="text-herb-800 font-bold">every shilling accounted for.</span>
        </h1>
        <p className="font-sans text-lg text-ink-2 max-w-2xl mt-7 leading-relaxed">
          East Africa&apos;s wedding planning, vendor marketplace, and payments platform.
          Built to hold an invitation, a vendor directory, and an escrowed payment schedule on the
          same page, without any of them feeling out of place.
        </p>
        <div className="flex flex-wrap gap-4 mt-9">
          <Link href="/contact" className="btn btn-primary">
            Start planning
          </Link>
          <Link href="/features" className="btn btn-outline">
            See the system
          </Link>
        </div>
        <div className="grid sm:grid-cols-4 gap-0 mt-14 py-6 border-y border-rule">
          {[
            ['2,400+', 'Verified vendors'],
            ['TSh 4.2bn', 'In escrow YTD'],
            ['6 cities', 'Dar · Arusha · Nairobi…'],
            ['M-Pesa · Tigo · Airtel', 'Mobile money rails'],
          ].map(([n, l], i) => (
            <div
              key={l}
              className={`px-6 ${i < 3 ? 'border-r border-rule' : ''}`}
            >
              <div className="font-sans font-bold text-3xl text-herb-800 tracking-tight tabular-nums">
                {n}
              </div>
              <div className="text-[11px] uppercase tracking-wide text-ink-3 mt-1.5 font-medium">
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Principles() {
  const items = [
    {
      title: 'Tactile, not digital',
      body:
        'Surfaces feel like paper. Serifs carry voice. Chrome recedes; content is invited forward.',
    },
    {
      title: 'Composed, not crowded',
      body:
        'Generous margins, centred axis, restrained rules. Let each element breathe its own air.',
    },
    {
      title: 'Warmth over gloss',
      body:
        'Eucalyptus, linen, and warm coral. No hard gradients or neon. The palette is a garden at dusk.',
    },
  ];
  return (
    <Section tone="paper">
      <SectionHead
        eyebrow="Principles"
        title={<>Set like a table, <em className="not-italic font-extrabold text-herb-600">not a grid.</em></>}
      />
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((p) => (
          <div
            key={p.title}
            className="bg-paper border border-bordr rounded-lg p-10 text-center shadow-soft"
          >
            <div className="w-12 h-12 rounded-full bg-herb-100 grid place-items-center mx-auto mb-5 text-herb-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 4L14 10H20L15 14L17 20L12 16L7 20L9 14L4 10H10Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="font-sans font-medium text-2xl">{p.title}</div>
            <p className="mt-4 text-sm text-ink-3 leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ForCouples() {
  const features = [
    { t: 'Vendor Marketplace', b: 'Browse and compare hundreds of verified vendors across venues, catering, photography, decor, entertainment, transport, and more.' },
    { t: 'Reviews & Ratings', b: 'Authentic reviews from real couples, verified by the platform. Every decision informed.' },
    { t: 'Budget Planner', b: 'Set a total budget and track spending across every vendor and category in real time.' },
    { t: 'Checklist & Timeline', b: 'A customisable planning checklist with milestone reminders, from engagement to honeymoon.' },
    { t: 'Booking & Payments', b: 'Reserve vendors and pay deposits directly. Mobile money, card, or bank transfer, powered by Malipopay.' },
    { t: 'Wedding Website', b: 'Every couple gets a personalised story page to share details, RSVPs, and contribution links.' },
    { t: 'Guest Management', b: 'Track RSVPs, dietary requirements, seating preferences, and plus-ones from a single guest list.' },
  ];
  return (
    <Section tone="cream">
      <SectionHead
        eyebrow="For couples"
        title={
          <>
            Every stage of the journey. <em className="not-italic font-extrabold text-herb-600">One quiet place.</em>
          </>
        }
      />
      <div className="grid md:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <div
            key={f.t}
            className={`bg-paper border border-bordr rounded-lg p-8 flex flex-col gap-3 ${i === 0 ? 'md:col-span-2' : ''}`}
          >
            <div className="font-mono text-[11px] font-bold text-herb-600">
              {(i + 1).toString().padStart(2, '0')}
            </div>
            <div className="font-sans text-2xl font-medium">{f.t}</div>
            <p className="text-sm text-ink-2 leading-relaxed">{f.b}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ForVendors() {
  const features = [
    ['Verified vendor profile', 'A professional, searchable business page with portfolio, packages, pricing, and contact.'],
    ['Lead inbox', 'All enquiries delivered directly, with tools to respond, quote, and convert.'],
    ['Booking calendar', 'Manage availability, prevent double-bookings, and see upcoming events in one view.'],
    ['Analytics dashboard', 'See how many couples viewed your profile, where they came from, and what packages they enquired about.'],
    ['Payment collection', 'Accept deposits and full payments through the platform, settled via Malipopay.'],
  ];
  return (
    <Section tone="paper">
      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-20 items-start">
        <div className="lg:sticky lg:top-32">
          <div className="eyebrow">For vendors</div>
          <h2 className="mt-4 font-sans font-light text-[clamp(2rem,4vw,3.2rem)] leading-tight tracking-tight">
            A professional storefront. <em className="not-italic font-extrabold text-herb-600">A leads engine.</em>
          </h2>
          <p className="mt-6 text-ink-2 leading-relaxed max-w-md">
            Put your services in front of every couple actively planning a wedding in Tanzania.
            Wedding by Lockwood is a digital shopfront and a conversion machine, built for the way
            vendors here actually operate.
          </p>
          <Link href="/contact?topic=vendor" className="btn btn-primary mt-8">
            Become a vendor
          </Link>
        </div>
        <div>
          {features.map(([t, b], i) => (
            <div
              key={t}
              className={`grid grid-cols-[60px_1fr] gap-8 items-start py-8 border-t border-bordr ${i === features.length - 1 ? 'border-b' : ''}`}
            >
              <div className="font-mono text-[13px] text-herb-600 font-bold pt-1">0{i + 1}.</div>
              <div>
                <div className="font-sans text-2xl font-medium">{t}</div>
                <p className="mt-2 text-ink-2 leading-relaxed">{b}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Testimonials() {
  const quotes = [
    {
      quote:
        'We planned a 320-guest wedding in five months without a planner. The vendor reviews saved us from three bad decisions.',
      who: 'Amani & Nyota',
      sub: 'Married December 2026 · Oyster Bay Gardens',
    },
    {
      quote:
        'I went from cold WhatsApp leads to a booked diary in eight weeks. The lead inbox is the whole game.',
      who: 'Faraja Mwakatumbula',
      sub: 'Founder, Kilima Gardens Estate',
    },
    {
      quote:
        'Our families could pledge from Mwanza, Arusha, and London on the same page. Money landed straight in our Changisha.',
      who: 'Hassan & Asha',
      sub: 'Married April 2026 · Zanzibar coastal',
    },
  ];
  return (
    <Section tone="cream">
      <SectionHead
        eyebrow="Real weddings"
        title={
          <>
            Real couples. <em className="not-italic font-extrabold text-herb-600">Real ceremonies.</em>
          </>
        }
      />
      <div className="grid md:grid-cols-3 gap-6">
        {quotes.map((q) => (
          <figure
            key={q.who}
            className="bg-paper border border-champagne rounded-lg p-10 relative shadow-soft"
          >
            <div className="font-sans text-herb-300 text-6xl leading-none">"</div>
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
      <div className="text-center mt-12">
        <Link href="/testimonials" className="btn btn-outline">
          Read more stories
        </Link>
      </div>
    </Section>
  );
}

function CTA() {
  return (
    <section
      className="relative overflow-hidden text-herb-50"
      style={{
        background:
          'linear-gradient(135deg, var(--w-herb-700) 0%, var(--w-herb-900) 100%)',
        padding: '140px 24px',
      }}
    >
      <div className="relative max-w-wrap mx-auto text-center">
        <div className="eyebrow justify-center text-herb-300">Start planning</div>
        <h2 className="mt-4 font-sans font-light text-[clamp(2.4rem,5vw,4rem)] leading-tight text-herb-50">
          Trust, structure, and convenience. <em className="not-italic font-extrabold text-herb-300">This market has long needed them.</em>
        </h2>
        <div className="flex flex-wrap gap-4 justify-center mt-12">
          <Link href="/contact" className="btn btn-primary !bg-paper !text-herb-700 hover:!bg-herb-50">
            Start planning
          </Link>
          <Link
            href="/contact?topic=vendor"
            className="btn btn-outline !text-herb-50 !border-herb-300 hover:!bg-herb-700"
          >
            Become a vendor
          </Link>
        </div>
      </div>
    </section>
  );
}
