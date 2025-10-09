import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  EmailPasswordCredentials,
  User,
} from '@worse-and-pricier/question-randomizer-auth-util';
import { UserStore } from '../store';
import { AuthRepository } from '../repositories';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly userStore = inject(UserStore);
  private readonly authRepository = inject(AuthRepository);
  private readonly router = inject(Router);

  async initUser() {
    this.userStore.startLoading();

    try {
      const authUser = await this.authRepository.getAuthenticatedUser();
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
      await this.authRepository.signInEmail(credentials);
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
      const uid = await this.authRepository.signUpEmail(credentials);
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
      await this.authRepository.signOut();

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
      const entity = await this.authRepository.createUser(request);

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
      const updatedEntity = await this.authRepository.updateUser(entity);

      this.userStore.updateUser(updatedEntity);

      this.router.navigate(['/profile', updatedEntity.uid]);
    } catch (error: any) {
      console.error(error);
      // notification.error(error.message);
      this.userStore.logError(error.message || 'User update failed');
    }
  }
}
