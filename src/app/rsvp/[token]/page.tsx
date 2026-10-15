import type { Metadata } from 'next';
import { InvitationCard } from '@/components/card/InvitationCard';
import { cardDesignFor, type InvitationCardView } from '@/lib/card';
import { qrSvg } from '@/lib/qr';
import { RsvpForm, type SavedReply, type Status } from './RsvpForm';
import { SaveCardButton } from './SaveCardButton';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';

interface RsvpContext {
  weddingName: string;
  guestName: string;
  status: Status;
  rsvpOpen: boolean;
  /** Present once the guest has answered, on the page or by WhatsApp. */
  reply?: SavedReply;
  card?: InvitationCardView;
}

async function load(token: string): Promise<RsvpContext | null> {
  // Never cached: the reply state changes the moment a guest answers.
  const res = await fetch(`${API_BASE}/rsvp/${encodeURIComponent(token)}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return (await res.json()) as RsvpContext;
}

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  const ctx = await load(params.token);
  const card = ctx?.card;
  const title = card !== undefined ? `${card.partnerA} & ${card.partnerB} · Your invitation` : 'Your invitation';
  return {
    title,
    description: card !== undefined ? `${card.partnerA} and ${card.partnerB} have invited ${card.guestName}.` : undefined,
    // A personal invitation: names, a date and a gate pass. Never indexed.
    robots: { index: false, follow: false },
    openGraph:
      card !== undefined
        ? { title, images: [{ url: `/rsvp/${params.token}/card.png`, width: 1080, height: 1350 }] }
        : undefined,
  };
}

export default async function RsvpPage({ params }: { params: { token: string } }) {
  const ctx = await load(params.token);

  if (ctx === null) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-linen px-6 py-16">
        <div className="w-full max-w-md rounded-lg border border-bordr bg-paper p-10 text-center shadow-soft">
          <h1 className="font-sans text-2xl font-bold text-ink-1">Invitation not found</h1>
          <p className="mt-3 text-sm text-ink-2">
            This link is invalid or has expired. Please check the link in your invitation, or contact the couple.
          </p>
        </div>
      </main>
    );
  }

  const card = ctx.card;
  const svg = card !== undefined ? await qrSvg(card.rsvpUrl, cardDesignFor(card.templateKey).palette.ink) : null;

  return (
    <main className="bg-linen px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-[400px] space-y-6">
        {card !== undefined && svg !== null ? (
          <>
            <InvitationCard card={card} qrSvg={svg} />
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
          />
        </section>

        <p className="text-center text-[10px] uppercase tracking-widest text-ink-3">A wedding by Lockwood</p>
      </div>
    </main>
  );
}
