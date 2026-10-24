import { mapRedirect } from '@/lib/short-links';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** wedding.co.tz/m/<code>-c (ceremony) or -r (reception): the venue's map, counted. */
export async function GET(req: Request, { params }: { params: { code: string } }) {
  return mapRedirect(req.url, params.code, req.headers.get('user-agent') ?? '');
}
