import { notFound } from 'next/navigation';
import { apiGet } from '@/lib/api';

export const revalidate = 300;

interface ScheduleItem {
  title: string;
  startsAt: string;
  endsAt?: string;
  venueName: string;
  venueAddress?: string;
  venueMapUrl?: string;
  dressCode?: string;
  notes?: string;
}

interface StoryResponse {
  story: {
    slug: string;
    heroImageUrl?: string;
    ourStory?: string;
    galleryImageUrls: string[];
    schedule: ScheduleItem[];
    rsvpOpen: boolean;
    published: boolean;
  };
  couple?: {
    partnerA: string;
    partnerB: string;
    weddingDate: string;
  };
}

function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] ?? full;
}

function eventTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
}

export default async function CoupleStoryPage({
  params,
}: {
  params: { coupleSlug: string };
}) {
  let data: StoryResponse;
  try {
    data = await apiGet<StoryResponse>(`/story/${params.coupleSlug}`);
  } catch {
    notFound();
  }

  const { story, couple } = data;
  const wd = couple !== undefined ? new Date(couple.weddingDate) : null;
  const daysUntil =
    wd !== null
      ? Math.max(0, Math.ceil((wd.getTime() - Date.now()) / 86_400_000))
      : null;
  const nameA = couple !== undefined ? firstName(couple.partnerA) : 'The';
  const nameB = couple !== undefined ? firstName(couple.partnerB) : 'Couple';

  return (
    <main className="bg-linen">
      {/* Hero */}
      <section
        className="relative grid min-h-[70vh] place-items-center px-6 text-center text-paper"
        style={{
          background: story.heroImageUrl
            ? `linear-gradient(rgba(26,37,22,0.55), rgba(26,37,22,0.55)), url(${story.heroImageUrl}) center/cover`
            : 'linear-gradient(180deg, var(--w-herb-700), var(--w-herb-900))',
        }}
      >
        <div className="relative">
          <div className="text-[10px] uppercase tracking-widest text-herb-200">
            Together with their families
          </div>
          <h1 className="mt-8 font-sans text-[clamp(3.5rem,9vw,8rem)] font-light leading-[0.95] text-herb-50">
            {nameA}
            <em className="my-2 block text-[60%] italic text-herb-200">&</em>
            {nameB}
          </h1>
          <div className="mt-10 font-sans text-2xl text-herb-100">
            request the pleasure of your company at the celebration of their
            marriage
          </div>
          {wd !== null && (
            <div className="mt-12 flex items-center justify-center gap-12">
              <div>
                <div className="text-5xl font-light leading-none">
                  {wd.getDate()}
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-widest">
                  {wd.toLocaleDateString('en', { weekday: 'long' })}
                </div>
              </div>
              <div className="h-14 w-px bg-herb-300" />
              <div>
                <div className="text-2xl">
                  {wd.toLocaleDateString('en', { month: 'long' })}
                </div>
                <div className="text-2xl">{wd.getFullYear()}</div>
              </div>
            </div>
          )}
          {daysUntil !== null && (
            <div className="mt-8 text-[11px] uppercase tracking-widest text-herb-200">
              {daysUntil} days until the day
            </div>
          )}
        </div>
      </section>

      {/* Our story */}
      {story.ourStory !== undefined && story.ourStory !== '' && (
        <section className="bg-paper px-6 py-28 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="eyebrow justify-center">Our story</div>
            <h2 className="mt-4 font-sans text-4xl font-light text-herb-900">
              How we got{' '}
              <em className="font-extrabold not-italic text-herb-600">here.</em>
            </h2>
            <p className="mt-8 whitespace-pre-wrap font-sans text-xl leading-relaxed text-ink-2">
              {story.ourStory}
            </p>
          </div>
        </section>
      )}

      {/* Gallery */}
      {story.galleryImageUrls.length > 0 && (
        <section className="bg-linen px-6 py-24 lg:px-12">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <div className="eyebrow justify-center">Moments</div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {story.galleryImageUrls.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="aspect-square w-full rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Order of day */}
      {story.schedule.length > 0 && (
        <section className="bg-herb-50 px-6 py-28 lg:px-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <div className="eyebrow justify-center">Order of the day</div>
              <h2 className="mt-4 font-sans text-4xl font-light text-herb-900">
                How the day{' '}
                <em className="font-extrabold not-italic text-herb-600">
                  flows.
                </em>
              </h2>
            </div>
            <div>
              {story.schedule.map((ev, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[90px_1fr_130px] items-baseline gap-8 border-b border-bordr py-7 ${i === 0 ? 'border-t' : ''}`}
                >
                  <div className="font-sans text-xl text-herb-600">
                    {eventTime(ev.startsAt)}
                  </div>
                  <div>
                    <div className="font-sans text-xl">{ev.title}</div>
                    {ev.dressCode !== undefined && (
                      <div className="mt-1 text-[10px] uppercase tracking-widest text-herb-600">
                        {ev.dressCode}
                      </div>
                    )}
                    {ev.notes !== undefined && (
                      <div className="mt-1 text-sm text-ink-3">{ev.notes}</div>
                    )}
                  </div>
                  <div className="text-right text-[10px] uppercase tracking-widest text-ink-3">
                    {ev.venueName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RSVP note */}
      <section className="bg-herb-900 px-6 py-24 text-center text-herb-100">
        {story.rsvpOpen ? (
          <>
            <div className="font-sans text-2xl">Please RSVP</div>
            <p className="mx-auto mt-4 max-w-xl text-herb-200">
              Look for your personal RSVP link in the invitation we sent you by
              SMS. Each link is unique to your household.
            </p>
          </>
        ) : (
          <div className="font-sans text-2xl">
            For the day that begins a lifetime together.
          </div>
        )}
        <div className="mt-6 text-[10px] uppercase tracking-widest text-herb-300">
          A wedding by Lockwood
        </div>
      </section>
    </main>
  );
}
