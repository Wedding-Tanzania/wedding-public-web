import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InvitePage } from '@/components/invite/InvitePage';
import { kindParam, sampleDesign, sampleGuest } from '@/lib/invite/sample';
import { byId } from '@/lib/invite/wcz';

export const metadata: Metadata = {
  title: 'Sample invitation',
  robots: { index: false, follow: false },
};

/**
 * The web invitation one template gives, with the sample wedding and a
 * sample guest, so the couple app can link "see the page" per template and
 * a change to the page can be checked without a saved wedding behind it.
 * No token: nothing can be replied to or paid for from here.
 */
export default function SampleInvitationPage({ params, searchParams }: { params: { design: string }; searchParams: { kind?: string; lang?: string } }) {
  if (!byId[params.design]) notFound();
  const kind = kindParam(searchParams.kind);
  return (
    <InvitePage
      design={sampleDesign(params.design, searchParams.lang === 'en' ? 'en' : 'sw')}
      token={null}
      guest={sampleGuest(kind)}
      status="invited"
      reply={null}
      rsvpOpen
      calendar={null}
      rsvpUrl="https://wedding.co.tz"
      accounts={[]}
      extras={null}
      slug={null}
      guestbook={[]}
      cardPngUrl={`/card-sample/${params.design}/card.png?kind=${kind}`}
    />
  );
}
