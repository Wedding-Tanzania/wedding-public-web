import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { FeatureBlock, features } from '@/components/marketing/features';
import { MoreFeatures } from '@/components/marketing/MoreFeatures';
import { START_URL } from '@/lib/site-links';

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Guest list and invitation cards, michango by mobile money, budget and spending, tasks for the kamati, a wedding page with a live wish wall, and QR check-in at the gate.',
};

export default function FeaturesPage() {
  return (
    <main>
      <Section tone="ivory" className="!pb-16 !pt-24">
        <div className="max-w-3xl">
          <span className="eyebrow !font-mono !tracking-[0.1em]">Features</span>
          <h1 className="mt-5 font-sans text-[clamp(2.4rem,6vw,4rem)] font-bold leading-[1.05] tracking-[-0.02em] text-ink-1 text-balance">
            One app for the couple and the kamati.
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-ink-2">
            Seven parts of the wedding, kept together: who is invited, who has paid, what has been
            spent, what is still to do, the page your guests open, and the gate on the day.
          </p>
          <nav aria-label="Jump to a feature" className="mt-9 flex flex-wrap gap-2">
            {features.map((f) => (
              <a
                key={f.id}
                href={`#${f.id}`}
                className="rounded-full bg-paper px-3.5 py-1.5 font-sans text-[13px] font-semibold text-ink-2 ring-1 ring-inset ring-bordr hover:text-herb-700 hover:ring-herb-300"
              >
                {f.title}
              </a>
            ))}
          </nav>
        </div>
      </Section>

      <Section tone="paper">
        <div className="flex flex-col gap-28 lg:gap-32">
          {features.map((f, i) => (
            <FeatureBlock key={f.id} feature={f} index={i} />
          ))}
        </div>
      </Section>

      <Section tone="cream">
        <MoreFeatures />
      </Section>

      <section className="bg-herb-800 px-6 py-20 lg:px-12">
        <div className="mx-auto flex max-w-wrap flex-col items-start gap-8">
          <h2 className="max-w-2xl font-sans text-[clamp(1.9rem,4vw,2.75rem)] font-bold leading-[1.12] text-linen text-balance">
            Start your wedding and invite your kamati.
          </h2>
          <div className="flex flex-wrap gap-3.5">
            <Link href={START_URL} className="btn bg-linen text-herb-800 hover:bg-paper">
              Start planning
            </Link>
            <Link href="/app" className="btn text-linen ring-1 ring-inset ring-linen/60 hover:ring-linen">
              Get the app
            </Link>
          </div>
          <p className="font-sans text-sm text-herb-200">
            Run a wedding business?{' '}
            <Link href="/vendors/join" className="font-semibold text-linen underline underline-offset-4">
              List it with us
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
