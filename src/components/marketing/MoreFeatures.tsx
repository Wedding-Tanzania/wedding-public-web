import Image from 'next/image';

/**
 * "Already built" grid under the seven feature blocks: the smaller things the
 * platform does that couples ask about. Every tile maps to shipped code
 * (sheet sync and import in wedding-api contacts, wcz.ts card templates,
 * wish-chat, attire library, music, calendar links, thank-you messages,
 * rbac approval rules, i18n). The cards are real renders of /card-sample.
 */

const small = [
  {
    title: 'Import from Excel or CSV',
    body: 'Start from the list you already have. Download the template, fill it in, and preview every change before it is applied.',
  },
  {
    title: 'Music on the invitation',
    body: 'Add your own song, or a Spotify link that plays right on the invitation page.',
  },
  {
    title: 'Add to calendar',
    body: 'Guests who say yes save the day to Google Calendar, their iPhone or Outlook in one tap.',
  },
  {
    title: 'Thank-you messages',
    body: 'After the day, every guest gets a WhatsApp thank-you with your photo and a link to the gallery.',
  },
  {
    title: 'Two-person approvals',
    body: 'Budget changes, vendor bookings and the payout account need a second kamati member to approve.',
  },
  {
    title: 'Kiswahili and English',
    body: 'The app speaks both, and invitations go out in the language you choose.',
  },
  {
    title: 'More than one wedding',
    body: 'Planners and busy families can run several weddings from one account and switch between them.',
  },
  {
    title: 'Call sheet for the day',
    body: 'Export the guest list with seats and card numbers to Excel or PDF for the ushers.',
  },
];

const cards = [
  { src: '/marketing/cards/t02.webp', alt: 'Invitation card design with gold lettering on forest green' },
  { src: '/marketing/cards/t13.webp', alt: 'Invitation card design with a monogram on champagne' },
  { src: '/marketing/cards/t06.webp', alt: 'Invitation card design with large initials on linen' },
  { src: '/marketing/cards/t15.webp', alt: 'Invitation card design as a ticket on sage green' },
];

const tile = 'flex flex-col gap-3 bg-paper p-7 ring-1 ring-inset ring-bordr';
const tileTitle = 'font-sans text-lg font-bold leading-snug text-ink-1';
const tileBody = 'font-sans text-[15px] leading-relaxed text-ink-2';

export function MoreFeatures() {
  return (
    <div id="more" className="scroll-mt-28">
      <div className="mb-12 max-w-2xl">
        <span className="eyebrow !font-mono !tracking-[0.1em]">Na zaidi · and more</span>
        <h2 className="mt-5 font-sans text-[clamp(1.9rem,4vw,2.75rem)] font-bold leading-[1.12] text-ink-1 text-balance">
          The details couples ask about, already built.
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col overflow-hidden bg-paper ring-1 ring-inset ring-bordr sm:col-span-2">
          <div className="relative aspect-[16/9]">
            <Image
              src="/marketing/feature-sheet.webp"
              alt="A kamati secretary going through the guest sheet on a laptop with a family member"
              fill
              sizes="(min-width: 1024px) 590px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-3 p-7">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-herb-600">
              Google Sheets
            </span>
            <span className="font-sans text-2xl font-bold leading-tight text-ink-1">
              Keep your Google Sheet. It stays in sync.
            </span>
            <p className={tileBody}>
              Link the guest sheet the kamati already uses. New and changed guests come in from the
              sheet, and the app writes back each card number, seats, RSVP and who has arrived.
              Nobody is ever removed, and money already recorded is never reduced.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 bg-herb-50 p-7 ring-1 ring-inset ring-bordr sm:col-span-2">
          <div className="grid grid-cols-4 gap-2.5">
            {cards.map((c) => (
              <Image
                key={c.src}
                src={c.src}
                alt={c.alt}
                width={540}
                height={675}
                sizes="(min-width: 1024px) 135px, 22vw"
                className="h-auto w-full shadow-[0_10px_24px_rgba(26,37,22,0.18)]"
              />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-herb-600">
              Kadi · invitation cards
            </span>
            <span className="font-sans text-2xl font-bold leading-tight text-ink-1">
              23 card designs, each with its own QR
            </span>
            <p className={tileBody}>
              Single or double cards, in Kiswahili or English, with your photos and colours. Every
              guest gets their own card and number, sent as an image on WhatsApp.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 bg-herb-800 p-7 sm:col-span-2">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-herb-300">
            Ukuta wa salamu · wish wall
          </span>
          <span className="font-sans text-2xl font-bold leading-tight text-linen">
            Wishes by WhatsApp, straight onto the wall
          </span>
          <p className="font-sans text-[15px] leading-relaxed text-herb-200">
            Guests reply to your WhatsApp message with a few words and a selfie, or scan the QR on
            the table. Their wish and photo appear on the live wall at the reception within
            seconds, and stay on your wedding page afterwards.
          </p>
          <span className="mt-auto pt-4 font-mono text-[12px] tracking-[0.04em] text-herb-300">
            wedding.co.tz/your-names/wall
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto] items-stretch gap-0 overflow-hidden bg-paper ring-1 ring-inset ring-bordr sm:col-span-2">
          <div className="flex flex-col gap-3 p-7">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-herb-600">
              Mavazi · dress code
            </span>
            <span className="font-sans text-2xl font-bold leading-tight text-ink-1">
              Show guests what to wear
            </span>
            <p className={tileBody}>
              Pick the celebration colours and each guest sees how women and men wear them, or your
              own outfit photos.
            </p>
          </div>
          <div className="flex">
            <Image
              src="/attire/sage-green-women.webp"
              alt="Sage green dress-code example for women"
              width={600}
              height={800}
              sizes="120px"
              className="h-full w-[110px] object-cover sm:w-[130px]"
            />
            <Image
              src="/attire/sage-green-men-suit.webp"
              alt="Sage green dress-code example for men"
              width={600}
              height={800}
              sizes="120px"
              className="h-full w-[110px] object-cover sm:w-[130px]"
            />
          </div>
        </div>

        {small.map((s) => (
          <div key={s.title} className={tile}>
            <span className={tileTitle}>{s.title}</span>
            <p className={tileBody}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
