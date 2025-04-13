import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  UserService,
  UserStore,
} from '@my-nx-monorepo/question-randomizer-shared-data-access';

@Component({
  selector: 'lib-email-verified',
  imports: [CommonModule, RouterModule],
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
