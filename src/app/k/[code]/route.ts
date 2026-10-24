import { calendarResponse } from '@/lib/short-links';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** wedding.co.tz/k/<code>: the guest's wedding day as a calendar file. */
export async function GET(_req: Request, { params }: { params: { code: string } }) {
  return calendarResponse(params.code);
}
