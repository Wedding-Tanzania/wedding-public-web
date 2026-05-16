import Link from 'next/link';
import { Section, SectionHead } from '@/components/Section';

export const metadata = { title: 'Features' };

const coupleFeatures = [
  { t: 'Custom story page', b: 'A personalised, shareable webpage: hero photo, your story, gallery, schedule, RSVPs, contributions, and vendor credits.' },
  { t: 'Theme-matched vendors', b: 'Tell us your theme — traditional Chagga, coastal Swahili, garden, Islamic Nikah, beach Zanzibar — and we curate the right vendors.' },
  { t: 'Budget manager', b: 'Set a total, allocate per category, and watch contributions arrive in real time as guests pay.' },
  { t: 'Pledges & contributions', b: 'Family and friends pledge on your page, then pay via Changisha, Mchango, Lipa Namba, CRDB, NMB, or card.' },
  { t: 'Invitation card studio', b: '50+ templates, drag-and-drop editor, embedded QR linking to your contribution page. Export PNG, PDF, or WhatsApp-ready.' },
  { t: 'Guest list & RSVP', b: 'Track confirmations, dietary needs, plus-ones, and seating preferences in one place.' },
  { t: 'Mobile app', b: 'Plan on the go (Android & iOS). Offline-capable checklist and budget. Push notifications for every pledge and payment.' },
  { t: 'WhatsApp-first sharing', b: 'Every page, every reminder, every invitation is built to share well on WhatsApp.' },
];

const vendorFeatures = [
  { t: 'Verified business profile', b: 'A polished, searchable storefront with portfolio, theme tags, packages, pricing, and your calendar.' },
  { t: 'Lead inbox', b: 'Every enquiry in one place. Quote, negotiate, and convert without switching apps.' },
  { t: 'Bookings + deposits', b: 'Couples accept a quote and pay deposit through Malipopay. Funds land in your account, minus a 1.5% platform fee.' },
  { t: 'Calendar & availability', b: 'Block dates, prevent double-bookings, and surface to couples searching available days.' },
  { t: 'Reviews from real bookers', b: 'Only confirmed bookings can review. 4.5+ stars earns a Highly Rated badge and better placement.' },
  { t: 'Promotion tools', b: 'Featured listings, theme placements, and homepage banners. Billed monthly via STK push.' },
  { t: 'Analytics', b: 'Profile views, enquiry sources, package interest, and conversion funnel.' },
];

const platformFeatures = [
  { t: 'One payment rail', b: 'Malipopay routes M-Pesa, Mixx by YAS, Airtel Money, Halotel, TTCL Pesa, CRDB, NMB, and card through a single API at 1%.' },
  { t: 'Direct-to-account', b: 'Funds never sit in a platform wallet. They land directly in the couple\'s Changisha, Mchango, Lipa Namba, or bank account.' },
  { t: 'TRA fiscal receipts', b: 'Every vendor transaction generates a TRA-compliant EFD receipt automatically.' },
  { t: 'Bulk SMS', b: 'Pledge reminders, RSVP nudges, and vendor confirmations at TZS 10.7 per SMS.' },
];

export default function FeaturesPage() {
  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="ornament justify-center">— Features —</div>
          <h1 className="mt-4 font-display font-light text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-tight text-blush-900">
            Everything you need.
            <br />
            <em className="italic text-blush-600">Nothing you don't.</em>
          </h1>
          <p className="mt-6 font-display italic text-xl text-ink-2 leading-relaxed">
            A planning platform, a vendor marketplace, and a contribution engine — composed into one
            quiet, organised experience.
          </p>
        </div>
      </Section>

      <Section tone="paper">
        <SectionHead
          eyebrow="For couples"
          title={<>From engagement <em className="italic text-blush-600">to honeymoon.</em></>}
        />
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-2">
          {coupleFeatures.map((f, i) => (
            <FeatureRow key={f.t} index={i + 1} title={f.t} body={f.b} />
          ))}
        </div>
      </Section>

      <Section tone="cream">
        <SectionHead
          eyebrow="For vendors"
          title={<>Run your business <em className="italic text-blush-600">like a brand.</em></>}
        />
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-2">
          {vendorFeatures.map((f, i) => (
            <FeatureRow key={f.t} index={i + 1} title={f.t} body={f.b} />
          ))}
        </div>
      </Section>

      <Section tone="ink">
        <SectionHead
          eyebrow="Under the hood"
          title={<>Built on <em className="italic text-blush-300">Malipopay.</em></>}
          tone="light"
        />
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl mx-auto">
          {platformFeatures.map((f, i) => (
            <div key={f.t} className="border-t border-blush-800 pt-6">
              <div className="font-mono text-[11px] text-blush-300 font-bold">
                0{i + 1}.
              </div>
              <div className="font-display text-2xl mt-1 text-blush-50">{f.t}</div>
              <p className="text-blush-200 leading-relaxed mt-2">{f.b}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="paper">
        <div className="text-center">
          <div className="ornament justify-center">— Ready —</div>
          <h2 className="mt-4 font-display font-light text-4xl text-blush-900">
            Start your wedding page in <em className="italic text-blush-600">five minutes.</em>
          </h2>
          <div className="flex gap-4 justify-center mt-10">
            <Link href="/contact" className="btn btn-primary">Start planning</Link>
            <Link href="/vendors" className="btn btn-outline">Browse vendors</Link>
          </div>
        </div>
      </Section>
    </main>
  );
}

function FeatureRow({ index, title, body }: { index: number; title: string; body: string }) {
  return (
    <div className="grid grid-cols-[44px_1fr] gap-6 items-start py-6 border-b border-bordr">
      <div className="font-mono text-[12px] text-blush-600 font-bold pt-1">
        {index.toString().padStart(2, '0')}.
      </div>
      <div>
        <div className="font-display text-xl font-medium">{title}</div>
        <p className="text-sm text-ink-2 leading-relaxed mt-2">{body}</p>
      </div>
    </div>
  );
}
