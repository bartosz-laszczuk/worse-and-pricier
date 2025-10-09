import { DOCUMENT, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Available theme options */
export type Theme = 'light' | 'dark' | '';

/**
 * Service for managing application theme (light/dark mode).
 * Persists theme selection to localStorage and applies theme CSS class to body element.
 * SSR-safe with platform checks for browser-only APIs.
 *
 * @example
 * ```typescript
 * constructor(private themeService: ThemeService) {}
 *
 * switchTheme() {
 *   const newTheme = this.themeService.currentTheme() === 'dark' ? 'light' : 'dark';
 *   this.themeService.setTheme(newTheme);
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'selected-theme';
  /** Signal containing the currently active theme */
  public currentTheme = signal<Theme>('');

  constructor() {
    // Only access localStorage in browser environment (SSR-safe)
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem(this.storageKey) as Theme;
      if (savedTheme) {
        this.setTheme(savedTheme);
      }
    }
  }

  setTheme(theme: Theme) {
    const body = this.document.body;

    if (this.currentTheme()) {
      body.classList.remove(this.currentTheme());
    }

    if (theme !== '') {
      body.classList.add(theme);
    }

    this.currentTheme.set(theme);

    // Only access localStorage in browser environment (SSR-safe)
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, theme);
    }
  }
}
