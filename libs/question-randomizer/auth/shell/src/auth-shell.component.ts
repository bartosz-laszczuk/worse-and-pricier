import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'lib-auth-shell',
  imports: [RouterModule],
  templateUrl: './auth-shell.component.html',
  styleUrl: './auth-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthShellComponent {}
