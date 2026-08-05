import Link from 'next/link';
import { Section, SectionHead } from '@/components/Section';

export const metadata = { title: 'Stories' };

const featured = {
  quote:
    'We had 312 guests across four cities and three countries. Wedding by Lockwood let everyone pledge, pay, and RSVP from their phones. The morning after our reception, the budget was already reconciled.',
  who: 'Amani & Nyota',
  sub: 'Married December 2026 · 312 guests · Oyster Bay Gardens',
};

const coupleStories = [
  {
    quote:
      'My mum is in Mwanza, my dad in Dodoma, and my husband\'s family is in London. They all pledged on the same page in three different currencies. I cried.',
    who: 'Asha & Hassan',
    sub: 'Married April 2026 · Zanzibar coastal',
  },
  {
    quote:
      'We saved roughly TZS 6M by comparing six caterer quotes side by side. Three of them I would never have known about without the directory.',
    who: 'Tumaini & Joel',
    sub: 'Married August 2026 · 180 guests · Garden ceremony',
  },
  {
    quote:
      'The invitation card studio was the best part. We printed for elders, WhatsApped a QR for everyone else. Same artwork, two formats, fifteen minutes.',
    who: 'Faraja & Mike',
    sub: 'Married November 2026 · Christian church',
  },
  {
    quote:
      'I never had to chase a pledge. The platform sent reminders for me. By the morning of the wedding, we had collected 94% of pledged amounts.',
    who: 'Neema & Yusuf',
    sub: 'Married July 2026 · Islamic Nikah',
  },
  {
    quote:
      'The budget tracker is what kept us sane. Watching live contributions arrive while I was approving caterer invoices made the whole month feel manageable.',
    who: 'Rebecca & David',
    sub: 'Married October 2026 · Rooftop reception',
  },
  {
    quote:
      'We are based in Nairobi but our wedding was in Arusha. Two days of vendor visits replaced by two evenings on the platform.',
    who: 'Sarah & Tomas',
    sub: 'Married September 2026 · Safari bush',
  },
];

const vendorStories = [
  {
    quote:
      'In our first quarter on the platform we booked 41 weddings. Last year over the same period we booked 18. The lead inbox does what cold calling used to do, only better.',
    who: 'Faraja Mwakatumbula',
    role: 'Founder, Kilima Gardens Estate',
  },
  {
    quote:
      'Couples now send us their theme tags before the first message. I know if a brief is a fit in thirty seconds, not three meetings.',
    who: 'Joyce Mushi',
    role: 'Lead photographer, Mushi Studios',
  },
  {
    quote:
      'Reviews from real bookings is the unlock. We earned the Highly Rated badge in two months and our enquiries doubled.',
    who: 'Daniel Komba',
    role: 'Owner, Komba Catering',
  },
];

export default function TestimonialsPage() {
  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="eyebrow justify-center">Stories</div>
          <h1 className="mt-4 font-sans font-light text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-tight text-herb-900">
            Real couples.
            <br />
            <em className="not-italic font-extrabold text-herb-600">Real ceremonies.</em>
          </h1>
          <p className="mt-6 font-sans text-xl text-ink-2 leading-relaxed">
            From garden weddings in Dar to coastal Nikahs in Zanzibar, these are the stories the
            platform was built for.
          </p>
        </div>
      </Section>

      <Section tone="cream">
        <figure className="max-w-4xl mx-auto bg-paper border border-champagne shadow-soft p-14 text-center">
          <div className="font-sans text-herb-300 text-7xl leading-none">"</div>
          <blockquote className="font-sans text-2xl md:text-3xl text-ink-1 leading-snug mt-4">
            {featured.quote}
          </blockquote>
          <figcaption className="mt-10 pt-6 border-t border-bordr">
            <div className="font-sans text-2xl text-herb-700">{featured.who}</div>
            <div className="text-xs uppercase tracking-widest text-ink-3 mt-2">
              {featured.sub}
            </div>
          </figcaption>
        </figure>
      </Section>

      <Section tone="paper">
        <SectionHead
          eyebrow="From the couples"
          title={<>Letters from <em className="not-italic font-extrabold text-herb-600">the day after.</em></>}
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupleStories.map((s) => (
            <figure
              key={s.who}
              className="bg-paper border border-bordr rounded-lg p-8 shadow-soft flex flex-col h-full"
            >
              <div className="font-sans text-herb-300 text-5xl leading-none">"</div>
              <blockquote className="font-sans text-lg text-ink-1 leading-relaxed mt-2 flex-1">
                {s.quote}
              </blockquote>
              <figcaption className="mt-6 pt-4 border-t border-bordr">
                <div className="font-sans text-lg text-herb-700">{s.who}</div>
                <div className="text-[10px] uppercase tracking-widest text-ink-3 mt-1">{s.sub}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section tone="cream">
        <SectionHead
          eyebrow="From the vendors"
          title={<>The diary is <em className="not-italic font-extrabold text-herb-600">full.</em></>}
        />
        <div className="grid md:grid-cols-3 gap-6">
          {vendorStories.map((s) => (
            <figure
              key={s.who}
              className="bg-paper border border-champagne rounded-lg p-8 flex flex-col h-full"
            >
              <span className="tag self-start">Verified vendor</span>
              <blockquote className="font-sans text-lg text-ink-1 leading-relaxed mt-6 flex-1">
                {s.quote}
              </blockquote>
              <figcaption className="mt-6 pt-4 border-t border-bordr">
                <div className="font-sans text-lg text-herb-700">{s.who}</div>
                <div className="text-xs text-ink-3 mt-1">{s.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section tone="paper">
        <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto text-center">
          {[
            ['4.9', 'Average couple rating'],
            ['96%', 'Pledge collection rate'],
            ['8 wks', 'Median planning time saved'],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="font-sans text-6xl text-herb-700">{n}</div>
              <div className="text-[10px] uppercase tracking-widest text-ink-3 mt-3">{l}</div>
            </div>
          ))}
        </div>
        <div className="text-center mt-16">
          <Link href="/contact" className="btn btn-primary">
            Start your story
          </Link>
        </div>
      </Section>
    </main>
  );
}
