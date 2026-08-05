import Link from 'next/link';
import { Section } from '@/components/Section';

export const metadata = {
  title: 'Terms of service',
  description:
    'Terms governing use of the Wedding by Lockwood platform by couples, vendors, and guests.',
};

const LAST_UPDATED = 'April 2026';

export default function TermsPage() {
  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="eyebrow">Legal</div>
          <h1 className="font-sans font-light text-5xl text-herb-900 mt-4">Terms of service</h1>
          <p className="text-ink-3 mt-2 text-sm">Last updated: {LAST_UPDATED}</p>
          <p className="mt-6 font-sans text-lg text-ink-2 leading-relaxed">
            These terms govern your use of the Wedding by Lockwood platform (the "Platform"),
            operated by Lockwood Technology Tanzania Ltd ("Lockwood", "we", "us"). By creating an
            account or otherwise using the Platform, you agree to these terms.
          </p>
          <p className="mt-3 text-sm text-ink-3">
            This is a first-draft set of terms published in good faith. They will be reviewed by
            counsel before public launch. Material changes will be posted here with at least 14
            days' notice.
          </p>
        </div>
      </Section>

      <Section tone="paper" className="!pt-8">
        <div className="max-w-3xl mx-auto text-ink-2 leading-relaxed space-y-10 font-sans">
          <div>
            <h2 className="font-sans text-2xl text-herb-900">1. Eligibility and accounts</h2>
            <p className="mt-3">
              You must be 18 or older and able to enter into a binding contract under the laws of
              Tanzania to use the Platform. You agree to provide accurate registration details and
              to keep them current. You are responsible for all activity that happens under your
              account, and for safeguarding your sign-in credentials and OTP codes.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">2. The service</h2>
            <p className="mt-3">
              Wedding by Lockwood provides three connected products: (a) a planning workspace for
              couples (budget, checklist, guest list, story page); (b) a vendor marketplace and
              business workspace; and (c) a payments layer that routes contributions and bookings
              through Malipopay to your nominated mobile money or bank account, with an optional
              escrow window for event-day vendor payments. The Platform is a facilitator. We are
              not the seller of vendor services and we are not, except for the limited escrow
              window described in Section 6, a custodian of client funds.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">3. Couple accounts</h2>
            <ul className="mt-4 space-y-2 list-disc pl-6 marker:text-herb-600">
              <li>You may publish a personalised story page, RSVP page, and contribution destination.</li>
              <li>You are responsible for the content you publish, including photos, copy, and guest data, and for the lawful basis on which any guest data is shared with us.</li>
              <li>You may not publish content that is unlawful, hateful, sexually explicit, or otherwise harmful.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">4. Vendor accounts</h2>
            <ul className="mt-4 space-y-2 list-disc pl-6 marker:text-herb-600">
              <li>To be listed, vendors must operate a registered business in Tanzania (or any market we have launched in), provide accurate business and tax details, and pass our verification review.</li>
              <li>Vendors set their own packages, prices, and availability, and are solely responsible for the goods and services they provide.</li>
              <li>Vendors must respond to enquiries in good faith and honour confirmed bookings.</li>
              <li>We may remove vendor listings that violate these terms, generate sustained negative reviews, or fail to meet baseline service quality.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">5. Fees</h2>
            <p className="mt-3">
              Couple accounts are free to use for planning and for collecting contributions
              directly into your Changisha, Mchango, Lipa Namba, or bank account. Vendor
              subscriptions and per-transaction fees are listed on our{' '}
              <Link href="/pricing" className="text-herb-700 underline">pricing page</Link>{' '}
              and are deducted at point of collection. Payment processing fees charged by the
              underlying mobile money operator or bank are passed through transparently.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">6. Payments, escrow, refunds</h2>
            <p className="mt-3">
              Contributions and most booking payments settle directly to your nominated account
              with no escrow window. For vendor bookings flagged "escrow on", deposits are held
              in a Lockwood-managed escrow account at the partner bank and released 24 hours
              after the event. If a dispute is opened within that window and the dispute is
              upheld, the deposit is refunded to the payer within 24 hours of the decision.
              Refunds otherwise follow the policy stated by the vendor on the booking page.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">7. Prohibited use</h2>
            <ul className="mt-4 space-y-2 list-disc pl-6 marker:text-herb-600">
              <li>No fraud, money laundering, sanctions evasion, or tax evasion.</li>
              <li>No automated scraping, mass-downloading of vendor data, or reverse engineering of the Platform.</li>
              <li>No publishing of third parties' personal information without lawful basis.</li>
              <li>No use of the Platform to harass, threaten, or defame any person.</li>
              <li>No circumvention of fees, including off-platform settlement after a Platform-introduced enquiry.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">8. Intellectual property</h2>
            <p className="mt-3">
              The Platform, including the Wedding by Lockwood name, logo, design system, and
              software, is the intellectual property of Lockwood. You retain ownership of the
              content you publish on the Platform, and grant us a worldwide, royalty-free licence
              to host, display, and reproduce it for the purpose of providing the service. The
              licence ends when you delete the content or close your account, except where we
              must retain copies to comply with law.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">9. Reviews</h2>
            <p className="mt-3">
              Couples may leave reviews of vendors they have booked. Reviews must be honest, in
              good faith, and based on first-hand experience. We may remove reviews that are
              clearly fraudulent, defamatory, or in breach of these terms.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">10. Suspension and termination</h2>
            <p className="mt-3">
              You may close your account at any time from your settings. We may suspend or
              terminate access where you breach these terms, where required by law, or where
              continued use would expose Lockwood or other users to material risk. Where
              practical we give notice before terminating.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">11. Disclaimers and liability</h2>
            <p className="mt-3">
              The Platform is provided "as is" and "as available". We do not warrant the quality,
              safety, or lawfulness of any vendor goods or services, nor the accuracy of vendor
              listings. To the maximum extent permitted by law, Lockwood's aggregate liability to
              you for any claim arising from your use of the Platform is capped at the greater of
              (a) the fees you paid to Lockwood in the 12 months preceding the claim and (b) TZS
              500,000. Nothing in these terms limits liability that cannot lawfully be limited.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">12. Governing law and disputes</h2>
            <p className="mt-3">
              These terms are governed by the laws of the United Republic of Tanzania. We try to
              resolve disputes informally first. Disputes that cannot be resolved within 30 days
              are submitted to binding arbitration in Dar es Salaam under the rules of the
              National Construction Council, except where applicable consumer protection law
              requires court resolution.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">13. Changes</h2>
            <p className="mt-3">
              We may update these terms from time to time. Material changes are posted on this
              page with at least 14 days' notice. Continued use of the Platform after the
              effective date is taken as acceptance.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">14. Contact</h2>
            <p className="mt-3">
              Lockwood Technology Tanzania Ltd, Dar es Salaam.{' '}
              <a className="text-herb-700 underline" href="mailto:legal@wedding.co.tz">
                legal@wedding.co.tz
              </a>
              .
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}
