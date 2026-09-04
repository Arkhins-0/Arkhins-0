import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Public assets are served from the root; external URLs pass through. */
export function getAssetPath(path: string): string {
  if (!path) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return path.startsWith('/') ? path : `/${path}`;
}

/** Merge class names with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Fills `{token}` placeholders in a copy string from the data files. */
export function fill(
  template: string,
  vars: Record<string, string | number | undefined>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value === undefined ? match : String(value);
  });
}

/** Initials, capped to `count` characters. */
export function getInitials(name: string, count = 2): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, count);
}
