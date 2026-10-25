const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1';

/**
 * `tags` lets a save drop this response from the cache before the minute is
 * up (see story-refresh.ts).
 */
export async function apiGet<T>(path: string, init?: RequestInit, tags?: string[]): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
    next: { revalidate: 60, ...(tags !== undefined ? { tags } : {}) },
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}
