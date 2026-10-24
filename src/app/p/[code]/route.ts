import { pageRedirect } from '@/lib/short-links';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** wedding.co.tz/p/<code>: the wedding page, counted for this guest. */
export async function GET(req: Request, { params }: { params: { code: string } }) {
  return pageRedirect(req.url, params.code, req.headers.get('user-agent') ?? '');
}
