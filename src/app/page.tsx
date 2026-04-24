import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Plan your wedding. <br />
            Collect contributions. <br />
            All in one place.
          </h1>
          <p className="mt-6 max-w-2xl text-lg opacity-90">
            Wedding.co.tz is Tanzania&apos;s home for engaged couples and the vendors who bring
            weddings to life. Build your story page, share your invitation, and let family and
            friends contribute directly via M-Pesa Changisha, Mixx by YAS Mchango, or bank.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="https://app.wedding.co.tz"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-primary shadow-md hover:bg-gray-50"
            >
              Start your wedding page
            </Link>
            <Link
              href="/vendors"
              className="rounded-lg border border-white/40 px-6 py-3 font-semibold hover:bg-white/10"
            >
              Browse vendors
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-3 gap-8">
        <Feature
          title="Your story, your page"
          body="A beautiful, shareable webpage for your wedding, with your story, schedule, gallery, RSVPs, and contribution link."
        />
        <Feature
          title="Find the right vendor"
          body="Photographers, caterers, venues, decor, and more. Filter by theme, from traditional Chagga to coastal Swahili."
        />
        <Feature
          title="Kuchangiana, digitised"
          body="Guests pledge and pay directly to your Changisha, Mchango, Lipa Namba, or bank account. You never leave funds on our platform."
        />
      </section>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-secondary">{title}</h3>
      <p className="mt-3 text-gray-600">{body}</p>
    </div>
  );
}
