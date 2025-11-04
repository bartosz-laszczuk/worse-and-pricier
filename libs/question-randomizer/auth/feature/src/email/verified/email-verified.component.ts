import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import {
  UserService,
  UserStore,
} from '@worse-and-pricier/question-randomizer-shared-data-access';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'lib-email-verified',
  imports: [RouterModule, TranslocoModule],
  templateUrl: './email-verified.component.html',
  styleUrl: './email-verified.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailVerifiedComponent {
  private readonly router = inject(Router);
  private readonly userStore = inject(UserStore);
  private readonly userService = inject(UserService);

  constructor() {
    if (!this.userStore.entity()) this.userService.createUser();
    else this.navigateToDashboard();
  }

  public navigateToDashboard() {
    this.router.navigate(['/dashboard', 'randomization']);
  }
}
