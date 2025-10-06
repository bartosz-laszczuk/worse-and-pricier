export const ButtonTypes = ['default', 'dark', 'light', 'icon'] as const;
export type ButtonType = (typeof ButtonTypes)[number];
