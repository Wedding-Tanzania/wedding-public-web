import Link from 'next/link';
import type { Vendor } from '@/lib/types';
import { apiGet } from '@/lib/api';
import { Section } from '@/components/Section';

export const revalidate = 60;
export const metadata = { title: 'Vendors' };

interface VendorListResponse {
  items: Vendor[];
  page: number;
  total: number;
}

const categoryFilters = [
  { value: '', label: 'All' },
  { value: 'venue', label: 'Venues' },
  { value: 'photographer', label: 'Photography' },
  { value: 'caterer', label: 'Catering' },
  { value: 'decor', label: 'Décor & florals' },
  { value: 'dj_mc', label: 'DJ & MC' },
  { value: 'cake', label: 'Cake' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'bridal_wear', label: 'Bridal wear' },
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

  // Only real, verified listings. When there are none (or the API is down)
  // the page says so instead of showing made-up businesses.
  let data: VendorListResponse | null;
  try {
    data = await apiGet<VendorListResponse>(`/vendors?${query.toString()}`);
  } catch {
    data = null;
  }
  const items = data?.items ?? [];
  const filtered = searchParams.category !== undefined || searchParams.theme !== undefined;

  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="eyebrow justify-center">Vendors</div>
          <h1 className="mt-4 font-sans font-light text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-tight text-herb-900">
            Verified wedding businesses.
          </h1>
          <p className="mt-6 font-sans text-xl text-ink-2 leading-relaxed">
            Filter by category or theme. Every listing here has been checked by our team.
          </p>
        </div>
      </Section>

      <Section tone="paper" className="!pt-12">
        <div className="flex flex-wrap gap-3 items-center mb-10 pb-6 border-b border-bordr">
          <span className="text-[11px] uppercase tracking-widest text-ink-3">Category</span>
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
          <span className="text-[11px] uppercase tracking-widest text-ink-3">Theme</span>
          {themeFilters.map((f) => (
            <FilterPill
              key={`th-${f.value}`}
              href={f.value === '' ? '/vendors' : `/vendors?theme=${f.value}`}
              active={(searchParams.theme ?? '') === f.value}
              label={f.label}
            />
          ))}
        </div>

        {items.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((v) => (
                <VendorCard key={v.id} v={v} />
              ))}
            </div>
            <div className="text-center mt-16">
              <p className="font-sans text-ink-3">
                Showing {items.length} of {data?.total ?? items.length} vendors.
              </p>
            </div>
          </>
        ) : (
          <div className="mx-auto flex max-w-xl flex-col items-center gap-5 py-16 text-center">
            <h2 className="font-sans text-2xl font-bold text-ink-1">
              {data === null
                ? 'The vendor list could not be loaded just now.'
                : filtered
                  ? 'No verified vendors in this category yet.'
                  : 'The first verified vendors are being added.'}
            </h2>
            <p className="font-sans text-[15px] leading-relaxed text-ink-2">
              {data === null
                ? 'Please try again in a minute.'
                : 'Run a wedding business? List it, and couples will find it here once our team has verified it.'}
            </p>
            <Link href="/vendors/join" className="btn btn-primary">
              List your business
            </Link>
          </div>
        )}
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
          ? 'bg-herb-600 text-paper border-herb-600'
          : 'bg-paper text-ink-2 border-bordr hover:border-herb-300'
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
      <div className="h-44 bg-gradient-to-b from-herb-50 to-paper relative">
        {v.verified && (
          <div className="absolute top-3 right-3 bg-paper text-herb-700 text-[10px] px-3 py-1 rounded-full font-medium uppercase tracking-widest border border-herb-100">
            ✓ Verified
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="font-sans text-2xl text-herb-900 group-hover:text-herb-700 transition">
          {v.businessName}
        </div>
        <div className="text-[10px] uppercase tracking-widest text-ink-3 mt-1">
          {v.category.replace('_', ' ')} · {v.serviceAreas.join(', ')}
        </div>
        <p className="mt-4 text-sm text-ink-2 leading-relaxed line-clamp-3">{v.description}</p>
        <div className="mt-5 pt-4 border-t border-bordr flex items-center justify-between">
          {v.verified ? (
            <span className="text-[11px] uppercase tracking-widest text-ink-3">Verified listing</span>
          ) : (
            <span />
          )}
          <span className="text-[11px] uppercase tracking-widest text-herb-600 group-hover:text-herb-800">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
