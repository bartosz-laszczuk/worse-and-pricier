import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  EmailPasswordCredentials,
  User,
} from '@worse-and-pricier/question-randomizer-auth-util';
import { UserStore } from '../store';
import { AuthService } from '../repositories';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly userStore = inject(UserStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async initUser() {
    this.userStore.startLoading();

    try {
      const authUser = await this.authService.getAuthenticatedUser();
      this.userStore.initUser(authUser);
    } catch (error: any) {
      console.error(error);
      // notification.error(error.message);
      this.userStore.logError(error.message || 'User initialization failed');
    }
  }

  public async signInEmail(credentials: EmailPasswordCredentials) {
    this.userStore.startLoading();

    try {
      await this.authService.signInEmail(credentials);
      await this.initUser();

      this.router.navigate(['/dashboard/randomization']);
    } catch (error: any) {
      console.error(error);
      // notification.error(error.message);
      this.userStore.logError(error.message || 'Sign-in failed');
    }
  }

  public async signUpEmail(credentials: EmailPasswordCredentials) {
    this.userStore.startLoading();

    try {
      const uid = await this.authService.signUpEmail(credentials);
      this.userStore.signUpEmail(uid);

      this.router.navigate(['/auth', 'email', 'verify']);
    } catch (error: any) {
      console.error(error);
      // notification.error(error.message);
      this.userStore.logError(error.message || 'Sign-up failed');
    }
  }

  public async signOut() {
    this.userStore.startLoading();

    try {
      await this.authService.signOut();

      this.userStore.signOut();

      this.router.navigate(['/auth', 'login']);
    } catch (error: any) {
      console.error(error);
      // notification.error(error.message);
      this.userStore.logError(error.message || 'Sign-out failed');
    }
  }

  public async createUser(request: Partial<User> = {}) {
    this.userStore.startLoading();

    try {
      const entity = await this.authService.createUser(request);

      this.userStore.createUser(entity);

      this.router.navigate(['/profile', entity.uid]);
    } catch (error: any) {
      console.error(error);
      // notification.error(error.message);
      this.userStore.logError(error.message || 'User creation failed');
    }
  }

  async updateUser(entity: User) {
    this.userStore.startLoading();

    try {
      const updatedEntity = await this.authService.updateUser(entity);

      this.userStore.updateUser(updatedEntity);

      this.router.navigate(['/profile', updatedEntity.uid]);
    } catch (error: any) {
      console.error(error);
      // notification.error(error.message);
      this.userStore.logError(error.message || 'User update failed');
    }
  }
}
