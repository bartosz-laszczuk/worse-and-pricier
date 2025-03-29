import { CanActivateFn, CanActivateChildFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserStore } from '../store';

export const AuthCanActivate: CanActivateFn = async (route, state) => check();
export const AuthCanActivateChild: CanActivateChildFn = async (route, state) =>
  check();

async function check(): Promise<boolean> {
  const router = inject(Router);
  const userStore = inject(UserStore);

  const isLoading = userStore.isLoading();

  if (isLoading === null) {
    await userStore.initUser();
  }

  const newIsLoading = userStore.isLoading();
  const newUid = userStore.uid();

  if (newIsLoading === false) {
    const isAuthenticated = !!newUid;
    if (!isAuthenticated) {
      router.navigate(['auth', 'login']);
    }
    return isAuthenticated;
  }

  return false;
}
