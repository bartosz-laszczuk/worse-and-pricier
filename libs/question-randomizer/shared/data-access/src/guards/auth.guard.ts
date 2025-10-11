import { CanActivateFn, CanActivateChildFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserStore } from '../store';
import { UserService } from '../services/user.service';

export const AuthVerifiedCanActivate: CanActivateFn = async () => {
  return check(true);
};
export const AuthVerifiedCanActivateChild: CanActivateChildFn = async () => check(true);
export const AuthCanActivate: CanActivateFn = async () => {
  return check();
};

async function check(verificationRequired = false): Promise<boolean> {
  const router = inject(Router);
  const userStore = inject(UserStore);
  const userService = inject(UserService);

  const isLoading = userStore.isLoading();

  if (isLoading === null) {
    await userService.initUser();
  }

  if (userStore.isLoading() === false) {
    const isAuthenticated = userStore.isAuthenticated();
    if (!isAuthenticated) {
      router.navigate(['/auth', 'login']);
    }
    if (verificationRequired && !userStore.isVerified()) {
      router.navigate(['/auth', 'email', 'not-verified']);
    }
    return isAuthenticated;
  }

  return false;
}
