import { calendarPage } from '@/lib/short-links';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** wedding.co.tz/k/<code>: the ways to add the guest's wedding day to a calendar. */
export async function GET(req: Request, { params }: { params: { code: string } }) {
  return calendarPage(req.url, params.code, req.headers.get('user-agent') ?? '');
}
