import { Section } from '@/components/Section';

export const metadata = { title: 'Security' };

export default function SecurityPage() {
  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="ornament">— Trust —</div>
          <h1 className="font-display font-light text-5xl text-blush-900 mt-4">Security</h1>
          <p className="font-display italic text-xl text-ink-2 mt-4">
            How we protect couples, vendors, and the money that flows through the platform.
          </p>
        </div>
      </Section>
      <Section tone="paper" className="!pt-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {[
            ['We never hold client funds', 'Contributions flow directly to your own Changisha, Mchango, Lipa Namba, or bank account. Wedding by Lockwood is a facilitator, never a custodian.'],
            ['Payments via Malipopay', 'All transactions are processed by Malipopay, a Bank of Tanzania-supervised payment gateway. Signed webhooks; verified end-to-end.'],
            ['No PINs on file', 'We never collect, store, or transmit your mobile money PIN or bank password.'],
            ['RS256 JWT auth', 'Signed access tokens with short lifetimes; refresh-token rotation; phone OTP for sign-in.'],
            ['Verified vendors only', 'Every vendor is reviewed by our team before going live. Verified, Highly Rated, and Fast Responder badges signal trust at a glance.'],
            ['TRA fiscal receipts', 'Every vendor transaction produces a TRA-compliant EFD receipt automatically.'],
          ].map(([t, b]) => (
            <div key={t} className="border-l-2 border-blush-300 pl-6">
              <div className="font-display text-2xl text-blush-900">{t}</div>
              <p className="text-ink-2 mt-2 leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
