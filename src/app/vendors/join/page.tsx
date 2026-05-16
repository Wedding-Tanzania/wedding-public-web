import Link from 'next/link';
import { Section, SectionHead } from '@/components/Section';

export const metadata = { title: 'Become a vendor' };

const steps = [
  { t: 'Create your profile', b: 'Business name, category, service areas, portfolio photos, theme tags, packages.' },
  { t: 'Get verified', b: 'Our team reviews your profile and supporting documents (most approvals in 48 hours).' },
  { t: 'Receive leads', b: 'Couples enquire through your profile. Every enquiry lands in your unified inbox.' },
  { t: 'Quote, book, get paid', b: 'Send quotes, accept bookings, and collect deposits via Malipopay. Funds settle daily.' },
];

export default function VendorJoinPage() {
  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="ornament justify-center">— For vendors —</div>
          <h1 className="mt-4 font-display font-light text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-tight text-blush-900">
            Put your work
            <br />
            <em className="italic text-blush-600">in front of every couple.</em>
          </h1>
          <p className="mt-6 font-display italic text-xl text-ink-2 leading-relaxed">
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
        <SectionHead eyebrow="How it works" title={<>Four steps to <em className="italic text-blush-600">your first booking.</em></>} />
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-2 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <div key={s.t} className="py-8 border-b border-bordr grid grid-cols-[60px_1fr] gap-6 items-start">
              <div className="font-mono text-[13px] text-blush-600 font-bold pt-1">0{i + 1}.</div>
              <div>
                <div className="font-display text-2xl text-blush-900">{s.t}</div>
                <p className="text-ink-2 leading-relaxed mt-2">{s.b}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
