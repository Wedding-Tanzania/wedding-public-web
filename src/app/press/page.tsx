import Link from 'next/link';
import { Section } from '@/components/Section';

export const metadata = { title: 'Press' };

const facts = [
  ['Launched', 'April 2026 · Dar es Salaam'],
  ['Markets', 'Tanzania (live), Kenya (Q3 2026)'],
  ['Vendors', '500+ verified at launch'],
  ['Payment partners', 'M-Pesa, Mixx by YAS, Airtel Money, Halotel, TTCL Pesa, CRDB, NMB'],
  ['Built by', 'Lockwood Technology Tanzania'],
];

export default function PressPage() {
  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="eyebrow justify-center">Press</div>
          <h1 className="mt-4 font-sans font-light text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-tight text-herb-900">
            For journalists
            <br />
            <em className="not-italic font-extrabold text-herb-600">and partners.</em>
          </h1>
          <p className="mt-6 font-sans text-xl text-ink-2 leading-relaxed">
            Press kit, brand assets, founder availability, and editorial enquiries.
          </p>
          <div className="flex gap-4 justify-center mt-10">
            <Link href="/contact?topic=press" className="btn btn-primary">Get in touch</Link>
            <a href="/press/wedding-press-kit.zip" className="btn btn-outline">Download press kit</a>
          </div>
        </div>
      </Section>

      <Section tone="paper">
        <div className="max-w-3xl mx-auto bg-paper border border-bordr rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <tbody>
              {facts.map(([k, v], i) => (
                <tr key={k} className={i > 0 ? 'border-t border-bordr' : ''}>
                  <td className="p-5 text-[10px] uppercase tracking-widest text-ink-3 w-1/3">{k}</td>
                  <td className="p-5 font-sans text-lg text-herb-900">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </main>
  );
}
