import { notFound } from 'next/navigation';
import type { Couple, StoryPage } from '@wedding/shared-types';
import { apiGet } from '@/lib/api';

export const revalidate = 300;

interface CouplePublicResponse {
  couple: Couple;
  story: StoryPage;
}

export default async function CoupleStoryPage({
  params,
}: {
  params: { coupleSlug: string };
}) {
  let data: CouplePublicResponse;
  try {
    data = await apiGet<CouplePublicResponse>(`/public/couples/${params.coupleSlug}`);
  } catch {
    notFound();
  }

  const { couple, story } = data;
  const daysUntil = Math.max(
    0,
    Math.ceil(
      (new Date(couple.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    ),
  );

  return (
    <main>
      <section
        className="relative flex min-h-[60vh] items-center justify-center bg-secondary text-white"
        style={{
          backgroundImage: story.heroImageUrl !== undefined ? `url(${story.heroImageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-secondary/50" />
        <div className="relative text-center px-6">
          <p className="uppercase tracking-widest text-sm opacity-80">We are getting married</p>
          <h1 className="mt-4 text-5xl md:text-7xl font-bold">
            {couple.partnerAFirstName} &amp; {couple.partnerBFirstName}
          </h1>
          <p className="mt-6 text-lg">
            {new Date(couple.weddingDate).toLocaleDateString('en-TZ', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <p className="mt-2 text-xl font-semibold">{daysUntil} days to go</p>
        </div>
      </section>

      {story.ourStory !== undefined && (
        <section className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-3xl font-bold text-secondary">Our Story</h2>
          <p className="mt-6 whitespace-pre-wrap text-gray-700 leading-relaxed">{story.ourStory}</p>
        </section>
      )}
    </main>
  );
}
