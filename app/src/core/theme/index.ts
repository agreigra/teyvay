// Minimal design tokens. RTL-aware components should prefer logical spacing
// and avoid hardcoded left/right; use `start`/`end` where possible.

export const colors = {
  primary: '#0B6E4F', // sea green — nods to the sailor/marketplace theme
  primaryDark: '#084C37',
  background: '#F7F8FA',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  danger: '#DC2626',
  success: '#16A34A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
};

export const typography = {
  title: 24,
  subtitle: 18,
  body: 16,
  caption: 13,
};

export const theme = { colors, spacing, radius, typography };
export type Theme = typeof theme;
