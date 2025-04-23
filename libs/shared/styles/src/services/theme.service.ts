import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | '';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'selected-theme';
  public currentTheme = signal<Theme>('');

  constructor() {
    const savedTheme = localStorage.getItem(this.storageKey) as Theme;
    if (savedTheme) {
      this.setTheme(savedTheme);
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
    localStorage.setItem(this.storageKey, theme);
  }
}
