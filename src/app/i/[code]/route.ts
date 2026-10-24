import { apiBase, cardRedirect } from '@/lib/short-links';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** wedding.co.tz/i/<code>: the short card link in guest messages. */
export async function GET(req: Request, { params }: { params: { code: string } }) {
  return cardRedirect(req.url, params.code, apiBase(), fetch, req.headers.get('user-agent') ?? '');
}
