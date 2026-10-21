import { ICON_PATHS, isIconName } from '@/lib/invite/icons';

/** A Material icon as inline SVG, in the current text colour. */
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const d = isIconName(name) ? ICON_PATHS[name] : ICON_PATHS.Schedule;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false" style={{ display: 'block', flex: 'none' }}>
      <path d={d} fill="currentColor" />
    </svg>
  );
}
