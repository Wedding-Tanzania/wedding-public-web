import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Vendor } from '@/lib/types';
import { apiGet } from '@/lib/api';
import { Section } from '@/components/Section';

export const revalidate = 60;

const samplePackages = [
  {
    id: 'p1',
    name: 'Half-day ceremony',
    description: 'Six hours of coverage with two photographers. Online gallery and 60 hi-res edits.',
    priceTzs: 2_800_000,
    inclusions: [],
  },
  {
    id: 'p2',
    name: 'Full-day',
    description: 'Twelve hours. Two photographers + assistant. Online gallery, 120 hi-res edits, USB drive.',
    priceTzs: 4_500_000,
    inclusions: [],
  },
  {
    id: 'p3',
    name: 'Two-day celebration',
    description: 'Kitchen party + ceremony + reception. Photo + 4-min motion edit.',
    priceTzs: 7_200_000,
    inclusions: [],
  },
];

export default async function VendorProfilePage({ params }: { params: { slug: string } }) {
  let vendor: Vendor | null = null;
  try {
    vendor = await apiGet<Vendor>(`/vendors/${params.slug}`);
  } catch {
    vendor = null;
  }

  if (vendor === null) {
    // Demo fallback so the design is visible without a running api
    vendor = {
      id: 'demo',
      userId: 'demo',
      slug: params.slug,
      businessName: params.slug
        .split('-')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' '),
      category: 'photographer',
      serviceAreas: ['Dar es Salaam', 'Zanzibar'],
      yearsInBusiness: 6,
      verified: true,
      highlyRated: true,
      fastResponder: true,
      themes: ['coastal_swahili', 'beach_zanzibar'],
      description:
        'A documentary-style studio capturing weddings across coastal Tanzania. Two-photographer days as standard, with motion edits available.',
      portfolioImageUrls: [],
      packages: samplePackages,
      rating: 4.95,
      reviewCount: 64,
      createdAt: '',
      updatedAt: '',
    };
  }

  const pkgs = vendor.packages.length > 0 ? vendor.packages : samplePackages;

  return (
    <main>
      <section
        className="px-6 lg:px-12 pt-32 pb-16"
        style={{
          background: 'radial-gradient(ellipse at top, var(--w-herb-50), var(--w-linen) 70%)',
        }}
      >
        <div className="max-w-wrap mx-auto">
          <div className="flex items-center gap-3 mb-6">
            {vendor.verified && <span className="tag">Verified</span>}
            {vendor.highlyRated && (
              <span className="tag" style={{ background: 'var(--w-sage)', color: 'var(--w-paper)' }}>
                Highly rated
              </span>
            )}
            {vendor.fastResponder && (
              <span className="tag" style={{ background: 'var(--w-herb-100)', color: 'var(--w-herb-700)' }}>
                Fast responder
              </span>
            )}
          </div>
          <h1 className="font-sans font-light text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-tight text-herb-900">
            {vendor.businessName}
          </h1>
          <div className="mt-4 text-[11px] uppercase tracking-widest text-ink-3">
            {vendor.category.replace('_', ' ')} · {vendor.serviceAreas.join(' · ')}
          </div>
          <p className="font-sans text-xl text-ink-2 mt-6 max-w-3xl leading-relaxed">
            {vendor.description}
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link href={`/contact?topic=couple&vendor=${vendor.slug}`} className="btn btn-primary">
              Request a quote
            </Link>
            <a href="#packages" className="btn btn-outline">
              See packages
            </a>
          </div>
        </div>
      </section>

      <Section tone="paper">
        <div id="packages" className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-start">
          <div className="lg:sticky lg:top-32">
            <div className="eyebrow">Packages</div>
            <h2 className="font-sans font-light text-4xl mt-4 text-herb-900">Pricing.</h2>
            <p className="text-ink-2 mt-4 leading-relaxed">
              All packages can be customised. Deposits are paid through Malipopay; the platform fee is
              included in the price shown.
            </p>
          </div>
          <div>
            {pkgs.map((p, i) => (
              <div
                key={p.id}
                className={`grid grid-cols-[1fr_auto] gap-8 items-start py-8 border-t border-bordr ${i === pkgs.length - 1 ? 'border-b' : ''}`}
              >
                <div>
                  <div className="font-sans text-2xl text-herb-900">{p.name}</div>
                  <p className="text-ink-2 leading-relaxed mt-2">{p.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest text-ink-3">From</div>
                  <div className="font-sans text-3xl text-herb-700">
                    TZS {p.priceTzs.toLocaleString('en-TZ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="cream">
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            ['Years', String(vendor.yearsInBusiness ?? 'New')],
            ['Reviews', `${vendor.reviewCount} (${vendor.rating?.toFixed(1) ?? '·'} ★)`],
            ['Themes', vendor.themes.length > 0 ? vendor.themes.length.toString() : 'All'],
          ].map(([l, v]) => (
            <div key={l} className="text-center">
              <div className="font-sans text-5xl text-herb-700">{v}</div>
              <div className="text-[10px] uppercase tracking-widest text-ink-3 mt-3">{l}</div>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
