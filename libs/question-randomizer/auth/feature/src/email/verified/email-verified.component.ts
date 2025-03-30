import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';

@Component({
  imports: [CommonModule, RouterModule],
  templateUrl: './email-verified.component.html',
  styleUrl: './email-verified.component.scss',
})
export class EmailVerifiedComponent {
  private readonly router = inject(Router);
  private readonly userStore = inject(UserStore);

  constructor() {
    if (!this.userStore.entity()) this.userStore.createUser();
    else this.navigateToDashboard();
  }

  public navigateToDashboard() {
    this.router.navigate(['/dashboard', 'randomization']);
  }
}
