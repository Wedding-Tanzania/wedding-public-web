import Link from 'next/link';
import type { Vendor } from '@wedding/shared-types';
import { apiGet } from '@/lib/api';
import { Section, SectionHead } from '@/components/Section';

export const revalidate = 60;
export const metadata = { title: 'Vendors' };

interface VendorListResponse {
  items: Vendor[];
  page: number;
  total: number;
}

const sampleVendors: Vendor[] = [
  {
    id: '1',
    userId: 'u1',
    slug: 'kilima-gardens-estate',
    businessName: 'Kilima Gardens Estate',
    category: 'venue',
    serviceAreas: ['Dar es Salaam'],
    yearsInBusiness: 12,
    verified: true,
    highlyRated: true,
    fastResponder: true,
    themes: ['garden', 'rooftop_urban'],
    description: 'An estate venue on Bagamoyo Road with a garden pavilion, terrace, and a 320-seat main hall.',
    portfolioImageUrls: [],
    packages: [],
    rating: 4.9,
    reviewCount: 81,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '2',
    userId: 'u2',
    slug: 'mushi-studios',
    businessName: 'Mushi Studios',
    category: 'photographer',
    serviceAreas: ['Dar es Salaam', 'Zanzibar'],
    yearsInBusiness: 6,
    verified: true,
    highlyRated: true,
    fastResponder: true,
    themes: ['coastal_swahili', 'beach_zanzibar', 'christian_church'],
    description: 'Photo and motion for weddings, with a still, documentary eye. Two-photographer days as standard.',
    portfolioImageUrls: [],
    packages: [],
    rating: 4.95,
    reviewCount: 64,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '3',
    userId: 'u3',
    slug: 'komba-catering',
    businessName: 'Komba Catering',
    category: 'caterer',
    serviceAreas: ['Dar es Salaam', 'Bagamoyo'],
    yearsInBusiness: 9,
    verified: true,
    highlyRated: true,
    fastResponder: false,
    themes: ['traditional_chagga', 'coastal_swahili', 'islamic_nikah'],
    description: 'Coastal-Swahili-led menus with Indian Ocean seafood. Halal certified. Up to 600 guests.',
    portfolioImageUrls: [],
    packages: [],
    rating: 4.8,
    reviewCount: 52,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '4',
    userId: 'u4',
    slug: 'bloom-florals',
    businessName: 'Bloom & Co Florals',
    category: 'decor',
    serviceAreas: ['Dar es Salaam', 'Arusha'],
    yearsInBusiness: 4,
    verified: true,
    highlyRated: false,
    fastResponder: true,
    themes: ['garden', 'rooftop_urban', 'christian_church'],
    description: 'Romantic, garden-style florals with seasonal local stems. Aisle, ceremony arch, and tablescapes.',
    portfolioImageUrls: [],
    packages: [],
    rating: 4.7,
    reviewCount: 31,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '5',
    userId: 'u5',
    slug: 'dj-shanto',
    businessName: 'DJ Shanto',
    category: 'dj_mc',
    serviceAreas: ['Dar es Salaam', 'Mwanza'],
    yearsInBusiness: 8,
    verified: true,
    highlyRated: true,
    fastResponder: true,
    themes: ['rooftop_urban', 'christian_church', 'islamic_nikah'],
    description: 'Bilingual MC and DJ. Strong with Bongo Flava, Afrobeats, classic Bongo, and Bollywood mash-ups.',
    portfolioImageUrls: [],
    packages: [],
    rating: 4.9,
    reviewCount: 47,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '6',
    userId: 'u6',
    slug: 'amara-cakes',
    businessName: 'Amara Cake House',
    category: 'cake',
    serviceAreas: ['Dar es Salaam'],
    yearsInBusiness: 5,
    verified: true,
    highlyRated: false,
    fastResponder: true,
    themes: ['garden', 'beach_zanzibar', 'islamic_nikah'],
    description: 'Tiered cakes, dessert tables, and grooms cakes. Vegan and gluten-free options.',
    portfolioImageUrls: [],
    packages: [],
    rating: 4.6,
    reviewCount: 23,
    createdAt: '',
    updatedAt: '',
  },
];

const categoryFilters = [
  { value: '', label: 'All' },
  { value: 'venue', label: 'Venues' },
  { value: 'photographer', label: 'Photography' },
  { value: 'caterer', label: 'Catering' },
  { value: 'decor', label: 'Décor & florals' },
  { value: 'dj_mc', label: 'DJ & MC' },
  { value: 'cake', label: 'Cake' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'transport', label: 'Transport' },
];

const themeFilters = [
  { value: '', label: 'All themes' },
  { value: 'garden', label: 'Garden' },
  { value: 'beach_zanzibar', label: 'Beach · Zanzibar' },
  { value: 'rooftop_urban', label: 'Rooftop · urban' },
  { value: 'coastal_swahili', label: 'Coastal Swahili' },
  { value: 'islamic_nikah', label: 'Islamic · Nikah' },
  { value: 'christian_church', label: 'Christian church' },
  { value: 'traditional_chagga', label: 'Traditional · Chagga' },
];

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: { category?: string; theme?: string };
}) {
  const query = new URLSearchParams();
  if (searchParams.category !== undefined) query.set('category', searchParams.category);
  if (searchParams.theme !== undefined) query.set('theme', searchParams.theme);

  let data: VendorListResponse;
  try {
    data = await apiGet<VendorListResponse>(`/vendors?${query.toString()}`);
    if (data.items.length === 0) data = { items: sampleVendors, page: 1, total: sampleVendors.length };
  } catch {
    data = { items: sampleVendors, page: 1, total: sampleVendors.length };
  }

  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="ornament justify-center">— Marketplace —</div>
          <h1 className="mt-4 font-display font-light text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-tight text-blush-900">
            Verified vendors.
            <br />
            <em className="italic text-blush-600">From across East Africa.</em>
          </h1>
          <p className="mt-6 font-display italic text-xl text-ink-2 leading-relaxed">
            Filter by theme, category, or city. Every listing reviewed by our team.
          </p>
        </div>
      </Section>

      <Section tone="paper" className="!pt-12">
        <div className="flex flex-wrap gap-3 items-center mb-10 pb-6 border-b border-bordr">
          <span className="text-[11px] uppercase tracking-widest3 text-ink-3">Category</span>
          {categoryFilters.map((f) => (
            <FilterPill
              key={`cat-${f.value}`}
              href={f.value === '' ? '/vendors' : `/vendors?category=${f.value}`}
              active={(searchParams.category ?? '') === f.value}
              label={f.label}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-3 items-center mb-12">
          <span className="text-[11px] uppercase tracking-widest3 text-ink-3">Theme</span>
          {themeFilters.map((f) => (
            <FilterPill
              key={`th-${f.value}`}
              href={f.value === '' ? '/vendors' : `/vendors?theme=${f.value}`}
              active={(searchParams.theme ?? '') === f.value}
              label={f.label}
            />
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((v) => (
            <VendorCard key={v.id} v={v} />
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="font-display italic text-ink-3">
            Showing {data.items.length} of {data.total} vendors.
          </p>
        </div>
      </Section>
    </main>
  );
}

function FilterPill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`text-xs px-4 py-2 rounded-full border transition ${
        active
          ? 'bg-blush-600 text-paper border-blush-600'
          : 'bg-paper text-ink-2 border-bordr hover:border-blush-300'
      }`}
    >
      {label}
    </Link>
  );
}

function VendorCard({ v }: { v: Vendor }) {
  return (
    <Link
      href={`/vendors/${v.slug}`}
      className="group block bg-paper border border-bordr rounded-lg overflow-hidden shadow-soft hover:shadow-brand transition"
    >
      <div className="h-44 bg-gradient-to-br from-blush-100 via-paper to-champagne relative">
        {v.verified && (
          <div className="absolute top-3 right-3 bg-paper text-blush-700 text-[10px] px-3 py-1 rounded-full font-medium uppercase tracking-widest3 border border-blush-100">
            ✓ Verified
          </div>
        )}
        {v.highlyRated && (
          <div className="absolute top-3 left-3 bg-blush-600 text-paper text-[10px] px-3 py-1 rounded-full font-medium uppercase tracking-widest3">
            Highly rated
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="font-display text-2xl text-blush-900 group-hover:text-blush-700 transition">
          {v.businessName}
        </div>
        <div className="text-[10px] uppercase tracking-widest3 text-ink-3 mt-1">
          {v.category.replace('_', ' ')} · {v.serviceAreas.join(', ')}
        </div>
        <p className="mt-4 text-sm text-ink-2 leading-relaxed line-clamp-3">{v.description}</p>
        <div className="mt-5 pt-4 border-t border-bordr flex items-center justify-between">
          {v.rating !== undefined && (
            <div className="text-sm text-ink-1">
              <span className="font-display text-lg">{v.rating.toFixed(1)}</span>
              <span className="text-ink-3 ml-2 text-xs">({v.reviewCount})</span>
            </div>
          )}
          <span className="text-[11px] uppercase tracking-widest3 text-blush-600 group-hover:text-blush-800">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
