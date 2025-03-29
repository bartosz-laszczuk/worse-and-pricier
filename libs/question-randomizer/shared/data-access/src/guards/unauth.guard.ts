import { Injectable } from '@angular/core';
import {
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
  CanActivate,
  CanActivateChild,
  CanLoad,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';

import { Store, select } from '@ngrx/store';
import { getUserState } from '../../../auth/_store/user/user.selectors';
import { initUser } from '../../../auth/_store/user/user.actions';

@Injectable({
  providedIn: 'root',
})
export class UnauthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private router: Router, private store: Store) {}

  private check(): Observable<boolean> {
    return this.store.pipe(select(getUserState)).pipe(
      tap((state) => {
        if (state.isLoading === null) {
          this.store.dispatch(initUser());
        }
      }),
      filter((state) => state.isLoading === false),
      take(1),
      tap((state) => {
        if (state.uid) {
          this.router.navigate(['/']);
        }
      }),
      map((state) => !state.uid)
    );
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.check();
  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.check();
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.check();
  }
}
