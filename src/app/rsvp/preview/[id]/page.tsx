import type { Metadata } from 'next';
import { InvitationCard } from '@/components/card/InvitationCard';
import { cardDesignFor, type InvitationCardView } from '@/lib/card';
import { qrSvg } from '@/lib/qr';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';

export const metadata: Metadata = {
  title: 'Card preview',
  robots: { index: false, follow: false },
};

/** The couple's half-hour preview: their card, with a placeholder guest. */
export default async function CardPreviewPage({ params }: { params: { id: string } }) {
  const res = await fetch(`${API_BASE}/card-preview/${encodeURIComponent(params.id)}`, { cache: 'no-store' });
  const card = res.ok ? ((await res.json()) as { card: InvitationCardView }).card : null;

  if (card === null) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-linen px-6 py-16">
        <div className="w-full max-w-md rounded-lg border border-bordr bg-paper p-10 text-center shadow-soft">
          <h1 className="font-sans text-2xl font-bold text-ink-1">This preview has expired</h1>
          <p className="mt-3 text-sm text-ink-2">Previews last half an hour. Open a new one from your card page.</p>
        </div>
      </main>
    );
  }

  const svg = await qrSvg(card.rsvpUrl, cardDesignFor(card.templateKey).palette.ink);
  return (
    <main className="bg-linen px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-[400px] space-y-5">
        <p className="rounded-md border border-bordr bg-paper px-4 py-3 text-center text-sm text-ink-2">
          This is a preview. Each guest&apos;s card shows their own name, card number and QR.
        </p>
        <InvitationCard card={card} qrSvg={svg} />
        <div className="flex justify-center">
          <a
            href={`/rsvp/preview/${params.id}/card.png`}
            download="invitation-preview.png"
            className="border border-bordr bg-paper px-5 py-3 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-ink-1 hover:bg-herb-50"
          >
            Download as image
          </a>
        </div>
      </div>
    </main>
  );
}
