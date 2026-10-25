import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { refreshStory, storyTag } from '@/lib/story-refresh';

/** Called by the API when a couple saves; see story-refresh.ts. */
export async function POST(req: Request): Promise<Response> {
  const body: unknown = await req.json().catch(() => null);
  const { status, body: out } = refreshStory({
    secret: process.env.REVALIDATE_SECRET ?? '',
    given: req.headers.get('x-revalidate-secret'),
    body,
    drop: (slug) => {
      revalidateTag(storyTag(slug));
      revalidatePath(`/${slug}`);
    },
  });
  return NextResponse.json(out, { status });
}
