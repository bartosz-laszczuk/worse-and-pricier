import { CanActivateFn, CanActivateChildFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserStore } from '../store';

export const AuthVerifiedCanActivate: CanActivateFn = async (route, state) =>
  check(true);
export const AuthVerifiedCanActivateChild: CanActivateChildFn = async (
  route,
  state
) => check(true);
export const AuthCanActivate: CanActivateFn = async (route, state) => check();

async function check(verificationRequired = false): Promise<boolean> {
  const router = inject(Router);
  const userStore = inject(UserStore);

  const isLoading = userStore.isLoading();

  if (isLoading === null) {
    await userStore.initUser();
  }
  debugger;
  if (userStore.isLoading() === false) {
    const isAuthenticated = userStore.isAuthenticated();
    if (!isAuthenticated) {
      router.navigate(['auth', 'login']);
    }
    if (verificationRequired && !userStore.entity()?.emailVerified) {
      router.navigate(['auth', 'email-not-verified']);
    }
    return isAuthenticated;
  }

  return false;
}
