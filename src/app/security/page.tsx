import Link from 'next/link';
import { Section, SectionHead } from '@/components/Section';

export const metadata = {
  title: 'Security',
  description:
    'How Wedding by Lockwood protects couples, vendors, and the money that flows through the platform.',
};

const trustPoints: Array<[string, string]> = [
  [
    'We never hold client funds',
    'Contributions flow directly to your own Changisha, Mchango, Lipa Namba, or bank account. Wedding by Lockwood is a facilitator, never a custodian.',
  ],
  [
    'Payments via Malipopay',
    'All transactions are processed by Malipopay, a Bank of Tanzania-supervised payment gateway. Signed webhooks, verified end-to-end.',
  ],
  [
    'No PINs on file',
    'We never collect, store, or transmit your mobile money PIN or bank password.',
  ],
  [
    'RS256 JWT auth',
    'Signed access tokens with short lifetimes, refresh-token rotation, phone OTP for sign-in.',
  ],
  [
    'Verified vendors only',
    'Every vendor is reviewed by our team before going live. Verified, Highly Rated, and Fast Responder badges signal trust at a glance.',
  ],
  [
    'TRA fiscal receipts',
    'Every vendor transaction produces a TRA-compliant EFD receipt automatically.',
  ],
];

const architecture: Array<[string, string]> = [
  [
    'Encryption in transit',
    'TLS 1.2+ on every endpoint. HSTS preloaded. Public traffic terminates at Cloudflare; internal traffic stays inside a private VPC.',
  ],
  [
    'Encryption at rest',
    'Production MongoDB Atlas clusters and backups are encrypted with AES-256. Keys are rotated quarterly.',
  ],
  [
    'Least-privilege access',
    'Production access is gated by SSO, MFA, and role-scoped IAM. Engineer access is logged and reviewed monthly.',
  ],
  [
    'Defence in depth',
    'Cloudflare WAF, BullMQ rate limits, request signing on webhooks, per-tenant data partitioning, and per-environment Rabbit vhosts.',
  ],
];

const badges: Array<[string, string]> = [
  ['BoT-supervised', 'Payments via Malipopay, a Bank of Tanzania-supervised gateway'],
  ['TRA EFD', 'Fiscal receipts on every vendor transaction'],
  ['RS256 JWT', 'Signed short-lived tokens with refresh rotation'],
  ['ISO-aligned ops', 'Operational controls modelled on ISO/IEC 27001'],
];

export default function SecurityPage() {
  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="eyebrow">Trust</div>
          <h1 className="font-sans font-light text-5xl text-herb-900 mt-4">Security</h1>
          <p className="font-sans text-xl text-ink-2 mt-4 leading-relaxed">
            How we protect couples, vendors, and the money that flows through the platform.
          </p>
        </div>
      </Section>

      <Section tone="paper" className="!pt-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {trustPoints.map(([t, b]) => (
            <div key={t} className="border-l-2 border-herb-300 pl-6">
              <div className="font-sans text-2xl text-herb-900">{t}</div>
              <p className="text-ink-2 mt-2 leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream">
        <SectionHead
          eyebrow="Architecture"
          title={
            <>
              Four habits, <em className="not-italic font-extrabold text-herb-600">repeated everywhere.</em>
            </>
          }
        />
        <div className="grid md:grid-cols-2 gap-6">
          {architecture.map(([t, b], i) => (
            <div
              key={t}
              className="bg-paper border border-bordr rounded-lg p-10 shadow-soft"
            >
              <div className="font-mono text-[11px] font-bold text-herb-600">
                {(i + 1).toString().padStart(2, '0')}
              </div>
              <div className="font-sans text-2xl text-herb-900 mt-3">{t}</div>
              <p className="text-ink-2 mt-3 leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="paper">
        <SectionHead
          eyebrow="Compliance"
          title={
            <>
              Standards <em className="not-italic font-extrabold text-herb-600">we work to.</em>
            </>
          }
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {badges.map(([label, body]) => (
            <div
              key={label}
              className="bg-paper border border-bordr rounded-lg p-6 text-center"
            >
              <div className="tag tag-ok">{label}</div>
              <p className="text-sm text-ink-2 mt-4 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="ivory">
        <div className="max-w-3xl mx-auto">
          <div className="eyebrow">Incident response</div>
          <h2 className="mt-4 font-sans font-light text-[clamp(1.8rem,3.5vw,2.8rem)] leading-tight text-herb-900">
            If something goes wrong, you hear from us first.
          </h2>
          <p className="mt-6 text-ink-2 leading-relaxed">
            We monitor production around the clock. Suspected security incidents trigger an
            on-call page within 5 minutes. We aim to acknowledge confirmed incidents to affected
            users within 24 hours, and to publish a post-incident report within 7 days of
            resolution. Where personal data is impacted, we notify the Personal Data Protection
            Commission within 72 hours, in line with the Tanzania PDPA.
          </p>
          <div className="mt-10 bg-paper border border-bordr rounded-lg p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-ink-3">Report a vulnerability</div>
              <div className="mt-1 font-sans text-2xl text-herb-900">security@wedding.co.tz</div>
              <p className="mt-2 text-sm text-ink-3">
                PGP key fingerprint and disclosure policy published on request.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="mailto:security@wedding.co.tz" className="btn btn-primary">
                Email security
              </a>
              <Link href="/privacy" className="btn btn-outline">
                Read the privacy policy
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
