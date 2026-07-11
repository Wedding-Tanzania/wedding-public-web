import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { Countdown } from '@/components/story/Countdown';
import { Guestbook } from '@/components/story/Guestbook';

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
interface PartyMember {
  name: string;
  role: string;
  photoUrl?: string;
}
interface Faq {
  question: string;
  answer: string;
}

interface StoryResponse {
  story: {
    slug: string;
    heroImageUrl?: string;
    welcomeMessage?: string;
    ourStory?: string;
    galleryImageUrls: string[];
    schedule: ScheduleItem[];
    weddingParty: PartyMember[];
    faqs: Faq[];
    registryNote?: string;
    travelNote?: string;
    hashtag?: string;
    rsvpOpen: boolean;
    published: boolean;
  };
  cardTemplate?: string;
  tier?: string;
  couple?: { partnerA: string; partnerB: string; weddingDate: string };
}
interface GuestbookResponse {
  items: { id: string; name: string; message: string; createdAt?: string }[];
}

const CARD_SWATCH: Record<string, [string, string]> = {
  garden_sage: ['#4F6A42', '#E2E9DA'],
  swahili_coast: ['#1A4DC5', '#D9C7A8'],
  modern_linen: ['#1F2A1A', '#F1EADB'],
  nikah_gold: ['#8A6D1F', '#F2E9D0'],
  kitenge_bold: ['#B23A3A', '#F2A900'],
  zanzibar_beach: ['#0E7C7B', '#F1EADB'],
};

function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] ?? full;
}
function eventTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
}
function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow justify-center">{children}</div>;
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
  let guestbook: GuestbookResponse = { items: [] };
  try {
    guestbook = await apiGet<GuestbookResponse>(
      `/story/${params.coupleSlug}/guestbook`,
    );
  } catch {
    // guestbook is best-effort
  }

  const { story, couple } = data;
  const wd = couple !== undefined ? new Date(couple.weddingDate) : null;
  const nameA = couple !== undefined ? firstName(couple.partnerA) : 'The';
  const nameB = couple !== undefined ? firstName(couple.partnerB) : 'Couple';

  // Unique venues from the schedule, for the venue + map sections.
  const venues = story.schedule
    .filter((s) => s.venueName)
    .filter(
      (s, i, arr) => arr.findIndex((x) => x.venueName === s.venueName) === i,
    );
  const [cardA, cardB] = CARD_SWATCH[data.cardTemplate ?? 'garden_sage'] ??
    CARD_SWATCH.garden_sage;

  const nav = [
    story.ourStory && ['story', 'Story'],
    story.schedule.length > 0 && ['schedule', 'Schedule'],
    story.galleryImageUrls.length > 0 && ['gallery', 'Photos'],
    ['card', 'Card'],
    story.weddingParty.length > 0 && ['party', 'Party'],
    story.faqs.length > 0 && ['faq', 'FAQ'],
    ['rsvp', 'RSVP'],
  ].filter(Boolean) as [string, string][];

  return (
    <main className="bg-linen">
      {/* Hero */}
      <section
        className="relative grid min-h-[80vh] place-items-center px-6 py-24 text-center text-paper"
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
          {story.welcomeMessage !== undefined && story.welcomeMessage !== '' ? (
            <p className="mx-auto mt-8 max-w-xl font-sans text-xl text-herb-100">
              {story.welcomeMessage}
            </p>
          ) : (
            <div className="mt-8 font-sans text-xl text-herb-100">
              request the pleasure of your company
            </div>
          )}
          {wd !== null && (
            <div className="mt-10 text-[11px] uppercase tracking-widest text-herb-200">
              {wd.toLocaleDateString('en', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          )}
          {wd !== null && couple !== undefined && (
            <div className="mt-8">
              <Countdown target={couple.weddingDate} />
            </div>
          )}
        </div>
      </section>

      {/* Feature nav */}
      <nav className="sticky top-0 z-10 border-b border-bordr bg-linen/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-3">
          {nav.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3 hover:text-herb-600"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* Our story */}
      {story.ourStory !== undefined && story.ourStory !== '' && (
        <section id="story" className="scroll-mt-16 bg-paper px-6 py-28 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>Our story</Eyebrow>
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

      {/* Order of the day */}
      {story.schedule.length > 0 && (
        <section id="schedule" className="scroll-mt-16 bg-herb-50 px-6 py-28 lg:px-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <Eyebrow>Order of the day</Eyebrow>
              <h2 className="mt-4 font-sans text-4xl font-light text-herb-900">
                How the day{' '}
                <em className="font-extrabold not-italic text-herb-600">flows.</em>
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

      {/* Venues */}
      {venues.length > 0 && (
        <section id="venues" className="scroll-mt-16 bg-paper px-6 py-24 lg:px-12">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <Eyebrow>Where</Eyebrow>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {venues.map((v, i) => (
                <div key={i} className="rounded-lg border border-bordr bg-linen p-6">
                  <div className="font-sans text-2xl text-herb-900">
                    {v.venueName}
                  </div>
                  {v.venueAddress !== undefined && (
                    <p className="mt-2 text-sm text-ink-2">{v.venueAddress}</p>
                  )}
                  {v.venueMapUrl !== undefined && (
                    <a
                      href={v.venueMapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.1em] text-herb-600 hover:underline"
                    >
                      Get directions →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Invitation card showcase */}
      <section id="card" className="scroll-mt-16 bg-herb-50 px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-md text-center">
          <Eyebrow>Your invitation</Eyebrow>
          <div
            className="mt-8 grid aspect-[3/4] place-items-center rounded-2xl p-8 text-paper shadow-trust"
            style={{ background: `linear-gradient(150deg, ${cardA}, ${cardB})` }}
          >
            <div>
              <div className="text-[10px] uppercase tracking-widest opacity-90">
                Together with their families
              </div>
              <div className="mt-6 font-sans text-4xl font-light">
                {nameA} &amp; {nameB}
              </div>
              {wd !== null && (
                <div className="mt-6 text-sm uppercase tracking-widest opacity-90">
                  {wd.toLocaleDateString('en', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {story.galleryImageUrls.length > 0 && (
        <section id="gallery" className="scroll-mt-16 bg-linen px-6 py-24 lg:px-12">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <Eyebrow>Moments</Eyebrow>
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

      {/* Wedding party */}
      {story.weddingParty.length > 0 && (
        <section id="party" className="scroll-mt-16 bg-paper px-6 py-24 lg:px-12">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <Eyebrow>The wedding party</Eyebrow>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {story.weddingParty.map((p, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-herb-100">
                    {p.photoUrl !== undefined ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.photoUrl}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-sans text-2xl text-herb-600">
                        {p.name.slice(0, 1)}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 font-sans text-lg text-herb-900">
                    {p.name}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-herb-600">
                    {p.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gifts + Travel */}
      {(story.registryNote !== undefined || story.travelNote !== undefined) && (
        <section className="bg-herb-50 px-6 py-24 lg:px-12">
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {story.registryNote !== undefined && (
              <div className="rounded-lg border border-bordr bg-paper p-6">
                <Eyebrow>Gifts</Eyebrow>
                <p className="mt-4 whitespace-pre-wrap text-ink-2">
                  {story.registryNote}
                </p>
              </div>
            )}
            {story.travelNote !== undefined && (
              <div className="rounded-lg border border-bordr bg-paper p-6">
                <Eyebrow>Travel &amp; stay</Eyebrow>
                <p className="mt-4 whitespace-pre-wrap text-ink-2">
                  {story.travelNote}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* FAQ */}
      {story.faqs.length > 0 && (
        <section id="faq" className="scroll-mt-16 bg-paper px-6 py-24 lg:px-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <Eyebrow>Good to know</Eyebrow>
            </div>
            <div className="divide-y divide-bordr border-y border-bordr">
              {story.faqs.map((f, i) => (
                <div key={i} className="py-6">
                  <div className="font-sans text-lg text-herb-900">
                    {f.question}
                  </div>
                  <p className="mt-2 text-ink-2">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RSVP */}
      <section
        id="rsvp"
        className="scroll-mt-16 bg-herb-900 px-6 py-24 text-center text-herb-100"
      >
        {story.rsvpOpen ? (
          <>
            <div className="font-sans text-3xl text-herb-50">Utafika?</div>
            <p className="mx-auto mt-4 max-w-xl text-herb-200">
              Look for your personal RSVP link in the invitation we sent by SMS.
              Each link is unique to your household.
            </p>
          </>
        ) : (
          <div className="font-sans text-2xl text-herb-50">
            For the day that begins a lifetime together.
          </div>
        )}
        {story.hashtag !== undefined && story.hashtag !== '' && (
          <div className="mt-6 font-mono text-sm uppercase tracking-[0.14em] text-herb-300">
            #{story.hashtag}
          </div>
        )}
      </section>

      {/* Guestbook */}
      <section id="guestbook" className="scroll-mt-16 bg-linen px-6 py-24 lg:px-12">
        <div className="mb-10 text-center">
          <Eyebrow>Wishes</Eyebrow>
          <h2 className="mt-4 font-sans text-4xl font-light text-herb-900">
            Leave the couple a{' '}
            <em className="font-extrabold not-italic text-herb-600">wish.</em>
          </h2>
        </div>
        <Guestbook slug={story.slug} initial={guestbook.items} />
      </section>

      {/* Footer */}
      <section className="bg-herb-900 px-6 py-12 text-center text-[10px] uppercase tracking-widest text-herb-300">
        A wedding by Lockwood
      </section>
    </main>
  );
}
