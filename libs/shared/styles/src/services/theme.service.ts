import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

export type Theme = 'light-theme' | 'dark-theme' | '';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme: Theme;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.currentTheme = ''; // default theme (no class)
  }

  setTheme(theme: Theme): void {
    const body = document.body;

    if (this.currentTheme) {
      this.renderer.removeClass(body, this.currentTheme);
    }

    if (theme) {
      this.renderer.addClass(body, theme);
    }

    this.currentTheme = theme;
  }

  toggleTheme(): void {
    if (this.currentTheme === 'dark-theme') {
      this.setTheme('light-theme');
    } else {
      this.setTheme('dark-theme');
    }
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }
}
