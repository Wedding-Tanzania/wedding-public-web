import Link from 'next/link';
import Image from 'next/image';
import { Section, SectionHead } from '@/components/Section';

export const metadata = {
  title: 'Press',
  description:
    'Press kit, brand assets, founder bios, and editorial enquiries for Wedding by Lockwood.',
};

const facts: Array<[string, string]> = [
  ['Launched', 'April 2026 · Dar es Salaam'],
  ['Markets', 'Tanzania (live), Kenya (Q3 2026)'],
  ['Vendors', '500+ verified at launch'],
  ['Payment partners', 'M-Pesa, Mixx by YAS, Airtel Money, Halotel, TTCL Pesa, CRDB, NMB'],
  ['Built by', 'Lockwood Technology Tanzania'],
];

const brandAssets: Array<{ name: string; description: string; href: string }> = [
  {
    name: 'Wordmark · light',
    description: 'SVG on transparent background, for use on dark surfaces.',
    href: '/press/wedding-wordmark-light.svg',
  },
  {
    name: 'Wordmark · dark',
    description: 'SVG on transparent background, for use on light surfaces.',
    href: '/press/wedding-wordmark-dark.svg',
  },
  {
    name: 'Full logomark',
    description: 'Rings + wordmark lockup, vertical and horizontal SVGs.',
    href: '/press/wedding-logomark.zip',
  },
  {
    name: 'Press kit',
    description: 'Boilerplate, founder photos, product screenshots, and the assets above.',
    href: '/press/wedding-press-kit.zip',
  },
];

const palette: Array<{ name: string; hex: string; role: string }> = [
  { name: 'herb-600', hex: '#4F6A42', role: 'Primary sage' },
  { name: 'herb-800', hex: '#2A3A24', role: 'Dark surface' },
  { name: 'linen',    hex: '#F1EADB', role: 'Canvas' },
  { name: 'paper',    hex: '#FFFFFF', role: 'Card' },
  { name: 'coral',    hex: '#D29469', role: 'Warmth accent' },
  { name: 'ink-1',    hex: '#1F2A1A', role: 'Primary text' },
];

const founders: Array<{ name: string; role: string; bio: string }> = [
  {
    name: 'Francis Mwakatumbula',
    role: 'Founder · CEO',
    bio: 'Head of Digital Business at iTrust. Previously shipped Malipopay, Kikoba, and Mwendopesa. Builds payment products that hold up at scale in East African markets.',
  },
  {
    name: 'Faraja Mwakatumbula',
    role: 'Founding venue partner',
    bio: 'Founder of Kilima Gardens Estate, one of the first venues live on the platform. Shapes the vendor product from the inside.',
  },
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
          <div className="flex flex-wrap gap-4 justify-center mt-10">
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

      <Section tone="cream">
        <SectionHead
          eyebrow="Brand assets"
          title={
            <>
              Logos, palette, and the <em className="not-italic font-extrabold text-herb-600">press kit.</em>
            </>
          }
        />
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {brandAssets.map((a) => (
            <a
              key={a.name}
              href={a.href}
              className="group bg-paper border border-bordr rounded-lg p-8 flex flex-col gap-3 hover:shadow-soft transition"
            >
              <div className="font-mono text-[11px] text-herb-600 font-bold uppercase tracking-widest">Download</div>
              <div className="font-sans text-2xl text-herb-900 group-hover:text-herb-700">{a.name}</div>
              <p className="text-sm text-ink-2 leading-relaxed">{a.description}</p>
            </a>
          ))}
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <div className="text-[10px] uppercase tracking-widest text-ink-3 mb-4">Palette</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {palette.map((p) => (
              <div key={p.name} className="bg-paper border border-bordr rounded-lg overflow-hidden">
                <div className="h-20 w-full" style={{ background: p.hex }} aria-hidden />
                <div className="p-4">
                  <div className="font-sans text-sm text-herb-900">{p.name}</div>
                  <div className="font-mono text-[11px] text-ink-3 mt-1">{p.hex}</div>
                  <div className="text-[10px] uppercase tracking-widest text-ink-3 mt-2">{p.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="paper">
        <SectionHead
          eyebrow="Founders"
          title={
            <>
              Available for <em className="not-italic font-extrabold text-herb-600">comment.</em>
            </>
          }
        />
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {founders.map((f) => (
            <div key={f.name} className="bg-paper border border-bordr rounded-lg p-8 flex flex-col gap-3 shadow-soft">
              <div className="text-[11px] uppercase tracking-widest text-herb-600 font-medium">{f.role}</div>
              <div className="font-sans text-2xl text-herb-900">{f.name}</div>
              <p className="text-sm text-ink-2 leading-relaxed">{f.bio}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="ivory">
        <SectionHead
          eyebrow="Recent coverage"
          title={
            <>
              Stories <em className="not-italic font-extrabold text-herb-600">about the platform.</em>
            </>
          }
        />
        <div className="max-w-3xl mx-auto bg-paper border border-bordr rounded-lg p-12 text-center">
          <div className="w-full max-w-xs mx-auto">
            <Image
              src="/illustrations/storyset_inbox_zero.svg"
              alt=""
              width={400}
              height={300}
              className="w-full h-auto"
            />
          </div>
          <div className="font-sans text-2xl text-herb-900 mt-6">No press coverage yet</div>
          <p className="text-ink-2 mt-3 leading-relaxed">
            We launched in April 2026. When stories run, they will be listed here. To pitch a
            piece, write to{' '}
            <a href="mailto:press@wedding.co.tz" className="text-herb-700 underline">
              press@wedding.co.tz
            </a>
            .
          </p>
        </div>
      </Section>
    </main>
  );
}
