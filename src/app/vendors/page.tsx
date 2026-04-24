import Link from 'next/link';
import type { Vendor } from '@wedding/shared-types';
import { apiGet } from '@/lib/api';

export const revalidate = 60;

interface VendorListResponse {
  items: Vendor[];
  page: number;
  total: number;
}

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
  } catch {
    data = { items: [], page: 1, total: 0 };
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-bold text-secondary">Wedding vendors</h1>
      <p className="mt-3 text-gray-600">
        Discover Tanzania&apos;s best wedding vendors, filtered by theme and category.
      </p>

      {data.items.length === 0 ? (
        <p className="mt-12 text-gray-500">
          No vendors listed yet. Vendor onboarding opens as part of Phase 1.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((v) => (
            <Link
              key={v.id}
              href={`/vendors/${v.slug}`}
              className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-secondary">{v.businessName}</h3>
              <p className="mt-1 text-sm text-gray-500 capitalize">
                {v.category.replace('_', ' ')}
              </p>
              <p className="mt-3 text-sm text-gray-600 line-clamp-3">{v.description}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
