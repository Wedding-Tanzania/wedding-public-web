import Link from 'next/link';
import { Section, SectionHead } from '@/components/Section';

export const metadata = { title: 'Pricing' };

const tiers = [
  {
    name: 'Free',
    tag: 'For every couple',
    price: 'TZS 0',
    per: 'forever',
    body:
      'Story page, vendor directory, RSVPs, budget, and one invitation card template. No credit card needed.',
    features: [
      'Custom story page + dynamic OG share image',
      'Browse + contact verified vendors',
      'Up to 200 RSVPs',
      'One invitation card template',
      'Budget manager',
    ],
    cta: 'Start free',
    primary: true,
  },
  {
    name: 'Plan +',
    tag: 'Most loved',
    price: 'TZS 35,000',
    per: 'one-time',
    body:
      '50+ invitation templates, animated video cards, seating planner, premium themes, and unlimited RSVPs.',
    features: [
      'Everything in Free',
      '50+ premium invitation templates',
      'Animated video card export',
      'Seating planner',
      'Unlimited RSVPs',
      'Premium story page themes',
    ],
    cta: 'Upgrade later',
  },
  {
    name: 'Vendor',
    tag: 'For service providers',
    price: 'TZS 30k - 80k',
    per: '/month',
    body:
      'Verified business profile, lead inbox, calendar, reviews. Promotion packs and analytics on top tiers.',
    features: [
      'Verified profile + portfolio',
      'Lead inbox + quote builder',
      'Booking calendar',
      'Review system',
      'Promotion + featured placement (Pro)',
      'Analytics dashboard (Pro)',
    ],
    cta: 'Become a vendor',
  },
];

const fees = [
  ['Contributions facilitation', '1 - 1.5%', 'On every contribution received'],
  ['Vendor booking commission', '1.5%', 'On confirmed bookings paid through the platform'],
  ['Card payments', '3%', 'Visa & Mastercard, for diaspora guests'],
  ['Bulk SMS', 'TZS 10.7 - 20', 'Per SMS, billed at cost + margin'],
];

export default function PricingPage() {
  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="eyebrow justify-center">Pricing</div>
          <h1 className="mt-4 font-sans font-light text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-tight text-herb-900">
            Honest pricing.
            <br />
            <em className="not-italic font-extrabold text-herb-600">No surprises.</em>
          </h1>
          <p className="mt-6 font-sans text-xl text-ink-2 leading-relaxed">
            Free for couples. Vendors pay only when business comes in. All contributions land
            directly with you, never in our wallet.
          </p>
        </div>
      </Section>

      <Section tone="paper" className="!pt-12">
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-lg p-10 border flex flex-col ${
                t.primary
                  ? 'bg-herb-900 text-herb-50 border-herb-900 shadow-brand'
                  : 'bg-paper border-bordr shadow-soft'
              }`}
            >
              <div
                className={`text-[10px] uppercase tracking-widest ${t.primary ? 'text-herb-300' : 'text-herb-600'}`}
              >
                {t.tag}
              </div>
              <div className="font-sans text-3xl mt-2">{t.name}</div>
              <div className="flex items-baseline gap-2 mt-6">
                <div className="font-sans text-5xl">{t.price}</div>
                <div className={`text-sm ${t.primary ? 'text-herb-200' : 'text-ink-3'}`}>{t.per}</div>
              </div>
              <p className={`mt-4 leading-relaxed ${t.primary ? 'text-herb-200' : 'text-ink-2'}`}>
                {t.body}
              </p>
              <ul className={`mt-6 space-y-3 text-sm ${t.primary ? 'text-herb-100' : 'text-ink-2'}`}>
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className={t.primary ? 'text-herb-300' : 'text-herb-600'}>·</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className={`btn mt-10 self-start ${t.primary ? 'btn-primary !bg-paper !text-herb-700 hover:!bg-herb-50' : 'btn-outline'}`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream">
        <SectionHead
          eyebrow="Transaction fees"
          title={<>What gets <em className="not-italic font-extrabold text-herb-600">deducted.</em></>}
        />
        <div className="max-w-3xl mx-auto bg-paper border border-bordr rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <tbody>
              {fees.map(([label, amt, note], i) => (
                <tr key={label} className={i > 0 ? 'border-t border-bordr' : ''}>
                  <td className="p-5 font-sans text-lg w-1/3">{label}</td>
                  <td className="p-5 font-sans text-herb-700 text-lg">{amt}</td>
                  <td className="p-5 text-sm text-ink-3">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center font-sans text-ink-3 mt-8 max-w-2xl mx-auto">
          The platform is a facilitator, not a custodian. Funds settle directly to your Changisha,
          Mchango, Lipa Namba, or bank account.
        </p>
      </Section>
    </main>
  );
}
