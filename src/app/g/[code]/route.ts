import { apiBase } from '@/lib/short-links';
import { trackedLinkRedirect } from '@/lib/tracked-links';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** wedding.co.tz/g/<code>: a couple's own link (the photo gallery), counted. */
export async function GET(req: Request, { params }: { params: { code: string } }) {
  return trackedLinkRedirect(
    params.code,
    { userAgent: req.headers.get('user-agent') ?? '', cookie: req.headers.get('cookie') ?? '' },
    apiBase(),
    fetch,
  );
}
