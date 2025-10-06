/**
 * Design System Color Tokens
 * Provides programmatic access to color values
 */

export const colors = {
  // Base Palette
  primary: '#eddf64',
  secondary: '#2d2b2e',

  // Semantic Colors
  success: '#b9e14c',
  warning: '#eddf64',
  danger: '#be5715',

  // UI Colors
  background: '#e8e8e8',
  border: '#c2c2c0',
  text: '#2d2b2e',
  bar: '#222',
  mutedText: '#777',

  // Grayscale
  white: '#ffffff',
  black: '#000000',

  gray: {
    100: '#fcfdf8', // card background
    200: '#f2f2f2', // dashboard background, table headers
    300: '#e3e3e1', // sidebar background, table header background
    400: '#cececc', // vertical bar, unselected sidebar icons
    500: '#b1b1af', // divider
    600: '#bebebe',
    700: '#acadaa', // sidebar icons
    800: '#5b5b59', // sidebar text
    900: '#6c6a6b',
  },
} as const;

export type ColorToken = typeof colors;
