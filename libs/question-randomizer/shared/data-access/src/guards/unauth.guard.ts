import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { UserStore } from '../store';

const checkUnauth = async (): Promise<boolean> => {
  const router = inject(Router);
  const userStore = inject(UserStore);
  if (userStore.isLoading() === null) {
    await userStore.initUser();
  }

  if (userStore.isAuthenticated()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};

export const UnauthCanActivate: CanActivateFn = async (next, state) =>
  checkUnauth();

export const UnauthCanActivateChild: CanActivateChildFn = async (next, state) =>
  checkUnauth();

// @Injectable({
//   providedIn: 'root',
// })
// export class UnauthGuard implements CanActivate, CanActivateChild, CanLoad {
//   constructor(private router: Router, private store: Store) {}

//   private check(): Observable<boolean> {
//     return this.store.pipe(select(getUserState)).pipe(
//       tap((state) => {
//         if (state.isLoading === null) {
//           this.store.dispatch(initUser());
//         }
//       }),
//       filter((state) => state.isLoading === false),
//       take(1),
//       tap((state) => {
//         if (state.uid) {
//           this.router.navigate(['/']);
//         }
//       }),
//       map((state) => !state.uid)
//     );
//   }

//   canActivate(
//     next: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot
//   ):
//     | Observable<boolean | UrlTree>
//     | Promise<boolean | UrlTree>
//     | boolean
//     | UrlTree {
//     return this.check();
//   }
//   canActivateChild(
//     next: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot
//   ):
//     | Observable<boolean | UrlTree>
//     | Promise<boolean | UrlTree>
//     | boolean
//     | UrlTree {
//     return this.check();
//   }
//   canLoad(
//     route: Route,
//     segments: UrlSegment[]
//   ): Observable<boolean> | Promise<boolean> | boolean {
//     return this.check();
//   }
// }
