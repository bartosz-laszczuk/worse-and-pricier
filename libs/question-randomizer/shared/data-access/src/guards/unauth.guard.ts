import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { UserStore } from '../store';
import { UserService } from '../services/user.service';

const checkUnauth = async (): Promise<boolean> => {
  const router = inject(Router);
  const userStore = inject(UserStore);
  const userService = inject(UserService);

  if (userStore.isLoading() === null) {
    await userService.initUser();
  }

  if (userStore.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

export const UnauthCanActivate: CanActivateFn = async () =>
  checkUnauth();

export const UnauthCanActivateChild: CanActivateChildFn = async () =>
  checkUnauth();
