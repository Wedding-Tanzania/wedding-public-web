import type { Metadata } from 'next';
import { InvitePage } from '@/components/invite/InvitePage';
import { LegacyRsvpPage, type LegacyRsvpContext } from '@/components/story/LegacyRsvpPage';
import { normalise } from '@/lib/invite/wcz';
import type { CalendarLinks, DesignFields, InviteGuestView, PublicStoryExtras } from '@/lib/invite/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';

type RsvpContext = LegacyRsvpContext &
  DesignFields & {
    guest?: InviteGuestView;
    extras?: PublicStoryExtras | null;
    storySlug?: string | null;
  };

async function load(token: string): Promise<RsvpContext | null> {
  // Never cached: the reply state changes the moment a guest answers.
  const res = await fetch(`${API_BASE}/rsvp/${encodeURIComponent(token)}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return (await res.json()) as RsvpContext;
}

async function guestbookFor(slug: string): Promise<{ id: string; name: string; message: string; createdAt?: string }[]> {
  try {
    const res = await fetch(`${API_BASE}/story/${encodeURIComponent(slug)}/guestbook`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return ((await res.json()) as { items: { id: string; name: string; message: string; createdAt?: string }[] }).items;
  } catch {
    return [];
  }
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
          <h1 className="font-sans text-2xl font-bold text-ink-1">Mwaliko haukupatikana · Invitation not found</h1>
          <p className="mt-3 text-sm text-ink-2">
            Kiungo hiki si sahihi au muda wake umeisha. This link is invalid or has expired. Please check the link in your invitation, or contact the couple.
          </p>
        </div>
      </main>
    );
  }

  // Weddings that never saved a design keep the page and card they have today.
  if (ctx.designSaved !== true || ctx.design == null || ctx.guest === undefined) {
    return <LegacyRsvpPage ctx={ctx} params={params} />;
  }

  const slug = ctx.storySlug ?? null;
  const guestbook = slug !== null ? await guestbookFor(slug) : [];
  const calendar: CalendarLinks | null = ctx.calendar ?? null;
  return (
    <InvitePage
      design={normalise(ctx.design)}
      token={params.token}
      guest={ctx.guest}
      status={ctx.status}
      reply={ctx.reply ?? null}
      rsvpOpen={ctx.rsvpOpen}
      calendar={calendar}
      rsvpUrl={ctx.card?.rsvpUrl ?? null}
      accounts={ctx.accounts ?? []}
      extras={ctx.extras ?? null}
      slug={slug}
      guestbook={guestbook}
      cardPngUrl={`/rsvp/${params.token}/card.png`}
    />
  );
}
