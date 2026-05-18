import { Section } from '@/components/Section';

export const metadata = { title: 'Privacy' };

export default function PrivacyPage() {
  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="eyebrow">Legal</div>
          <h1 className="font-sans font-light text-5xl text-herb-900 mt-4">Privacy policy</h1>
          <p className="text-ink-3 mt-2 text-sm">Last updated: April 2026</p>
        </div>
      </Section>
      <Section tone="paper" className="!pt-8">
        <div className="prose prose-lg max-w-3xl mx-auto text-ink-2 leading-relaxed space-y-6 font-sans">
          <p>
            Wedding by Lockwood ("we", "us") respects your privacy. This is a placeholder policy
            and will be replaced by a TCRA / Bank of Tanzania reviewed version before public launch.
          </p>
          <h2 className="font-sans text-2xl text-herb-900">What we collect</h2>
          <p>
            Account data: phone number, name, wedding date, theme preferences. Optional: email,
            partner details, photos, vendor portfolio. We never collect MNO PINs or bank passwords.
          </p>
          <h2 className="font-sans text-2xl text-herb-900">Where money goes</h2>
          <p>
            Contributions land directly in your own Changisha, Mchango, Lipa Namba, or bank
            account. The platform is a facilitator, not a custodian. We do not hold client funds.
          </p>
          <h2 className="font-sans text-2xl text-herb-900">Contact</h2>
          <p>
            For privacy questions, write to <a className="text-herb-700 underline" href="mailto:privacy@wedding.co.tz">privacy@wedding.co.tz</a>.
          </p>
        </div>
      </Section>
    </main>
  );
}
