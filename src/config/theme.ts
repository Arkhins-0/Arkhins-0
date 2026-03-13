// Theme configuration — rose is the only accent color
export type AccentColor = 'rose';

export interface ThemeColors {
  accent: string;
  accentLight: string;
  accentDark: string;
  accentRgb: string;
}

export const accentColors: Record<AccentColor, ThemeColors> = {
  rose: {
    accent: '#f43f5e',
    accentLight: '#fb7185',
    accentDark: '#e11d48',
    accentRgb: '244, 63, 94',
  },
};

export const lightTheme = {
  background: '#ffffff',
  foreground: '#0f172a',
  card: '#f8fafc',
  cardForeground: '#1e293b',
  muted: '#f1f5f9',
  mutedForeground: '#cccccc',
  border: '#cbd5e1',
};

export const darkTheme = {
  background: '#0a0a0f',
  foreground: '#f8fafc',
  card: '#151520',
  cardForeground: '#e2e8f0',
  muted: '#1e1e2e',
  mutedForeground: '#cccccc',
  border: '#2d2d3d',
};

export const defaultAccent: AccentColor = 'rose';
export const defaultTheme: 'light' | 'dark' = 'dark';

