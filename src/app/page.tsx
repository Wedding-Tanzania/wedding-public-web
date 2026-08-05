import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { IconCalendarHeart, IconGift, IconGlasses } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Panga harusi pamoja',
  description:
    'One shared workspace for the couple and kamati ya harusi: budget, pledges, M-Pesa Changisha collections, guests and trusted vendors. Money goes straight to your own account, never ours.',
};

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FeatureCards />
      <Invitations />
      <PaymentRails />
      <TreasurerShowcase />
      <VendorCta />
    </main>
  );
}

function Hero() {
  return (
    <section className="bg-herb-800 px-6 lg:px-12 py-20 lg:py-24">
      <div className="max-w-wrap mx-auto">
        <div className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-herb-100">
          Tanzania&apos;s wedding &amp; michango platform
        </div>
        <h1 className="mt-6 max-w-3xl font-sans font-bold text-[clamp(2rem,5vw,3rem)] leading-[1.15] text-paper text-balance">
          Panga harusi pamoja.
          <br />
          Kusanya michango kwa amani.
        </h1>
        <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-herb-100">
          One shared workspace for the couple and kamati ya harusi: budget, pledges, M-Pesa
          Changisha collections, guests and trusted vendors. Money goes straight to your own
          account, never ours.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Link href="/contact" className="btn btn-primary">
            Create your wedding · free
          </Link>
          <Link
            href="/vendors/join"
            className="btn text-herb-100 ring-1 ring-inset ring-herb-200/40 hover:ring-herb-200/70"
          >
            I run a wedding business
          </Link>
        </div>
        <div className="mt-14 flex flex-wrap gap-x-12 gap-y-6">
          <HeroStat value="TSh 4.2bn" label="Collected YTD" />
          <HeroStat value="1,284" label="Active weddings" />
          <HeroStat value="~1%" label="Payment cost" />
        </div>
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-sans font-bold text-[22px] text-paper num-tabular">{value}</span>
      <span className="font-mono text-[9px] font-medium uppercase tracking-[0.06em] text-ink-4">
        {label}
      </span>
    </div>
  );
}

const features = [
  {
    icon: IconCalendarHeart,
    title: 'Kamati in one workspace',
    body: 'Chairperson, katibu, mweka hazina and members plan together with roles and approvals, not WhatsApp chaos.',
  },
  {
    icon: IconGift,
    title: 'Michango bila wasiwasi',
    body: 'Pledges tracked, M-Pesa Changisha + Mixx Mchango + bank collections auto-matched. Cash recorded too. Every shilling accounted.',
  },
  {
    icon: IconGlasses,
    title: 'Vendors you can trust',
    body: 'Verified businesses with real reviews, quotes, and resource-aware booking so your date is actually secured.',
  },
];

function FeatureCards() {
  return (
    <Section tone="ivory" className="!py-20">
      <div className="grid gap-6 md:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-lg bg-paper ring-1 ring-inset ring-bordr p-7 flex flex-col items-start gap-3"
          >
            <span className="grid place-items-center w-11 h-11 rounded-md bg-herb-100 text-herb-600">
              <f.icon size={24} />
            </span>
            <span className="font-sans font-bold text-xl leading-tight text-ink-1">{f.title}</span>
            <span className="font-sans text-sm leading-relaxed text-ink-2">{f.body}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

const inviteBullets = [
  { head: 'Digital cards', body: 'Six templates · Swahili + English · print-ready PDF' },
  { head: 'QR gate check-in', body: 'Every card has a unique №, scan or type to verify' },
  { head: 'RSVP tracking', body: 'Confirmations, declines with reasons, reminders' },
  { head: 'Changia gifts', body: 'M-Pesa, Mixx, Airtel, banks, straight to the couple' },
  { head: 'Story page', body: 'Countdown, ratiba, dress code, gallery, directions' },
];

function Invitations() {
  return (
    <Section tone="cream">
      <div className="grid gap-14 lg:grid-cols-2 items-center">
        <div className="flex flex-col items-start gap-5 max-w-lg">
          <div className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-herb-600">
            Mialiko ya kidijitali · digital invitations
          </div>
          <h2 className="font-sans font-bold text-[clamp(1.7rem,3.5vw,2.125rem)] leading-[1.25] text-ink-1">
            Kadi, ukurasa wa harusi,
            <br className="hidden sm:block" /> na QR getini: vyote pamoja.
          </h2>
          <p className="font-sans text-[15px] leading-relaxed text-ink-2">
            Design a card, send it by WhatsApp, SMS or print, and check guests in at the gate with
            one scan.
          </p>
          <div className="flex flex-col gap-3">
            {inviteBullets.map((b) => (
              <div key={b.head} className="flex gap-3 items-baseline">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-herb-600 flex-shrink-0 self-start" />
                <span>
                  <span className="font-sans font-semibold text-sm text-ink-1">{b.head}</span>{' '}
                  <span className="font-sans font-medium text-xs text-ink-3">{b.body}</span>
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/contact"
            className="mt-2 inline-flex items-center bg-herb-600 px-7 py-3.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-paper hover:bg-herb-700 transition-colors"
          >
            Tengeneza kadi yako · start free
          </Link>
        </div>
        <div className="flex flex-col gap-4 items-center justify-self-center lg:justify-self-end">
          <InviteCardMock />
          <div className="flex flex-wrap justify-center gap-2.5">
            <MiniTemplateCard variant="forest" />
            <MiniTemplateCard variant="linen" />
            <MiniTemplateCard variant="paper" />
          </div>
          <span className="font-mono text-[8px] font-medium uppercase tracking-[0.1em] text-ink-3">
            Templates sita · chagua mtindo wako
          </span>
        </div>
      </div>
    </Section>
  );
}

function InviteCardMock() {
  return (
    <div className="w-[198px] h-[347px] bg-herb-900 flex flex-col gap-[8.7px] px-[17px] pt-[21px] pb-[18.6px] justify-center items-center shadow-[0_24px_60px_rgba(26,37,22,0.35)]">
      <span className="relative block w-[30px] h-[30px] rounded-full shadow-[inset_0_0_0_0.62px_#D9C7A8]">
        <span className="absolute inset-0 flex items-center justify-center font-mono font-medium text-[6.8px] text-[#D9C7A8]">
          A·J
        </span>
      </span>
      <span className="font-mono font-medium text-[5px] tracking-[0.16em] text-herb-200">
        PAMOJA NA FAMILIA ZETU
      </span>
      <span className="flex flex-col gap-[1.2px] items-center">
        <span className="font-sans font-medium text-[27px] leading-[1.1] text-paper">Amina</span>
        <span className="font-sans font-medium text-sm leading-none text-[#D9C7A8]">&amp;</span>
        <span className="font-sans font-medium text-[27px] leading-[1.1] text-paper">Juma</span>
      </span>
      <span className="font-mono font-medium text-[4.7px] tracking-[0.1em] text-herb-200 text-center">
        TUNAYO FURAHA KUWAALIKA KWENYE HARUSI
      </span>
      <span className="font-mono font-medium text-[4.7px] tracking-[0.1em] text-[#D9C7A8]">
        JUMAMOSI · 12 DESEMBA 2026 · 09:00
      </span>
      <span className="font-mono font-medium text-[4.7px] tracking-[0.1em] text-herb-200">
        St Joseph Cathedral · Dar es Salaam
      </span>
      <span className="w-[25px] h-px bg-[#D9C7A8]/60" />
      <Image
        src="/img/qr.png"
        alt="Invitation QR check-in code"
        width={47}
        height={47}
        className="rounded-[2.6px]"
      />
      <span className="font-mono font-medium text-[4.3px] tracking-[0.14em] text-herb-200">
        SCAN AT THE GATE
      </span>
      <span className="font-mono font-medium text-[5.6px] tracking-[0.08em] text-[#D9C7A8]">
        CARD № 0142-118
      </span>
    </div>
  );
}

const miniCardStyles = {
  forest: {
    wrap: 'bg-herb-800 shadow-[inset_0_0_0_1.26px_#4F6A42]',
    name: 'text-paper',
    date: 'text-herb-200',
    rule: 'bg-[#D9C7A8]/70',
  },
  linen: {
    wrap: 'bg-linen shadow-[inset_0_0_0_1.26px_#D9C7A8]',
    name: 'text-ink-1',
    date: 'text-[#8C733D]',
    rule: 'bg-[#8C733D]/50',
  },
  paper: {
    wrap: 'bg-paper shadow-[inset_0_0_0_1.26px_#E0DCC8]',
    name: 'text-ink-1',
    date: 'text-ink-3',
    rule: 'bg-bordr',
  },
} as const;

function MiniTemplateCard({ variant }: { variant: keyof typeof miniCardStyles }) {
  const s = miniCardStyles[variant];
  return (
    <span
      className={`w-[108px] h-[59px] rounded-[5px] flex flex-col gap-[3px] items-center justify-center ${s.wrap}`}
    >
      <span className={`font-sans font-semibold text-[8px] ${s.name}`}>Amina &amp; Juma</span>
      <span className={`font-mono font-medium text-[3.5px] tracking-[0.08em] ${s.date}`}>
        JUMAMOSI · 12 DESEMBA 2026
      </span>
      <span className={`w-[11px] h-[0.5px] ${s.rule}`} />
      <Image src="/img/qr.png" alt="" width={13} height={13} className="rounded-[0.7px]" />
    </span>
  );
}

const rails = [
  { label: 'MPESA', dot: 'bg-rails-mpesa' },
  { label: 'TIGO', dot: 'bg-rails-tigo' },
  { label: 'AIRTEL', dot: 'bg-rails-airtel' },
  { label: 'HALOPESA', dot: 'bg-rails-halo' },
  { label: 'CRDB', dot: 'bg-rails-crdb' },
  { label: 'NMB', dot: 'bg-rails-nmb' },
];

function PaymentRails() {
  return (
    <section className="bg-paper px-6 lg:px-12 py-9">
      <div className="max-w-wrap mx-auto flex flex-wrap items-center gap-x-3.5 gap-y-3">
        <span className="font-mono text-[9px] font-medium uppercase tracking-[0.06em] text-ink-3">
          Collect with
        </span>
        {rails.map((r) => (
          <span key={r.label} className="rail-chip">
            <span className={`dot ${r.dot}`} />
            {r.label}
          </span>
        ))}
        <span className="flex-grow" />
        <span className="font-mono text-[9px] font-medium uppercase tracking-[0.04em] text-herb-600">
          Powered by Malipopay · direct to your account
        </span>
      </div>
    </section>
  );
}

function TreasurerShowcase() {
  return (
    <Section tone="cream">
      <div className="grid gap-14 lg:grid-cols-2 items-center">
        <div className="flex flex-col gap-6 max-w-md">
          <h2 className="font-sans font-bold text-[clamp(1.9rem,4vw,2.5rem)] leading-[1.15] text-ink-1 text-balance">
            Mweka hazina anaona kila kitu.
          </h2>
          <p className="font-sans text-base leading-relaxed text-ink-2">
            Live dashboard: planned budget, pledges, money received, outstanding and spent. Smart
            alerts tell you the guest count your cash can actually support.
          </p>
        </div>
        <DashboardMock />
      </div>
    </Section>
  );
}

const dashTiles = [
  { value: 'TSh 18.2M', label: 'Pledged' },
  { value: 'TSh 11.4M', label: 'Received' },
  { value: 'TSh 6.8M', label: 'Outstanding' },
  { value: 'TSh 7.9M', label: 'Spent' },
];

const dashRows = [
  { main: 'TSh 250,000 · M-Pesa · matched to pledge', sub: 'Joseph Kileo · just now' },
  { main: 'TSh 100,000 · cash · recorded by hazina', sub: 'Mary Lyimo · today' },
  { main: 'Pledge TSh 500,000 · due 30 Sep', sub: 'Karim Gulam · 1 hr ago' },
];

function DashboardMock() {
  return (
    <div className="w-full max-w-xl rounded-lg bg-paper ring-1 ring-inset ring-bordr shadow-[0_20px_50px_rgba(42,58,36,0.12)] p-6 flex flex-col gap-3">
      <span className="font-mono text-[9px] font-medium uppercase tracking-[0.05em] text-ink-3">
        Finance &amp; contributions · Amina &amp; Juma
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {dashTiles.map((t) => (
          <span key={t.label} className="rounded-md bg-herb-50 p-3 flex flex-col gap-0.5">
            <span className="font-sans font-bold text-base text-ink-1 num-tabular">{t.value}</span>
            <span className="font-mono text-[7px] font-medium uppercase tracking-[0.04em] text-ink-3">
              {t.label}
            </span>
          </span>
        ))}
      </div>
      {dashRows.map((r) => (
        <span
          key={r.main}
          className="rounded-md bg-paper ring-1 ring-inset ring-bordr px-3 py-2.5 flex flex-col gap-0.5"
        >
          <span className="font-sans font-semibold text-[13px] text-ink-1">{r.main}</span>
          <span className="font-mono text-[7.5px] font-medium uppercase tracking-[0.02em] text-ink-3">
            {r.sub}
          </span>
        </span>
      ))}
    </div>
  );
}

function VendorCta() {
  return (
    <section className="bg-herb-800 px-6 lg:px-12 py-20 lg:py-24">
      <div className="max-w-wrap mx-auto flex flex-col items-start gap-9">
        <h2 className="max-w-2xl font-sans font-bold text-[clamp(1.7rem,3.5vw,2.125rem)] leading-[1.2] text-paper text-balance">
          Una biashara ya harusi? Jiunge na wauzaji 2,400+.
        </h2>
        <Link href="/vendors/join" className="btn btn-primary">
          List your business
        </Link>
      </div>
    </section>
  );
}
