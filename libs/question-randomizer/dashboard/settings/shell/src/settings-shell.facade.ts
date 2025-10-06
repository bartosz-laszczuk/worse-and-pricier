import { inject, Injectable } from '@angular/core';
import { Theme, ThemeService } from '@my-nx-monorepo/design-system-styles';

@Injectable()
export class SettingsShellFacade {
  private readonly themeService = inject(ThemeService);

  public currentTheme = this.themeService.currentTheme;

  public changeTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }
}
