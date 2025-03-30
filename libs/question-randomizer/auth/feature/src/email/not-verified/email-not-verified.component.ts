import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';
import { Router } from '@angular/router';

@Component({
  imports: [CommonModule],
  templateUrl: './email-not-verified.component.html',
  styleUrl: './email-not-verified.component.scss',
})
export class EmailNotVerifiedComponent {
  private readonly userStore = inject(UserStore);
  private readonly router = inject(Router);

  constructor() {
    if (this.userStore.verified()) this.navigateToDashboard();
  }

  public navigateToDashboard() {
    this.router.navigate(['/dashboard', 'randomization']);
  }

  public onSignOut() {
    this.userStore.signOut();
  }
}
