import { InvitationCard } from '@/components/card/InvitationCard';
import { cardDesignFor, type InvitationCardView } from '@/lib/card';
import type { CardKind } from '@/lib/invite/wcz';
import { qrSvg } from '@/lib/qr';
import { RsvpForm, type SavedReply, type Status } from '@/app/rsvp/[token]/RsvpForm';
import { SaveCardButton } from '@/app/rsvp/[token]/SaveCardButton';

/*
 * The personal invitation every wedding had before the invitation designer.
 * A wedding that has not saved a design keeps getting exactly this page.
 */

export interface LegacyRsvpContext {
  weddingName: string;
  guestName: string;
  status: Status;
  rsvpOpen: boolean;
  /** Present once the guest has answered, on the page or by WhatsApp. */
  reply?: SavedReply;
  card?: InvitationCardView;
  /** The guest's own record; only the SINGLE / DOUBLE kind is read here. */
  guest?: { kind?: CardKind };
  calendar?: { googleUrl: string; icsUrl: string; startsAt?: string; allDay?: boolean };
}

export async function LegacyRsvpPage({ ctx, params }: { ctx: LegacyRsvpContext; params: { token: string } }) {
  const card = ctx.card;
  const svg = card !== undefined ? await qrSvg(card.rsvpUrl, cardDesignFor(card.templateKey).palette.ink) : null;

  return (
    <main className="bg-linen px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-[400px] space-y-6">
        {card !== undefined && svg !== null ? (
          <>
            <InvitationCard card={card} qrSvg={svg} kind={ctx.guest?.kind} />
            <div className="flex justify-center">
              <SaveCardButton
                href={`/rsvp/${params.token}/card.png`}
                fileName={`invitation-${card.cardNumber}.png`}
              />
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="eyebrow justify-center">{ctx.weddingName}</div>
            <h1 className="mt-4 font-sans text-3xl font-light text-herb-900">Hello, {ctx.guestName}</h1>
          </div>
        )}

        <section className="rounded-lg border border-bordr bg-paper p-6 shadow-soft">
          <RsvpForm
            token={params.token}
            status={ctx.status}
            rsvpOpen={ctx.rsvpOpen}
            guestName={ctx.guestName}
            firstName={ctx.guestName.split(/\s+/)[0] ?? ctx.guestName}
            coupleNames={card !== undefined ? `${card.partnerA} & ${card.partnerB}` : ctx.weddingName}
            partyAllowed={card?.partyAllowed}
            reply={ctx.reply}
            calendar={ctx.calendar}
          />
        </section>

        <p className="text-center text-[10px] uppercase tracking-widest text-ink-3">A wedding by Lockwood</p>
      </div>
    </main>
  );
}
