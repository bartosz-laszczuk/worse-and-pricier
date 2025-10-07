import { inject, Injectable } from '@angular/core';
import { Theme, ThemeService } from '@worse-and-pricier/design-system-styles';

@Injectable()
export class SettingsShellFacade {
  private readonly themeService = inject(ThemeService);

  public currentTheme = this.themeService.currentTheme;

  public changeTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }
}
