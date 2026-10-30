import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { qrSvg } from '@/lib/qr';
import { storyTag } from '@/lib/story-tag';
import { coupleLabel, fetchWall, type WallLang, type WishWallResponse } from '@/lib/wall';
import { WishWall } from '@/components/wall/WishWall';

/**
 * The live wall for the screen at the reception: rendered on every request
 * with the wall as it is this second, then kept live by the client polling
 * GET /story/:slug/wall every 8 s. Never cached, never indexed.
 */
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://wedding.co.tz';

interface StoryLite {
  story: { slug: string; published: boolean; hashtag?: string };
  couple?: { partnerA: string; partnerB: string; weddingDate: string };
}

async function loadStory(slug: string): Promise<StoryLite | null> {
  try {
    return await apiGet<StoryLite>(`/story/${encodeURIComponent(slug)}`, undefined, [storyTag(slug)]);
  } catch {
    return null;
  }
}

async function loadWall(slug: string): Promise<WishWallResponse | null> {
  try {
    return await fetchWall(slug);
  } catch {
    return null;
  }
}

function pickLang(raw: string | undefined): WallLang {
  return raw === 'en' ? 'en' : 'sw';
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { coupleSlug: string };
  searchParams: { lang?: string };
}): Promise<Metadata> {
  const lang = pickLang(searchParams.lang);
  const data = await loadStory(params.coupleSlug);
  const couple = data === null ? coupleLabel(null, lang) : coupleLabel(data.couple ?? null, lang);
  return {
    title: `Ukuta wa salamu · ${couple}`,
    description: `Salamu na picha kutoka kwa wageni wa ${couple}. Wishes and photos from the guests of ${couple}.`,
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}

export default async function WallPage({
  params,
  searchParams,
}: {
  params: { coupleSlug: string };
  searchParams: { lang?: string };
}) {
  const slug = params.coupleSlug;
  const lang = pickLang(searchParams.lang);
  const initial = await loadWall(slug);
  if (initial === null) {
    // The wall route failed: an unknown slug is a 404, anything else (the API
    // blinking) still renders the screen, which keeps asking every 8 s.
    const story = await loadStory(slug);
    if (story === null) notFound();
  }
  const wishesUrl = initial?.wishesUrl ?? `${SITE_URL}/${encodeURIComponent(slug)}/wishes`;
  let qr: { svg: string; url: string } | null = null;
  try {
    qr = { svg: await qrSvg(wishesUrl, '#1F2A1A'), url: wishesUrl };
  } catch {
    // The client draws it on its own if the server could not.
  }
  return <WishWall slug={slug} lang={lang} initial={initial} qr={qr} />;
}
