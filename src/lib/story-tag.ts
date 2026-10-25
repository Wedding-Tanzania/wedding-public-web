/**
 * The cache tag on every fetch of a wedding's public story, so a save can drop
 * them all at once (story-refresh.ts). Its own module, free of Node imports,
 * because the share image that reads the story runs on the edge runtime.
 */
export function storyTag(slug: string): string {
  return `story:${slug}`;
}
