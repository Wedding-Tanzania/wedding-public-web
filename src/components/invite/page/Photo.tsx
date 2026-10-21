import type { CSSProperties } from 'react';
import type { Crop, Photo as P } from '@/lib/invite/wcz';

/**
 * A cropped photo on the page. The browser draws the crop with object-fit and
 * object-position, which mean exactly what the design's background-size and
 * background-position mean; zoom scales around the focus point. Only the
 * hero loads eagerly: every other photo is lazy so a slow picture never holds
 * up the page.
 */
export function Photo({ ph, crop, eager = false, style, alt = '' }: { ph: P | null; crop: Crop | null; eager?: boolean; style?: CSSProperties; alt?: string }) {
  if (ph === null) return null;
  const x = crop?.x ?? 50;
  const y = crop?.y ?? 50;
  const z = crop?.z ?? 1;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ph.src}
      alt={alt}
      width={ph.w}
      height={ph.h}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        maxWidth: 'none',
        objectFit: 'cover',
        objectPosition: `${x}% ${y}%`,
        transform: z !== 1 ? `scale(${z})` : undefined,
        transformOrigin: `${x}% ${y}%`,
        ...style,
      }}
    />
  );
}
