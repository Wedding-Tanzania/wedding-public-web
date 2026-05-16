import { Section } from '@/components/Section';

export const metadata = { title: 'Terms' };

export default function TermsPage() {
  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="ornament">— Legal —</div>
          <h1 className="font-display font-light text-5xl text-blush-900 mt-4">Terms of service</h1>
          <p className="text-ink-3 mt-2 text-sm">Last updated: April 2026</p>
        </div>
      </Section>
      <Section tone="paper" className="!pt-8">
        <div className="max-w-3xl mx-auto text-ink-2 leading-relaxed space-y-6 font-display">
          <p>
            These are placeholder terms. The production version will be reviewed by counsel and
            published before public launch.
          </p>
          <p>
            By using Wedding by Lockwood you agree that contributions you collect via the platform
            settle directly to your nominated mobile money or bank account, and that platform and
            payment processing fees may be deducted at point of collection.
          </p>
        </div>
      </Section>
    </main>
  );
}
