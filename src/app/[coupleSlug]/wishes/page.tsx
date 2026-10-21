import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { WishesForm, type WishesLang } from '@/components/story/WishesForm';

export const revalidate = 300;

interface StoryLite {
  story: { slug: string; published: boolean; hashtag?: string };
  couple?: { partnerA: string; partnerB: string; weddingDate: string };
}

function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] ?? full;
}

async function load(slug: string): Promise<StoryLite | null> {
  try {
    return await apiGet<StoryLite>(`/story/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

function coupleOf(data: StoryLite): string {
  return data.couple !== undefined
    ? `${firstName(data.couple.partnerA)} & ${firstName(data.couple.partnerB)}`
    : 'Maharusi';
}

export async function generateMetadata({ params }: { params: { coupleSlug: string } }): Promise<Metadata> {
  const data = await load(params.coupleSlug);
  if (data === null) return { title: 'Salamu · Wishes' };
  const couple = coupleOf(data);
  return {
    title: `Salamu kwa ${couple} · Wishes for ${couple}`,
    description: `Tuma salamu zako kwa ${couple}. Send ${couple} your wishes.`,
    robots: { index: false, follow: false },
  };
}

/**
 * The page the table-card QR opens: one short form, a name and a few words for
 * the couple, in Swahili or English. It posts to the story guestbook, so every
 * wish also appears on the couple's page and in their dashboard.
 */
export default async function WishesPage({
  params,
  searchParams,
}: {
  params: { coupleSlug: string };
  searchParams: { lang?: string };
}) {
  const data = await load(params.coupleSlug);
  if (data === null) notFound();
  const lang: WishesLang = searchParams.lang === 'en' ? 'en' : 'sw';
  const date = data.couple?.weddingDate;
  return (
    <main className="min-h-[85vh] bg-linen px-4 py-10 sm:py-16">
      <WishesForm
        slug={data.story.slug}
        couple={coupleOf(data)}
        weddingDate={date ?? null}
        hashtag={data.story.hashtag ?? null}
        initialLang={lang}
      />
    </main>
  );
}
