import { cropFor, photo, type Crop, type InviteDesign, type Photo, type Slot } from './wcz';

/**
 * Where a photo sits inside a slot, as an absolutely positioned image.
 *
 * The design crops with background-size / background-position percentages.
 * The card image renderer has no background-size for photos, so the same
 * numbers are turned into a plain box: the image is W% x H% of the slot and
 * offset by (slot - image) x focus%, exactly what background-position means.
 */
export interface PlacedPhoto {
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

export function placePhoto(ph: Photo | null, crop: Crop | null, sw: number, sh: number): PlacedPhoto | null {
  if (ph === null || ph.src === '') return null;
  const ia = (ph.w || 1) / (ph.h || 1);
  const sa = sw / sh;
  const z = crop?.z ?? 1;
  const width = sw * z * Math.max(1, ia / sa);
  const height = sh * z * Math.max(1, sa / ia);
  const fx = (crop?.x ?? 50) / 100;
  const fy = (crop?.y ?? 50) / 100;
  return {
    src: ph.src,
    width: Math.round(width * 100) / 100,
    height: Math.round(height * 100) / 100,
    left: Math.round((sw - width) * fx * 100) / 100,
    top: Math.round((sh - height) * fy * 100) / 100,
  };
}

/** The photo in one of a template's slots, placed for that slot's size. */
export function placeSlot(d: InviteDesign, tplId: string, slot: Slot): PlacedPhoto | null {
  return placePhoto(photo(d, d.slots?.[slot.key]), cropFor(d, tplId, slot.key), slot.w, slot.h);
}
