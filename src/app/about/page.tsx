import Link from 'next/link';
import { Section, SectionHead } from '@/components/Section';

export const metadata = { title: 'About' };

const team = [
  { name: 'Francis Mwakatumbula', role: 'Head of Digital Business, iTrust' },
  { name: 'Lockwood Technology', role: 'Product, engineering, payments' },
  { name: 'Malipopay', role: 'Payment rails for every MNO and bank' },
];

const values = [
  {
    t: 'Trust before convenience',
    b: 'Every vendor is verified by our team. Every contribution lands directly in the couple\'s own account. We never hold client money.',
  },
  {
    t: 'Tanzanian culture first',
    b: 'Kuchangiana, michango, kitchen parties, Nikah, traditional rites. The platform is designed around how families here actually celebrate.',
  },
  {
    t: 'Restraint, always',
    b: 'A wedding is the most photographed day of a life. The platform that supports it should look like a letterpressed invitation, not an admin tool.',
  },
];

export default function AboutPage() {
  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="eyebrow justify-center">About</div>
          <h1 className="mt-4 font-sans font-light text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-tight text-herb-900">
            Built in Dar.
            <br />
            <em className="not-italic font-extrabold text-herb-600">Made for East Africa.</em>
          </h1>
        </div>
      </Section>

      <Section tone="paper" className="!pt-12">
        <div id="story" className="grid lg:grid-cols-[1fr_1.4fr] gap-16 items-start">
          <div className="lg:sticky lg:top-32">
            <div className="eyebrow">Our story</div>
            <h2 className="mt-4 font-sans font-light text-4xl tracking-tight">
              Why we <em className="not-italic font-extrabold text-herb-600">started.</em>
            </h2>
          </div>
          <div className="space-y-6 font-sans text-xl text-ink-2 leading-relaxed">
            <p>
              Planning a wedding in Tanzania has always been one of the most logistically complex
              experiences a couple will undertake. Venues found by word of mouth, caterers by
              WhatsApp referral, photographers by Instagram screenshot.
            </p>
            <p>
              The contribution side, our beloved kuchangiana, is even more dispersed. Pledges in
              notebooks, payments to multiple Lipa Numbers, reconciliation by phone call at 11pm
              the night before.
            </p>
            <p>
              We built Wedding by Lockwood because none of this is a problem of culture. It is a
              problem of infrastructure. The culture is beautiful and intact. The infrastructure
              just hadn't been written yet.
            </p>
            <p className="not-italic font-extrabold text-herb-700">— And so it begins.</p>
          </div>
        </div>
      </Section>

      <Section tone="cream">
        <SectionHead
          eyebrow="What we value"
          title={<>Three principles. <em className="not-italic font-extrabold text-herb-600">No exceptions.</em></>}
        />
        <div className="grid md:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <div key={v.t} className="bg-paper border border-champagne rounded-lg p-10">
              <div className="font-mono text-[11px] font-bold text-herb-600">
                0{i + 1}.
              </div>
              <div className="font-sans text-2xl font-medium mt-2">{v.t}</div>
              <p className="text-ink-2 leading-relaxed mt-4">{v.b}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="paper">
        <SectionHead
          eyebrow="The team"
          title={<>Made by <em className="not-italic font-extrabold text-herb-600">people you can ring.</em></>}
        />
        <div className="grid md:grid-cols-3 gap-6">
          {team.map((m) => (
            <div key={m.name} className="bg-paper border border-bordr rounded-lg p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-herb-100 mx-auto grid place-items-center text-herb-600 font-sans text-3xl">
                {m.name
                  .split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="font-sans text-xl mt-4">{m.name}</div>
              <div className="text-xs uppercase tracking-widest text-ink-3 mt-2">{m.role}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="ink">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="eyebrow text-herb-300">A note on payments</div>
            <h2 className="mt-4 font-sans font-light text-4xl text-herb-50">
              Powered by <em className="not-italic font-extrabold text-herb-300">Malipopay.</em>
            </h2>
            <p className="mt-6 text-herb-200 leading-relaxed">
              Wedding by Lockwood is built on Malipopay, Lockwood's own licensed payment gateway.
              One integration connects all five Tanzanian MNOs (M-Pesa, Mixx by YAS, Airtel Money,
              Halotel, TTCL Pesa) and both major banks (CRDB and NMB), at the lowest published
              gateway rate in the market.
            </p>
            <p className="mt-4 text-herb-200 leading-relaxed">
              Contributions flow directly to couples’ own Changisha, Mchango, Lipa Namba, or bank
              accounts. We never hold the money.
            </p>
          </div>
          <div className="bg-herb-800 border border-herb-700 rounded-lg p-10">
            <div className="font-mono text-[11px] text-herb-300 uppercase tracking-widest">
              Payment partners
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-herb-50">
              {['M-Pesa', 'Mixx by YAS', 'Airtel Money', 'Halotel', 'TTCL Pesa', 'CRDB', 'NMB', 'Visa & Mastercard'].map(
                (p) => (
                  <div key={p} className="font-sans text-lg border-l-2 border-herb-600 pl-3">
                    {p}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </Section>

      <Section tone="paper">
        <div className="text-center">
          <h2 className="font-sans font-light text-4xl text-herb-900">
            Come build with us.
          </h2>
          <div className="flex gap-4 justify-center mt-10">
            <Link href="/contact" className="btn btn-primary">Get in touch</Link>
            <Link href="/contact?topic=careers" className="btn btn-outline">Careers</Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
