export const ButtonTypes = ['default', 'dark', 'light', 'transparent'] as const;
export type ButtonType = (typeof ButtonTypes)[number];
