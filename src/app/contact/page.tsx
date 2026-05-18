import { Section, SectionHead } from '@/components/Section';
import { ContactForm } from './ContactForm';

export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="eyebrow justify-center">Contact</div>
          <h1 className="mt-4 font-sans font-light text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-tight text-herb-900">
            Tell us about
            <br />
            <em className="not-italic font-extrabold text-herb-600">your day.</em>
          </h1>
          <p className="mt-6 font-sans text-xl text-ink-2 leading-relaxed">
            Couples, vendors, journalists, partners. Whatever you need, we read every message.
          </p>
        </div>
      </Section>

      <Section tone="paper" className="!pt-12">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16 items-start">
          <ContactForm />
          <div className="space-y-12">
            <ChannelBlock
              title="Couples"
              email="hello@wedding.co.tz"
              phone="+255 754 000 001"
              note="Reach the planning team for questions about story pages, contributions, RSVPs, or anything on the journey."
            />
            <ChannelBlock
              title="Vendors"
              email="vendors@wedding.co.tz"
              phone="+255 754 000 002"
              note="Sign up, get verified, ask about promotions, or escalate a booking issue."
            />
            <ChannelBlock
              title="Press & partnerships"
              email="press@wedding.co.tz"
              phone="+255 754 000 003"
              note="Media, MNO partnerships, brand collaborations, and co-marketing requests."
            />
            <div className="bg-herb-50 border border-champagne rounded-lg p-8">
              <div className="eyebrow">Visit us</div>
              <div className="font-sans text-2xl mt-4 text-herb-900">
                Lockwood Technology HQ
              </div>
              <div className="text-ink-2 mt-2 leading-relaxed">
                Plot 401, Bagamoyo Road
                <br />
                Mikocheni, Dar es Salaam
                <br />
                Tanzania
              </div>
              <div className="mt-4 text-[11px] uppercase tracking-widest text-ink-3">
                Mon–Fri · 09:00–18:00 EAT
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="cream">
        <SectionHead
          eyebrow="FAQ"
          title={<>Common <em className="not-italic font-extrabold text-herb-600">questions.</em></>}
        />
        <div className="max-w-3xl mx-auto divide-y divide-bordr">
          {[
            [
              'Does Wedding by Lockwood hold our money?',
              'No. Contributions flow directly into your own Changisha, Mchango, Lipa Namba, or bank account. We facilitate, never custody.',
            ],
            [
              'What does it cost?',
              'Couples pay Malipopay\'s 1% per collection, plus a 1-1.5% platform fee deducted before settlement. Total: roughly 2-2.5% of total contributions received.',
            ],
            [
              'How long does vendor verification take?',
              'Most vendor profiles are reviewed within 48 hours. We may ask for proof of identity, business registration, or a sample portfolio.',
            ],
            [
              'Can guests outside Tanzania contribute?',
              'Yes. International guests can pay by Visa or Mastercard at the standard 3% card rate. We also support diaspora-friendly currency display.',
            ],
            [
              'Is there a mobile app?',
              'Coming in Phase 2 (Android, then iOS). For now, the web app is fully mobile-responsive and works offline-first for the planning checklist.',
            ],
          ].map(([q, a]) => (
            <details key={q} className="py-6 group">
              <summary className="cursor-pointer flex items-center justify-between font-sans text-xl text-herb-900 list-none">
                <span>{q}</span>
                <span className="text-herb-600 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-ink-2 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </Section>
    </main>
  );
}

function ChannelBlock({
  title,
  email,
  phone,
  note,
}: {
  title: string;
  email: string;
  phone: string;
  note: string;
}) {
  return (
    <div>
      <div className="eyebrow">{title}</div>
      <div className="mt-4 space-y-1">
        <a href={`mailto:${email}`} className="font-sans text-xl text-herb-700 hover:underline">
          {email}
        </a>
        <div className="font-sans text-lg text-ink-1">{phone}</div>
      </div>
      <p className="mt-3 text-sm text-ink-2 leading-relaxed">{note}</p>
    </div>
  );
}
