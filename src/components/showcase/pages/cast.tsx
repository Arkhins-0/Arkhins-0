/* eslint-disable @next/next/no-img-element -- pose art may be a bucket URL of unknown size, or a GIF */
import type { PageGuest } from './types';

/**
 * Hands the guest's poses out to a page's sprite spots, in order: spot k gets poses[k] (or nothing
 * when there are fewer poses than spots). Poses left over once every spot is filled come back in
 * `rest`, which the page must render too (e.g. as a group at the end), so no pose is ever unused —
 * even after more are added in /admin.
 */
export function castSpots(guest: PageGuest | undefined, spots: number) {
  const poses = guest?.poses ?? [];
  const at = (k: number): string | undefined => (k < spots ? poses[k] : undefined);
  return { at, rest: poses.slice(spots), count: poses.length };
}

/** A pose picture as a plain transparent sprite. Decorative: the words sit beside it. */
export function CastSprite({
  src,
  guest,
  className,
  style,
}: {
  src?: string;
  guest?: PageGuest;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={guest ? `${guest.name} (${guest.series})` : ''}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={className}
      style={style}
    />
  );
}
