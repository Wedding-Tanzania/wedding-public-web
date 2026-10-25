import { timingSafeEqual } from 'crypto';

/**
 * Refreshing a wedding page the moment the couple saves.
 *
 * The page is static and regenerated at most once a minute, and the first
 * visit after a minute is up is still served the old copy while the new one
 * builds. So a couple who uploads a church photo and opens the link at once
 * sees the page without it. The API calls /api/revalidate on every save
 * that changes what the page shows, and this drops the page's cached data so
 * the next visit is built fresh.
 */

export { storyTag } from './story-tag';

/** A couple slug as the API mints it: lowercase words joined by hyphens. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG = 120;

function sameSecret(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function refreshStory(args: {
  /** REVALIDATE_SECRET; empty switches the route off. */
  secret: string;
  /** The caller's x-revalidate-secret header. */
  given: string | null;
  body: unknown;
  drop: (slug: string) => void;
}): { status: number; body: Record<string, unknown> } {
  if (args.secret === '') return { status: 503, body: { error: 'NOT_CONFIGURED' } };
  if (args.given === null || !sameSecret(args.given, args.secret)) {
    return { status: 401, body: { error: 'UNAUTHORIZED' } };
  }
  const slug = (args.body as { slug?: unknown } | null)?.slug;
  if (typeof slug !== 'string' || slug.length > MAX_SLUG || !SLUG.test(slug)) {
    return { status: 400, body: { error: 'INVALID_SLUG' } };
  }
  args.drop(slug);
  return { status: 200, body: { refreshed: slug } };
}
