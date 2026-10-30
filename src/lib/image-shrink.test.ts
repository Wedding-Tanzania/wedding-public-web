import { describe, expect, it } from 'vitest';
import { JPEG_QUALITY, MAX_EDGE, fitsWithin, jpegName, passThrough, shrinkImage, targetSize } from './image-shrink';

describe('targetSize', () => {
  it('keeps the contract limits', () => {
    expect(MAX_EDGE).toBe(1600);
    expect(JPEG_QUALITY).toBe(0.82);
  });

  it('scales a landscape phone photo down to 1600 on the long edge', () => {
    expect(targetSize(4032, 3024)).toEqual({ width: 1600, height: 1200 });
  });

  it('scales a portrait photo down to 1600 on the long edge', () => {
    expect(targetSize(3024, 4032)).toEqual({ width: 1200, height: 1600 });
  });

  it('leaves a photo that already fits untouched', () => {
    expect(targetSize(1600, 900)).toEqual({ width: 1600, height: 900 });
    expect(targetSize(640, 480)).toEqual({ width: 640, height: 480 });
    expect(fitsWithin(1600, 900)).toBe(true);
    expect(fitsWithin(1601, 900)).toBe(false);
  });

  it('never produces an empty canvas', () => {
    expect(targetSize(0, 0)).toEqual({ width: 1, height: 1 });
    expect(targetSize(1, 20000)).toEqual({ width: 1, height: 1600 });
  });

  it('honours a custom edge', () => {
    expect(targetSize(4000, 2000, 800)).toEqual({ width: 800, height: 400 });
  });
});

describe('jpegName', () => {
  it('swaps the extension for .jpg', () => {
    expect(jpegName('IMG_0042.HEIC')).toBe('IMG_0042.jpg');
    expect(jpegName('selfie.png')).toBe('selfie.jpg');
    expect(jpegName('noext')).toBe('noext.jpg');
    expect(jpegName('')).toBe('photo.jpg');
  });
});

describe('shrinkImage fallback', () => {
  it('returns the original file untouched when there is no canvas (as in this test runtime)', async () => {
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'from-phone.jpg', { type: 'image/jpeg' });
    const out = await shrinkImage(file);
    expect(out.shrunk).toBe(false);
    expect(out.blob).toBe(file);
    expect(out.name).toBe('from-phone.jpg');
  });

  it('passThrough names an unnamed file', () => {
    const file = new File([new Uint8Array([1])], '', { type: 'image/jpeg' });
    expect(passThrough(file).name).toBe('photo');
  });
});
