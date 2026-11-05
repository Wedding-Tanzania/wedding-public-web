import { describe, expect, it } from 'vitest';
import { spotifyUri } from './spotify';

describe('spotifyUri', () => {
  it('turns a track link into the uri the iFrame API wants', () => {
    expect(spotifyUri('https://open.spotify.com/track/5XSuj4xrbakbDeSQom3oAr')).toBe('spotify:track:5XSuj4xrbakbDeSQom3oAr');
    expect(spotifyUri('https://open.spotify.com/intl-fr/album/1a2B3c?si=xyz')).toBe('spotify:album:1a2B3c');
  });
  it('refuses anything else', () => {
    expect(spotifyUri('https://youtu.be/abc')).toBeNull();
    expect(spotifyUri('not a link')).toBeNull();
  });
});
