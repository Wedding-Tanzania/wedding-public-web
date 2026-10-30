/**
 * Shrink a photo in the browser before it is uploaded.
 *
 * A phone photo is 3 to 12 MB and 4000px wide; the wall shows it at a fraction
 * of that, and guests at a reception are on mobile data. Re-encoding also drops
 * the photo's metadata, including the GPS position phones embed.
 *
 * Drawing an <img> to a canvas applies the photo's EXIF orientation in every
 * current browser, so portrait phone shots stay upright.
 *
 * Modelled on wedding-couple-app/src/lib/image-shrink.ts, with one difference:
 * a guest's wish photo must never be lost to a browser quirk, so when the
 * canvas path fails for any reason the original file is sent as it is and the
 * API's own 8 MB and type checks decide.
 */

/** Longest edge of the uploaded photo, in pixels. */
export const MAX_EDGE = 1600;
/** JPEG quality for the re-encoded photo. */
export const JPEG_QUALITY = 0.82;

export interface Size {
  width: number;
  height: number;
}

/**
 * The size a photo of `width` x `height` is drawn at so that its longest edge
 * is at most `maxEdge`. A photo already within the limit keeps its size; a
 * zero or negative dimension is treated as 1 px so the canvas is never empty.
 */
export function targetSize(width: number, height: number, maxEdge: number = MAX_EDGE): Size {
  const w = Math.max(1, Math.floor(width));
  const h = Math.max(1, Math.floor(height));
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

/**
 * True when a photo of this size needs no resizing. The caller may still
 * re-encode it (to strip metadata) or send it as it is.
 */
export function fitsWithin(width: number, height: number, maxEdge: number = MAX_EDGE): boolean {
  return Math.max(width, height) <= maxEdge;
}

/** The file name the shrunk JPEG is uploaded under. */
export function jpegName(original: string): string {
  const base = original.replace(/\.[^.]+$/, '');
  return `${base === '' ? 'photo' : base}.jpg`;
}

export interface ShrinkResult {
  blob: Blob;
  /** The file name to upload under (the shrunk photo is always a JPEG). */
  name: string;
  /** False when the original file was returned untouched. */
  shrunk: boolean;
}

function canUseCanvas(): boolean {
  return (
    typeof document !== 'undefined' &&
    typeof Image !== 'undefined' &&
    typeof URL !== 'undefined' &&
    typeof URL.createObjectURL === 'function'
  );
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      // HEIC on desktop Chrome, a renamed PDF, a corrupt download.
      reject(new Error('unreadable image'));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob(resolve, type, quality);
    } catch {
      resolve(null);
    }
  });
}

/** The original file, as a result: the fallback for every failure. */
export function passThrough(file: File): ShrinkResult {
  return { blob: file, name: file.name === '' ? 'photo' : file.name, shrunk: false };
}

/**
 * The photo as a JPEG no larger than `maxEdge` on its longest side, or the
 * original file when the browser cannot draw it. Never throws.
 */
export async function shrinkImage(file: File, maxEdge: number = MAX_EDGE): Promise<ShrinkResult> {
  if (!canUseCanvas()) return passThrough(file);
  try {
    const img = await loadImage(file);
    const { width, height } = targetSize(img.naturalWidth, img.naturalHeight, maxEdge);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const g = canvas.getContext('2d');
    if (g === null) return passThrough(file);
    g.drawImage(img, 0, 0, width, height);
    const jpeg = await toBlob(canvas, 'image/jpeg', JPEG_QUALITY);
    if (jpeg === null || jpeg.size === 0) return passThrough(file);
    return { blob: jpeg, name: jpegName(file.name), shrunk: true };
  } catch {
    return passThrough(file);
  }
}
