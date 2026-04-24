import { notFound } from 'next/navigation';
import type { Vendor } from '@wedding/shared-types';
import { apiGet } from '@/lib/api';

export const revalidate = 60;

export default async function VendorProfilePage({ params }: { params: { slug: string } }) {
  let vendor: Vendor;
  try {
    vendor = await apiGet<Vendor>(`/vendors/${params.slug}`);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-bold text-secondary">{vendor.businessName}</h1>
      <p className="mt-1 text-gray-500 capitalize">{vendor.category.replace('_', ' ')}</p>
      <p className="mt-6 max-w-3xl text-gray-700">{vendor.description}</p>

      {vendor.packages.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-secondary">Packages</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {vendor.packages.map((p) => (
              <div key={p.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-secondary">{p.name}</h3>
                <p className="mt-1 text-primary font-bold">
                  TZS {p.priceTzs.toLocaleString('en-TZ')}
                </p>
                <p className="mt-2 text-sm text-gray-600">{p.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
