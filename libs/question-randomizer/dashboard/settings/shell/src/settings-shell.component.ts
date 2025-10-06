import { Component, inject } from '@angular/core';

import {
  ButtonToggleComponent,
  ButtonToggleGroupComponent,
} from '@my-nx-monorepo/shared-ui';
import { Theme } from '@my-nx-monorepo/shared-styles';
import { SettingsShellFacade } from './settings-shell.facade';

@Component({
  selector: 'lib-settings-shell',
  imports: [ButtonToggleComponent, ButtonToggleGroupComponent],
  templateUrl: './settings-shell.component.html',
  styleUrl: './settings-shell.component.scss',
  providers: [SettingsShellFacade],
})
export class SettingsShellComponent {
  private readonly settingsShellFacade = inject(SettingsShellFacade);

  public currentTheme = this.settingsShellFacade.currentTheme;

  public onChangeTheme(theme: Theme) {
    this.settingsShellFacade.changeTheme(theme);
  }
}
