import { notFound } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { storyTag } from '@/lib/story-tag';
import { normalise, type InviteDesign } from '@/lib/invite/wcz';
import type { DesignFields, PublicStoryExtras } from '@/lib/invite/types';
import { InvitePage } from '@/components/invite/InvitePage';
import { LegacyStoryPage, type GuestbookResponse, type StoryResponse } from '@/components/story/LegacyStoryPage';

/**
 * Static, regenerated at most once a minute. The API caches the story for a
 * minute too and drops it on every save, and a save also asks this site to
 * drop the page (/api/revalidate, story-refresh.ts), so the couple sees their
 * edit on the next load. Every guest in a WhatsApp group opening the link at
 * once is still served from the cache, not the API.
 */
export const revalidate = 60;

/**
 * No slugs at build time: each wedding's page is rendered on its first visit
 * and then served statically, regenerated in the background every minute.
 * Without this the route renders on every request.
 */
export function generateStaticParams(): { coupleSlug: string }[] {
  return [];
}

type PublicStory = StoryResponse & DesignFields & { extras?: PublicStoryExtras; coverPhotoUrl?: string | null };

export default async function CoupleStoryPage({ params }: { params: { coupleSlug: string } }) {
  let data: PublicStory;
  try {
    data = await apiGet<PublicStory>(`/story/${params.coupleSlug}`, undefined, [storyTag(params.coupleSlug)]);
  } catch {
    notFound();
  }
  let guestbook: GuestbookResponse = { items: [] };
  try {
    guestbook = await apiGet<GuestbookResponse>(`/story/${params.coupleSlug}/guestbook`, undefined, [storyTag(params.coupleSlug)]);
  } catch {
    // guestbook is best-effort
  }

  // Weddings that never saved a design keep the page they have today.
  if (data.designSaved !== true || data.design == null) {
    return <LegacyStoryPage data={data} guestbook={guestbook} />;
  }

  const design: InviteDesign = normalise(data.design);
  return (
    <InvitePage
      design={design}
      token={null}
      guest={null}
      status="invited"
      reply={null}
      rsvpOpen={data.story.rsvpOpen}
      calendar={null}
      rsvpUrl={null}
      accounts={data.accounts ?? []}
      extras={data.extras ?? null}
      slug={data.story.slug}
      guestbook={guestbook.items}
      cardPngUrl={null}
    />
  );
}
