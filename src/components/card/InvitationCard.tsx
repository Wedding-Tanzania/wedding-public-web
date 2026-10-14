import { Cormorant_Garamond } from 'next/font/google';
import type { CSSProperties, ReactNode } from 'react';
import { cardDate, cardDesignFor, partyLine, type InvitationCardView } from '@/lib/card';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

/**
 * The card a guest receives, on their RSVP page. Rendered on the server: the
 * QR is an SVG made from the guest's own RSVP link, so scanning it with any
 * phone camera opens their card, and the gate scanner reads the token out of
 * the same link.
 */
export function InvitationCard({ card, qrSvg }: { card: InvitationCardView; qrSvg: string }) {
  const design = cardDesignFor(card.templateKey);
  const { paper, ink, accent, soft } = design.palette;
  const display = design.display === 'serif' ? serif.className : 'font-sans';
  const date = cardDate(card.weddingDate);
  const party = partyLine(card.partyAllowed);
  const vars = { '--paper': paper, '--ink': ink, '--accent': accent, '--soft': soft } as CSSProperties;

  const names = (
    <h1 className={`${display} leading-[1.05]`} style={{ color: ink }}>
      <span className="block text-[44px] font-semibold">{card.partnerA}</span>
      <span className="block text-[26px] italic" style={{ color: accent }}>
        &amp;
      </span>
      <span className="block text-[44px] font-semibold">{card.partnerB}</span>
    </h1>
  );

  const when = (
    <div className="space-y-0.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>
        {date.weekday}
      </p>
      <p className={`${display} text-[22px] font-semibold`} style={{ color: ink }}>
        {date.day} {date.month} {date.year}
      </p>
    </div>
  );

  const where =
    card.venueName !== undefined ? (
      <div className="space-y-0.5">
        <p className="text-[14px] font-semibold" style={{ color: ink }}>
          {card.venueName}
        </p>
        {card.venueAddress !== undefined && (
          <p className="text-[12px]" style={{ color: ink, opacity: 0.7 }}>
            {card.venueAddress}
          </p>
        )}
      </div>
    ) : null;

  const pass = (
    <div
      className="flex items-center gap-4 rounded-lg border p-3 text-left"
      style={{ borderColor: soft, background: '#FFFFFF' }}
    >
      <div
        className="h-[88px] w-[88px] shrink-0 [&>svg]:h-full [&>svg]:w-full"
        aria-label="QR code for this invitation"
        role="img"
        // Our own SVG, generated from the guest's RSVP link on this server.
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />
      <div className="min-w-0 space-y-1">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: accent }}>
          Invitation for
        </p>
        <p className="line-clamp-2 break-words text-[15px] font-semibold leading-snug" style={{ color: ink }}>
          {card.guestName}
        </p>
        <p className="font-mono text-[11px]" style={{ color: ink, opacity: 0.75 }}>
          Card {card.cardNumber}
          {party !== null ? ` · ${party}` : ''}
        </p>
        <p className="text-[10px]" style={{ color: ink, opacity: 0.6 }}>
          Show this at the gate
        </p>
      </div>
    </div>
  );

  const photo = (cls: string, style?: CSSProperties) =>
    card.photoUrl !== undefined ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={card.photoUrl} alt={`${card.partnerA} and ${card.partnerB}`} className={cls} style={style} />
    ) : null;

  let body: ReactNode;
  if (design.layout === 'coast') {
    body = (
      <>
        <div className="relative -mx-7 -mt-7 mb-5 h-[210px] overflow-hidden" style={{ background: soft }}>
          {photo('h-full w-full object-cover')}
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden>
            <path d="M0 14 Q 50 0 100 12 T 200 12 T 300 12 T 400 10 V24 H0 Z" fill={paper} />
          </svg>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: accent }}>
          Karibu kwenye harusi yetu
        </p>
        <div className="my-3">{names}</div>
        <div className="mx-auto mb-4 h-px w-16" style={{ background: accent }} />
        <div className="space-y-3">
          {when}
          {where}
        </div>
        <div className="mt-5">{pass}</div>
      </>
    );
  } else if (design.layout === 'bold') {
    body = (
      <div className="rounded-md border-[6px] p-5" style={{ borderColor: accent }}>
        <div
          className="mx-auto mb-4 grid h-[72px] w-[72px] place-items-center overflow-hidden rounded-full border-2"
          style={{ borderColor: accent, background: soft }}
        >
          {photo('h-full w-full object-cover') ?? (
            <span className={`${display} text-[24px] font-bold`} style={{ color: accent }}>
              {card.partnerA.charAt(0)}
              {card.partnerB.charAt(0)}
            </span>
          )}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: accent }}>
          You are invited
        </p>
        <div className="my-3 uppercase tracking-[0.04em]">{names}</div>
        <div className="space-y-3 border-y py-3" style={{ borderColor: soft }}>
          {when}
          {where}
        </div>
        <div className="mt-4">{pass}</div>
      </div>
    );
  } else {
    body = (
      <>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: accent }}>
          Together with their families
        </p>
        {card.photoUrl !== undefined && (
          <div className="mx-auto mt-5 h-[150px] w-[150px] overflow-hidden rounded-full border-[3px]" style={{ borderColor: soft }}>
            {photo('h-full w-full object-cover')}
          </div>
        )}
        <div className="my-4">{names}</div>
        <p className={`${display} text-[17px] italic`} style={{ color: ink, opacity: 0.8 }}>
          request the pleasure of your company
        </p>
        <div className="mx-auto my-4 flex items-center justify-center gap-2" aria-hidden>
          <span className="h-px w-10" style={{ background: accent }} />
          <span className="h-1.5 w-1.5 rotate-45" style={{ background: accent }} />
          <span className="h-px w-10" style={{ background: accent }} />
        </div>
        <div className="space-y-3">
          {when}
          {where}
        </div>
        <div className="mt-5">{pass}</div>
      </>
    );
  }

  return (
    <article
      className="mx-auto w-full max-w-[400px] overflow-hidden rounded-lg p-7 text-center shadow-soft"
      style={{ ...vars, background: paper }}
      aria-label={`Invitation to the wedding of ${card.partnerA} and ${card.partnerB}`}
    >
      {body}
    </article>
  );
}
