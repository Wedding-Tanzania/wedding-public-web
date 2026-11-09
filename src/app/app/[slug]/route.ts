import { campaignLinkRedirect } from '@/lib/campaign-links';
import { PLAY_STORE_URL } from '@/lib/store-links';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** wedding.co.tz/app/<slug>: a campaign link from the admin console, counted. */
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  return campaignLinkRedirect(
    params.slug,
    { userAgent: req.headers.get('user-agent') ?? '', cookie: req.headers.get('cookie') ?? '' },
    PLAY_STORE_URL,
  );
}
