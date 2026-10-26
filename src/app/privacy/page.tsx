import Link from 'next/link';
import { Section } from '@/components/Section';

export const metadata = {
  title: 'Privacy policy',
  description:
    'How Wedding by Lockwood collects, uses, and protects personal information for couples, vendors, and guests.',
};

const LAST_UPDATED = '26 October 2026';

const SUPPORT_EMAIL = 'support@wedding.co.tz';

export default function PrivacyPage() {
  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="eyebrow">Legal</div>
          <h1 className="font-sans font-light text-5xl text-herb-900 mt-4">Privacy policy</h1>
          <p className="text-ink-3 mt-2 text-sm">Last updated: {LAST_UPDATED}</p>
          <p className="mt-6 font-sans text-lg text-ink-2 leading-relaxed">
            This policy explains how Lockwood Technology Tanzania Ltd ("Lockwood", "we", "us") and
            its product Wedding by Lockwood handle personal information for couples, vendors, and
            their guests in Tanzania and the wider East African region.
          </p>
          <p className="mt-3 text-sm text-ink-3">
            We will post any material change here with a fresh "Last updated" date at least 14 days
            before it takes effect.
          </p>
        </div>
      </Section>

      <Section tone="paper" className="!pt-8">
        <div className="max-w-3xl mx-auto text-ink-2 leading-relaxed space-y-10 font-sans">
          <div>
            <h2 className="font-sans text-2xl text-herb-900">1. What we collect</h2>
            <p className="mt-3">
              We collect only what we need to operate the platform and to provide the service you
              have asked for.
            </p>
            <ul className="mt-4 space-y-2 list-disc pl-6 marker:text-herb-600">
              <li>
                <span className="text-ink-1 font-medium">Account data:</span> phone number, name,
                wedding date, theme preferences. Email and partner details are optional.
              </li>
              <li>
                <span className="text-ink-1 font-medium">Couple content:</span> photos, story copy,
                guest list entries, RSVP responses, contribution destinations.
              </li>
              <li>
                <span className="text-ink-1 font-medium">Vendor business data:</span> business
                name, category, service areas, portfolio images, packages, pricing, tax
                identifiers where legally required.
              </li>
              <li>
                <span className="text-ink-1 font-medium">Transaction metadata:</span> the
                identifier, amount, currency, channel (M-Pesa, Mixx by Yas, Airtel Money,
                Halotel, TTCL Pesa, CRDB, NMB), and timestamps for every contribution and
                booking. We never see or store your MNO PIN or bank password.
              </li>
              <li>
                <span className="text-ink-1 font-medium">Contacts:</span> when you tap Import on
                the People screen, the app opens your phone's contact picker and reads only the
                contacts you pick: their name and phone number. We use them only to build your
                guest list and send the invitations you ask us to send, never for marketing, and
                we never read the rest of your address book.
              </li>
              <li>
                <span className="text-ink-1 font-medium">Location:</span> the app does not use
                your phone's precise location (GPS) and never asks for it. When you sign in, we
                look up an approximate city and country from your IP address and keep it in your
                sign-in history, so we can spot a sign-in that is not you. Venue addresses and
                map links you type for your wedding are part of your couple content.
              </li>
              <li>
                <span className="text-ink-1 font-medium">Camera and photos:</span> the camera is
                used only to scan the QR code on invitation cards at the gate, and to take a photo
                you choose to add. Photos you add to your wedding page are stored so your guests
                can see them, and you can remove them from the Story page in the app at any time.
              </li>
              <li>
                <span className="text-ink-1 font-medium">Device + usage:</span> IP address, user
                agent, referring URL, the push notification token of your phone, and event
                analytics linked to your account (for example sign-ins and the invitation links
                your guests open). Used to keep the service running, deliver notifications, and
                spot abuse.
              </li>
              <li>
                <span className="text-ink-1 font-medium">Crashes and performance:</span> the
                mobile app does not include a crash reporting or analytics SDK. Errors are logged
                on your phone only; our servers keep standard request logs linked to your account
                to fix faults and keep the service fast.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">2. Legal basis</h2>
            <p className="mt-3">
              We process personal information under the Tanzania Personal Data Protection Act,
              2022, on one of the following bases:
            </p>
            <ul className="mt-4 space-y-2 list-disc pl-6 marker:text-herb-600">
              <li><span className="text-ink-1 font-medium">Contract:</span> to set up your account, list a vendor profile, accept bookings, or run an RSVP.</li>
              <li><span className="text-ink-1 font-medium">Consent:</span> for marketing communications and any optional analytics beyond what is required to run the platform.</li>
              <li><span className="text-ink-1 font-medium">Legal obligation:</span> to comply with TRA fiscal receipting, anti-money-laundering rules, and lawful regulator requests.</li>
              <li><span className="text-ink-1 font-medium">Legitimate interest:</span> security monitoring, abuse prevention, and platform improvement.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">3. How we use it</h2>
            <ul className="mt-4 space-y-2 list-disc pl-6 marker:text-herb-600">
              <li>To deliver the service you signed up for: vendor discovery, bookings, the budget planner, the guest list, and the personalised story page.</li>
              <li>To verify identity and prevent fraud, including before approving a vendor profile or releasing escrowed funds.</li>
              <li>To send service messages (OTP codes, booking confirmations, deposit receipts, RSVP notifications).</li>
              <li>To produce TRA-compliant EFD receipts on transactions where this is required.</li>
              <li>To respond to your support requests.</li>
              <li>To improve the platform with event analytics linked to your account, which we review in aggregate.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">4. Where money goes</h2>
            <p className="mt-3">
              Contributions and booking payments are routed to your nominated Changisha, Mchango,
              Lipa Namba, or bank account through Malipopay, our payment partner. For event-day
              vendor payments, funds may be held in a Lockwood-managed escrow account at the
              partner bank and released 24 hours after the event, or refunded within 24 hours if a
              dispute is upheld. The platform is a facilitator, not a custodian, except for the
              limited escrow window described above. We do not hold client funds outside of that
              window.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">5. Sub-processors</h2>
            <p className="mt-3">
              We share personal information only with the sub-processors we need to run the
              service. Each is bound by a written data processing agreement.
            </p>
            <div className="mt-4 rounded-lg border border-bordr overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-herb-50 text-ink-3 text-[11px] uppercase tracking-widest">
                  <tr>
                    <th className="text-left p-4">Sub-processor</th>
                    <th className="text-left p-4">Purpose</th>
                    <th className="text-left p-4">Region</th>
                  </tr>
                </thead>
                <tbody className="text-ink-2">
                  {[
                    ['Malipopay', 'Payment processing, MNO and bank rails, escrow movements. Receives the payer\'s phone number and the amount, to collect michango and payments', 'Tanzania'],
                    ['SMS and WhatsApp providers (Malipopay messaging and Meta WhatsApp Business)', 'Receive guest names and phone numbers and the message text, to send the invitations, reminders and one-time codes you ask for', 'Tanzania / Global'],
                    ['Apple Push Notification service and Firebase Cloud Messaging (Google)', 'Receive your phone\'s push token and the notification text, to deliver notifications to your phone', 'Global'],
                    ['MongoDB Atlas', 'Primary database hosting', 'EU / South Africa'],
                    ['Resend', 'Transactional email delivery', 'EU / US'],
                    ['Cloudflare', 'CDN, DDoS protection, DNS, and storage of the photos and files you upload (R2)', 'Global'],
                    ['DigitalOcean', 'Hosting of our API servers', 'EU'],
                    ['Netlify', 'Web application hosting', 'EU / US'],
                    ['Google and Apple', 'Receive a sign-in request when you choose Continue with Google or Sign in with Apple, and return your name and email', 'Global'],
                  ].map(([who, what, where]) => (
                    <tr key={who} className="border-t border-bordr">
                      <td className="p-4 text-ink-1 font-medium">{who}</td>
                      <td className="p-4">{what}</td>
                      <td className="p-4">{where}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              Each provider receives only the data it needs and is bound to protect it at least as
              well as we do. We do not sell personal information and we do not share it with
              advertisers.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">6. Retention</h2>
            <p className="mt-3">
              We keep your data while your account is open and for 365 days after your wedding
              date, unless the law requires us to keep it longer: transaction records are kept for
              seven years as tax and anti-money-laundering law requires. Couple story pages, guest
              lists and RSVP entries follow the same 365-day rule, and you can delete them sooner.
            </p>
            <p className="mt-3">
              <span className="text-ink-1 font-medium">Deleting your account.</span> In the app,
              open Settings and tap Delete account. Or email{' '}
              <a className="text-herb-700 underline" href={`mailto:${SUPPORT_EMAIL}?subject=Delete%20my%20account`}>
                {SUPPORT_EMAIL}
              </a>{' '}
              from the email on your account, or see{' '}
              <Link href="/delete-account" className="text-herb-700 underline">
                Delete your account
              </Link>
              . Deletion removes your name, phone, email, photo and sign-in history; money records
              stay with the wedding's books as the law requires.
            </p>
            <p className="mt-3">
              <span className="text-ink-1 font-medium">Consent.</span> Where we rely on your
              consent (marketing messages, and any optional analytics we add in future) you can
              withdraw it at any time: turn off notifications in the app's Settings, reply STOP to a
              marketing SMS, or email us. The app has no optional analytics today; if we add any,
              we will ask before it starts and you can switch it off in Settings.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">7. Your rights</h2>
            <p className="mt-3">
              Under the Tanzania PDPA you have the right to access the information we hold about
              you, to ask us to correct or delete it, to object to processing, to data portability,
              and to lodge a complaint with the Personal Data Protection Commission. To exercise
              any of these, write to{' '}
              <a className="text-herb-700 underline" href="mailto:privacy@wedding.co.tz">
                privacy@wedding.co.tz
              </a>{' '}
              with enough detail for us to verify the request. We respond within 30 days. To
              delete your account, see{' '}
              <Link href="/delete-account" className="text-herb-700 underline">
                Delete your account
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">8. Security</h2>
            <p className="mt-3">
              Account access is protected by phone OTP and short-lived RS256 JWT access tokens.
              All traffic is TLS 1.2 or higher. Production databases are encrypted at rest.
              See our{' '}
              <Link href="/security" className="text-herb-700 underline">security page</Link>{' '}
              for the longer view.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">9. Cookies and analytics</h2>
            <p className="mt-3">
              We use a small number of first-party cookies to keep you signed in and to remember
              your preferences. We use event analytics linked to your account to understand which
              parts of the product are useful. We do not run third-party advertising trackers and
              we do not track you across other companies' apps or websites.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">10. Children</h2>
            <p className="mt-3">
              The platform is intended for adults planning weddings. We do not knowingly collect
              personal information from anyone under 18. If you believe a minor has created an
              account, write to us and we will remove the data promptly.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">11. Changes to this policy</h2>
            <p className="mt-3">
              Material changes are posted on this page with at least 14 days' notice before
              taking effect. Continued use of the platform after the effective date is taken as
              acceptance of the updated terms.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">12. Contact</h2>
            <p className="mt-3">
              Lockwood Technology Tanzania Ltd. Privacy office, Dar es Salaam.{' '}
              <a className="text-herb-700 underline" href="mailto:privacy@wedding.co.tz">
                privacy@wedding.co.tz
              </a>
              . For help with the app, or to report a guest message, email{' '}
              <a className="text-herb-700 underline" href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}
