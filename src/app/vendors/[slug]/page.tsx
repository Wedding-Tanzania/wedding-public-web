import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Vendor } from '@/lib/types';
import { apiGet } from '@/lib/api';
import { Section } from '@/components/Section';
import { COUPLE_APP_URL } from '@/lib/site-links';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const v = await apiGet<Vendor>(`/vendors/${encodeURIComponent(params.slug)}`);
    return { title: v.businessName, description: v.description || undefined };
  } catch {
    return { title: 'Vendor not found', robots: { index: false, follow: false } };
  }
}

/**
 * A verified vendor's public profile. Only what the vendor saved is shown:
 * an unknown slug is a 404 (no made-up demo vendor), packages appear only
 * when the vendor has added them, and there are no ratings until reviews
 * exist in the product.
 */
export default async function VendorProfilePage({ params }: { params: { slug: string } }) {
  let vendor: Vendor;
  try {
    vendor = await apiGet<Vendor>(`/vendors/${encodeURIComponent(params.slug)}`);
  } catch (err) {
    // An unknown or unverified vendor is a 404; anything else (API down)
    // goes to the error page rather than pretending the vendor is missing.
    if (err instanceof Error && /failed: 404$/.test(err.message)) notFound();
    throw err;
  }

  const pkgs = vendor.packages ?? [];
  const themes = vendor.themes ?? [];
  const facts: Array<[string, string]> = [];
  if (vendor.yearsInBusiness !== undefined) facts.push(['Years in business', String(vendor.yearsInBusiness)]);
  if (vendor.serviceAreas.length > 0) facts.push(['Areas served', vendor.serviceAreas.join(', ')]);
  if (themes.length > 0) facts.push(['Wedding themes', themes.map((t) => t.replace(/_/g, ' ')).join(', ')]);

  return (
    <main>
      <section
        className="px-6 lg:px-12 pt-32 pb-16"
        style={{
          background: 'radial-gradient(ellipse at top, var(--w-herb-50), var(--w-linen) 70%)',
        }}
      >
        <div className="max-w-wrap mx-auto">
          {vendor.verified && (
            <div className="flex items-center gap-3 mb-6">
              <span className="tag">Verified</span>
            </div>
          )}
          <h1 className="font-sans font-light text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-tight text-herb-900">
            {vendor.businessName}
          </h1>
          <div className="mt-4 text-[11px] uppercase tracking-widest text-ink-3">
            {vendor.category.replace(/_/g, ' ')}
            {vendor.serviceAreas.length > 0 ? ` · ${vendor.serviceAreas.join(' · ')}` : ''}
          </div>
          {vendor.description && (
            <p className="font-sans text-xl text-ink-2 mt-6 max-w-3xl leading-relaxed">
              {vendor.description}
            </p>
          )}
          <div className="flex flex-wrap gap-4 mt-10">
            <a href={`${COUPLE_APP_URL}/vendors/${encodeURIComponent(vendor.slug)}`} className="btn btn-primary">
              Request a quote
            </a>
            {pkgs.length > 0 && (
              <a href="#packages" className="btn btn-outline">
                See packages
              </a>
            )}
          </div>
          <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-ink-3">
            You sign in to your wedding on Wedding by Lockwood, and the request goes straight to{' '}
            {vendor.businessName}. Track the reply in My vendors.
          </p>
        </div>
      </section>

      {pkgs.length > 0 && (
        <Section tone="paper">
          <div id="packages" className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-start">
            <div className="lg:sticky lg:top-32">
              <div className="eyebrow">Packages</div>
              <h2 className="font-sans font-light text-4xl mt-4 text-herb-900">What they offer.</h2>
              <p className="text-ink-2 mt-4 leading-relaxed">
                Packages as the vendor has listed them. Request a quote to fit your day.
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
                  {p.priceTzs > 0 && (
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-widest text-ink-3">From</div>
                      <div className="font-sans text-3xl text-herb-700">
                        TZS {p.priceTzs.toLocaleString('en-TZ')}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {facts.length > 0 && (
        <Section tone="cream">
          <div className="grid gap-8 max-w-5xl mx-auto sm:grid-cols-3">
            {facts.map(([l, v]) => (
              <div key={l} className="text-center">
                <div className="font-sans text-2xl text-herb-700 capitalize">{v}</div>
                <div className="text-[10px] uppercase tracking-widest text-ink-3 mt-3">{l}</div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </main>
  );
}
