const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';

/**
 * A guest reports a wish on the public page (App Store guideline 1.2). The API
 * takes it off the page at once and emails our support team; the couple can
 * put it back from the app if the report was a mistake.
 */
export async function reportWish(slug: string, entryId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_BASE}/story/${encodeURIComponent(slug)}/guestbook/${encodeURIComponent(entryId)}/report`,
      { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) },
    );
    return res.ok;
  } catch {
    return false;
  }
}
