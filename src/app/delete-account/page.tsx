import Link from 'next/link';
import { Section } from '@/components/Section';

// Google Play asks every app that has accounts for a public page that says how to delete one,
// reachable without installing the app. What it lists matches what the API does on delete
// (wedding-api src/services/account-deletion.service.ts): keep the two in step.
export const metadata = {
  title: 'Delete your account',
  description:
    'How to delete your Wedding by Lockwood account, what is erased, and what is kept.',
};

const LAST_UPDATED = 'October 2026';

export default function DeleteAccountPage() {
  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="eyebrow">Your account</div>
          <h1 className="font-sans font-light text-5xl text-herb-900 mt-4">
            Delete your account
          </h1>
          <p className="text-ink-3 mt-2 text-sm">Last updated: {LAST_UPDATED}</p>
          <p className="mt-6 font-sans text-lg text-ink-2 leading-relaxed">
            You can delete your Wedding by Lockwood account at any time, from the app or by
            writing to us. Deleting it cannot be undone.
          </p>
        </div>
      </Section>

      <Section tone="paper" className="!pt-8">
        <div className="max-w-3xl mx-auto text-ink-2 leading-relaxed space-y-10 font-sans">
          <div>
            <h2 className="font-sans text-2xl text-herb-900">In the app</h2>
            <ol className="mt-4 space-y-2 list-decimal pl-6 marker:text-herb-600">
              <li>Open the Wedding app and sign in.</li>
              <li>Tap the menu icon at the top right of the home screen to open your profile.</li>
              <li>Open Settings and tap Delete account.</li>
              <li>Type DELETE to confirm, then tap Delete my account.</li>
            </ol>
            <p className="mt-4">
              Your account is deleted straight away and the app signs you out.
            </p>
            <p className="mt-3">
              If you own a wedding that other people are still planning with you, the app asks
              you to hand ownership to one of them first (Workspace settings, Transfer
              ownership), so their wedding is not closed on them.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">Without the app</h2>
            <p className="mt-3">
              Write to{' '}
              <a className="text-herb-700 underline" href="mailto:privacy@wedding.co.tz?subject=Delete%20my%20account">
                privacy@wedding.co.tz
              </a>{' '}
              from the email address on your account, or include the phone number you sign in
              with, and ask us to delete your account. We may ask you to confirm the request
              from that phone or email before we act. We complete deletions within 30 days.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">What is deleted</h2>
            <ul className="mt-4 space-y-2 list-disc pl-6 marker:text-herb-600">
              <li>Your name, phone numbers, email address, profile photo and password.</li>
              <li>Your Google sign-in link and your sign-in history.</li>
              <li>Your place in every wedding and kamati you belong to, and your open tasks.</li>
              <li>A wedding you were planning on your own, which is closed.</li>
              <li>A vendor business you own, which is closed and removed from the directory.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">What is kept, and why</h2>
            <ul className="mt-4 space-y-2 list-disc pl-6 marker:text-herb-600">
              <li>
                Pledges, contributions and payments you recorded stay in the books of the
                wedding they belong to. They are that couple&apos;s financial records, and
                payment records must be kept for accounting and legal reasons.
              </li>
              <li>
                A record that an account existed and was deleted, with no name or contact
                details on it, so those books still add up.
              </li>
            </ul>
            <p className="mt-4">
              After deletion your phone number and email are free again: you can create a new
              account with them later, which starts empty.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-2xl text-herb-900">More</h2>
            <p className="mt-3">
              Our{' '}
              <Link href="/privacy" className="text-herb-700 underline">
                privacy policy
              </Link>{' '}
              explains what we collect and your other rights. Questions:{' '}
              <a className="text-herb-700 underline" href="mailto:privacy@wedding.co.tz">
                privacy@wedding.co.tz
              </a>
              .
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}
