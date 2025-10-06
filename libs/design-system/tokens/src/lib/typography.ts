/**
 * Design System Typography Tokens
 * Provides programmatic access to typography values
 */

export const typography = {
  fontFamily: {
    base: "'Figtree', sans-serif",
    headers: "'Open Sans', sans-serif",
  },
  fontWeight: {
    normal: 500,
  },
  lineHeight: {
    normal: 'normal',
  },
  fontSize: {
    base: '1rem',
  },
} as const;

export type TypographyToken = typeof typography;
