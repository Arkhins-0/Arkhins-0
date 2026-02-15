import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Base path for GitHub Pages deployment
export const basePath = process.env.NODE_ENV === 'production' ? '/Portfolio' : '';

// Helper function to prefix asset paths with basePath
export function getAssetPath(path: string): string {
  if (!path) return path;
  // If path already has basePath or is an external URL, return as-is
  if (path.startsWith(basePath) || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return basePath ? `${basePath}${normalizedPath}` : normalizedPath;
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
