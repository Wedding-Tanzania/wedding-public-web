import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Couple, StoryPage } from '@wedding/shared-types';
import { apiGet } from '@/lib/api';

export const revalidate = 300;

interface CouplePublicResponse {
  couple: Couple;
  story: StoryPage;
}

const demo: CouplePublicResponse = {
  couple: {
    id: 'demo',
    userId: 'demo',
    slug: 'amani-nyota',
    partnerAFirstName: 'Amani',
    partnerALastName: 'Mwakatumbula',
    partnerBFirstName: 'Nyota',
    partnerBLastName: 'Komba',
    weddingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
    themes: ['garden'],
    createdAt: '',
    updatedAt: '',
  },
  story: {
    coupleId: 'demo',
    heroImageUrl: undefined,
    ourStory:
      'We met at a quiet table at Oyster Bay, in the rain, on a Wednesday in March. Five years later, we are getting married twelve metres from where we sat that night. Family from Mwanza, Dodoma, Arusha, Nairobi, and London. Bring an umbrella, just in case.',
    galleryImageUrls: [],
    schedule: [
      {
        title: 'Arrival & welcome drinks',
        startsAt: new Date().toISOString(),
        venueName: 'Garden terrace',
        notes: 'Dress: garden formal',
      },
      {
        title: 'Ceremony',
        startsAt: new Date().toISOString(),
        venueName: 'Garden pavilion',
        notes: 'Family blessings, vows, ring exchange',
      },
      {
        title: 'Cocktails & canapés',
        startsAt: new Date().toISOString(),
        venueName: 'Terrace',
        notes: 'Live strings · photography with the couple',
      },
      {
        title: 'Dinner & toasts',
        startsAt: new Date().toISOString(),
        venueName: 'Main hall',
        notes: 'Seated by table assignment',
      },
      {
        title: 'First dance & reception',
        startsAt: new Date().toISOString(),
        venueName: 'Main hall',
        notes: 'Live band until midnight',
      },
    ],
    rsvpOpen: true,
    vendorCredits: [],
    updatedAt: '',
  },
};

export default async function CoupleStoryPage({
  params,
}: {
  params: { coupleSlug: string };
}) {
  let data: CouplePublicResponse;
  try {
    data = await apiGet<CouplePublicResponse>(`/public/couples/${params.coupleSlug}`);
  } catch {
    if (params.coupleSlug === 'amani-nyota') data = demo;
    else notFound();
    data = demo;
  }
  const { couple, story } = data;

  const wd = new Date(couple.weddingDate);
  const daysUntil = Math.max(0, Math.ceil((wd.getTime() - Date.now()) / 86_400_000));

  return (
    <main className="bg-ivory">
      {/* Hero */}
      <section
        className="relative min-h-[70vh] grid place-items-center text-paper text-center px-6"
        style={{
          background: story.heroImageUrl
            ? `linear-gradient(rgba(33,9,10,0.55), rgba(33,9,10,0.55)), url(${story.heroImageUrl}) center/cover`
            : 'linear-gradient(180deg, var(--w-blush-700), var(--w-blush-900))',
        }}
      >
        <div className="relative">
          <div className="text-[10px] uppercase tracking-widest4 text-blush-200">
            Together with their families
          </div>
          <h1 className="mt-8 font-display font-light text-[clamp(3.5rem,9vw,8rem)] leading-[0.95] text-blush-50">
            {couple.partnerAFirstName}
            <em className="block italic text-blush-200 text-[60%] my-2">&</em>
            {couple.partnerBFirstName}
          </h1>
          <div className="mt-10 font-display italic text-2xl text-blush-100">
            request the pleasure of your company at the celebration of their marriage
          </div>
          <div className="flex items-center justify-center gap-12 mt-12">
            <div>
              <div className="font-display font-light text-5xl leading-none">{wd.getDate()}</div>
              <div className="text-[10px] uppercase tracking-widest3 mt-2">
                {wd.toLocaleDateString('en', { weekday: 'long' })}
              </div>
            </div>
            <div className="w-px h-14 bg-blush-300" />
            <div>
              <div className="font-display italic text-2xl">
                {wd.toLocaleDateString('en', { month: 'long' })}
              </div>
              <div className="font-display text-2xl">{wd.getFullYear()}</div>
            </div>
            <div className="w-px h-14 bg-blush-300" />
            <div>
              <div className="font-display font-light text-5xl leading-none">5</div>
              <div className="text-[10px] uppercase tracking-widest3 mt-2">O'clock</div>
            </div>
          </div>
          <div className="font-display italic text-xl text-blush-100 mt-10">
            Oyster Bay Gardens · Dar es Salaam
          </div>
          <div className="text-[11px] uppercase tracking-widest3 text-blush-200 mt-6">
            {daysUntil} days until the day
          </div>
          <div className="flex gap-4 justify-center mt-10">
            <Link
              href={`/${couple.slug}/rsvp`}
              className="btn btn-primary !bg-paper !text-blush-700 hover:!bg-blush-50"
            >
              RSVP
            </Link>
            <Link
              href={`/${couple.slug}/contribute`}
              className="btn btn-outline !text-blush-50 !border-blush-100 hover:!bg-blush-700"
            >
              Send a gift
            </Link>
          </div>
        </div>
      </section>

      {/* Our story */}
      {story.ourStory !== undefined && (
        <section className="px-6 lg:px-12 py-28 bg-paper">
          <div className="max-w-3xl mx-auto text-center">
            <div className="ornament justify-center">— Our story —</div>
            <h2 className="mt-4 font-display font-light text-4xl text-blush-900">
              How we got <em className="italic text-blush-600">here.</em>
            </h2>
            <p className="mt-8 font-display italic text-xl text-ink-2 leading-relaxed whitespace-pre-wrap">
              {story.ourStory}
            </p>
          </div>
        </section>
      )}

      {/* Order of day */}
      {story.schedule.length > 0 && (
        <section className="px-6 lg:px-12 py-28 bg-blush-50">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="ornament justify-center">— Order of the day —</div>
              <h2 className="mt-4 font-display font-light text-4xl text-blush-900">
                How the evening <em className="italic text-blush-600">flows.</em>
              </h2>
            </div>
            <div>
              {story.schedule.map((ev, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[80px_1fr_120px] gap-8 items-baseline py-7 border-b border-bordr ${i === 0 ? 'border-t' : ''}`}
                >
                  <div className="font-display italic text-2xl text-blush-600">
                    {String(4 + i + (i > 0 ? 0.5 : 0)).replace('.5', ':30').padStart(4, ' ').trim() ||
                      `${4 + i}:00`}
                  </div>
                  <div>
                    <div className="font-display text-xl">{ev.title}</div>
                    {ev.notes !== undefined && (
                      <div className="text-sm text-ink-3 mt-1">{ev.notes}</div>
                    )}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest3 text-ink-3 text-right">
                    {ev.venueName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-6 py-24 bg-blush-900 text-blush-100 text-center">
        <div className="font-display italic text-2xl">
          For the day that begins a lifetime together.
        </div>
        <div className="text-[10px] uppercase tracking-widest3 text-blush-300 mt-4">
          A wedding by Lockwood
        </div>
      </section>
    </main>
  );
}
