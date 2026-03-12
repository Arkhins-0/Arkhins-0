import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper function to return asset paths (Vercel serves public assets from root)
export function getAssetPath(path: string): string {
  if (!path) return path;
  // External URLs returned as-is
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Ensure path starts with /
  return path.startsWith('/') ? path : `/${path}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return date;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
