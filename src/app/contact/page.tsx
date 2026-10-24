import { Section, SectionHead } from '@/components/Section';
import { Suspense } from 'react';
import { SUPPORT_EMAIL, SUPPORT_PHONE } from '@/lib/support';
import { ContactForm } from './ContactForm';

export const metadata = {
  title: 'Contact',
  description: 'Contact and support for Wedding by Lockwood: email and phone.',
};

export default function ContactPage() {
  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="eyebrow justify-center">Support</div>
          <h1 className="mt-4 font-sans font-light text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-tight text-herb-900">
            Contact <em className="not-italic font-extrabold text-herb-600">us.</em>
          </h1>
          <p className="mt-6 font-sans text-xl text-ink-2 leading-relaxed">
            Couples, guests, vendors and partners: email or call us and a person will answer. We
            reply within one business day.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 font-sans text-xl">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-herb-700 hover:underline">
              {SUPPORT_EMAIL}
            </a>
            <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`} className="text-ink-1 hover:underline">
              {SUPPORT_PHONE}
            </a>
          </div>
        </div>
      </Section>

      <Section tone="paper" className="!pt-12">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16 items-start">
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
          <div className="space-y-12">
            <ChannelBlock
              title="Support"
              email={SUPPORT_EMAIL}
              phone={SUPPORT_PHONE}
              note="Questions about your wedding, story page, contributions, guests, RSVPs, vendor sign-up, press or partnerships. To delete your account, see wedding.co.tz/delete-account."
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
                Monday to Friday, 09:00 to 18:00 EAT
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
              'Yes. The Wedding by Lockwood app for iPhone and Android is coming to the App Store and Google Play. The web app at app.wedding.co.tz works on any phone in the meantime.',
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
