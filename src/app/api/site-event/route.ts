import { API_TIMEOUT_MS, apiBase } from '@/lib/short-links';
import { siteEventFrom } from '@/lib/site-events';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The browser's page-view and store-tap beacons, passed on to the API with
 * the visitor's browser so robots are not counted. Always 204: counting must
 * never get in a visitor's way.
 */
export async function POST(req: Request) {
  const event = siteEventFrom(await req.json().catch(() => null));
  if (event !== null) {
    const ua = (req.headers.get('user-agent') ?? '').slice(0, 512);
    await fetch(`${apiBase()}/site-events`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'content-type': 'application/json', ...(ua ? { 'X-Guest-User-Agent': ua } : {}) },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    }).catch(() => undefined);
  }
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}
