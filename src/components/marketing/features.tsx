import Image from 'next/image';
import Link from 'next/link';
import { DEMO_STORY_URL } from '@/lib/site-links';
import { PhoneShot } from './PhoneShot';

/**
 * The seven things Wedding by Lockwood does, shared by the homepage and
 * /features. Each block pairs a photo of a person doing the job (generated in
 * Canva, public/marketing/feature-*.webp) with a real app screen.
 */

export interface Feature {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  photo: string;
  photoAlt: string;
  screen: string;
  screenAlt: string;
  link?: { href: string; label: string };
}

export const features: Feature[] = [
  {
    id: 'guests',
    eyebrow: 'Wageni · guests and cards',
    title: 'Every guest, every card, every reply',
    body: 'Build the guest list from your phone contacts, send each guest their own invitation card by SMS or WhatsApp, and see who has said yes.',
    bullets: [
      'Import guests from your contacts, or add them one by one',
      'A personal card for each guest, sent by SMS or WhatsApp',
      'RSVP answers land back in the list',
    ],
    photo: '/marketing/feature-guests.webp',
    photoAlt: 'A woman at home sending wedding invitations from her phone, printed cards beside her',
    screen: '/marketing/screens/06-people.webp',
    screenAlt: 'The People screen of the app: guests and kamati with their invitation status',
  },
  {
    id: 'michango',
    eyebrow: 'Michango · contributions',
    title: 'Michango in, by mobile money',
    body: 'Record each pledge, send a payment request, and watch contributions arrive by M-Pesa, Mixx by Yas or Airtel Money. Cash handed to the treasurer goes in the same ledger.',
    bullets: [
      'See who pledged, who has paid in full and who still owes',
      'Mobile-money payments are matched to the right person',
      'Wedding by Lockwood takes no fee from a contribution',
    ],
    photo: '/marketing/feature-michango.webp',
    photoAlt: 'An older man sending a wedding contribution from his phone while his wife looks on',
    screen: '/marketing/screens/02-pledges.webp',
    screenAlt: 'The Pledges screen of the app: each pledge with its amount and whether it is fulfilled, partial or open',
  },
  {
    id: 'budget',
    eyebrow: 'Bajeti · budget and spending',
    title: 'Know where every shilling goes',
    body: 'Set the budget with your kamati, then log each cost as it is planned and paid: venue, catering, decor, photography and the rest.',
    bullets: [
      'Planned and paid, side by side, per category',
      'Money received against money spent on the home screen',
      'Bigger changes wait for the couple to approve them',
    ],
    photo: '/marketing/feature-budget.webp',
    photoAlt: 'An engaged couple at a cafe going through their wedding budget with a notebook and a phone',
    screen: '/marketing/screens/04-spending.webp',
    screenAlt: 'The Spending screen of the app: wedding costs by category, planned or paid',
  },
  {
    id: 'kamati',
    eyebrow: 'Kamati · the committee',
    title: 'Plan together with your kamati',
    body: 'Invite the chairperson, the treasurer and the rest of the committee. Everyone works from the same list of tasks, so nothing slips between meetings.',
    bullets: [
      'Tasks with due dates and priorities',
      'Kamati members join with their own sign-in',
      'One place instead of a dozen WhatsApp threads',
    ],
    photo: '/marketing/feature-kamati.webp',
    photoAlt: 'A wedding committee meeting in a living room, led by a woman holding a phone',
    screen: '/marketing/screens/05-tasks.webp',
    screenAlt: 'The Tasks screen of the app: wedding tasks with due dates and priorities',
  },
  {
    id: 'story',
    eyebrow: 'Ukurasa · your wedding page',
    title: 'A wedding page your guests will open',
    body: 'Your story, the order of the day, the dress code, directions and RSVP at wedding.co.tz/your-names. Guests leave wishes with photos, and on the day the live wish wall plays them on the big screen.',
    bullets: [
      'Opens in any browser, no app needed for guests',
      'Wishes are filtered, and any guest can report one',
      'A live wish wall for the reception screen',
    ],
    photo: '/marketing/feature-wishes.webp',
    photoAlt: 'Two guests at a wedding reception writing a wish on a phone, a photo wall behind them',
    screen: '/marketing/screens/08-story.webp',
    screenAlt: 'The Story page screen of the app, where the couple edits their public wedding page',
    link: { href: DEMO_STORY_URL, label: 'See a sample wedding page' },
  },
  {
    id: 'checkin',
    eyebrow: 'Getini · gate check-in',
    title: 'Welcome guests at the gate',
    body: 'Every card carries its own QR code. The usher scans it with the app, or searches the name, and you can see who has arrived and how many seats are taken.',
    bullets: [
      'Scan the card or search by name',
      'Arrivals counted as they happen',
      'The camera is used only to read the QR code',
    ],
    photo: '/marketing/feature-checkin.webp',
    photoAlt: 'An usher at a garden wedding gate scanning the QR code on a guest’s invitation card',
    screen: '/marketing/screens/07-checkin.webp',
    screenAlt: 'The Gate check-in screen of the app: guests who have arrived and seats taken',
  },
  {
    id: 'app',
    eyebrow: 'Programu · the app',
    title: 'The whole wedding on one screen',
    body: 'The countdown, the budget, michango and guests at a glance, right on your phone. Notifications tell you when a pledge is paid or something needs your approval.',
    bullets: [
      'For the couple and every kamati member',
      'On your phone, and on the web at app.wedding.co.tz',
      'Your data stays yours: delete your account any time',
    ],
    photo: '/marketing/feature-app.webp',
    photoAlt: 'A bride-to-be by a sunny window checking her wedding plans on her phone',
    screen: '/marketing/screens/01-home.webp',
    screenAlt: 'The Home screen of the app: the countdown, budget, pledges, money received and guests',
    link: { href: '/app', label: 'Get the app' },
  },
];

export function FeatureBlock({ feature, index }: { feature: Feature; index: number }) {
  const flip = index % 2 === 1;
  return (
    <div id={feature.id} className="scroll-mt-28 grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
      <div className={`relative ${flip ? 'lg:order-2' : ''}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-herb-100">
          <Image
            src={feature.photo}
            alt={feature.photoAlt}
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
        </div>
        <PhoneShot
          src={feature.screen}
          alt={feature.screenAlt}
          className={`absolute -bottom-24 right-3 w-[100px] sm:-bottom-10 sm:w-[170px] lg:w-[190px] ${
            flip ? 'sm:right-auto sm:-left-6' : 'sm:-right-6'
          }`}
        />
      </div>
      <div className={`flex flex-col items-start gap-5 pt-14 sm:pt-8 lg:pt-0 ${flip ? 'lg:order-1' : ''}`}>
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-herb-600">
          {String(index + 1).padStart(2, '0')} · {feature.eyebrow}
        </span>
        <h3 className="font-sans text-[clamp(1.6rem,3vw,2.25rem)] font-bold leading-[1.15] text-ink-1 text-balance">
          {feature.title}
        </h3>
        <p className="font-sans text-base leading-relaxed text-ink-2">{feature.body}</p>
        <ul className="flex flex-col gap-2.5">
          {feature.bullets.map((b) => (
            <li key={b} className="flex gap-3 font-sans text-[15px] text-ink-1">
              <span className="mt-[9px] h-1.5 w-1.5 flex-shrink-0 bg-herb-600" aria-hidden="true" />
              {b}
            </li>
          ))}
        </ul>
        {feature.link && (
          <Link
            href={feature.link.href}
            className="mt-1 font-sans text-sm font-semibold text-herb-700 underline decoration-herb-300 underline-offset-4 hover:decoration-herb-700"
          >
            {feature.link.label}
          </Link>
        )}
      </div>
    </div>
  );
}
