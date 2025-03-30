import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { User } from '../../models/user.models';
import { EmailPasswordCredentials } from '@my-nx-monorepo/question-randomizer-auth-util';
import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type UserState = {
  entity: User | null;
  uid: string | null;
  verified: boolean | null;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: UserState = {
  entity: null,
  uid: null,
  verified: null,
  isLoading: null,
  error: null,
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.uid()),
    isVerified: computed(() => !!store.verified()),
  })),
  withMethods(
    (store, router = inject(Router), authService = inject(AuthService)) => ({
      async initUser() {
        patchState(store, { isLoading: true, error: null });

        try {
          const authUser = await authService.getAuthenticatedUser();
          console.log('initUser() authUser:', authUser);
          if (authUser) {
            patchState(store, {
              entity: authUser.entity,
              uid: authUser.uid,
              verified: authUser.verified,
              isLoading: false,
              error: null,
            });
          } else {
            patchState(store, {
              entity: null,
              uid: null,
              verified: null,
              isLoading: false,
              error: null,
            });
          }
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'User initialization failed',
          });
        }
      },

      async signInEmail(credentials: EmailPasswordCredentials) {
        patchState(store, { isLoading: true, error: null });

        try {
          await authService.signInEmail(credentials);
          await this.initUser();
          // const uid = store.uid();
          // const user = store.entity();

          // const user = await authService.getAuthenticatedUser();

          // patchState(store, {
          //   entity: user || null,
          //   uid: uid || null,
          //   isLoading: false,
          //   error: null,
          // });

          router.navigate(['/dashboard/randomization']);
        } catch (error: any) {
          console.error(error);
          // notification.error(error.message);
          patchState(store, {
            isLoading: false,
            error: error.message || 'Login failed',
          });
        }
      },

      async signUpEmail(credentials: EmailPasswordCredentials) {
        patchState(store, { isLoading: true, error: null });

        try {
          const uid = await authService.signUpEmail(credentials);

          patchState(store, { uid, isLoading: false, error: null });

          router.navigate(['/auth', 'email', 'verify']);
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Sign-up failed',
          });
        }
      },

      async signOut() {
        patchState(store, { isLoading: true, error: null });

        try {
          await authService.signOut();

          patchState(store, {
            entity: null,
            uid: null,
            isLoading: false,
            error: null,
          });

          router.navigate(['/auth', 'login']);
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Sign-out failed',
          });
        }
      },

      async createUser(request: Partial<User> = {}) {
        patchState(store, { isLoading: true, error: null });

        try {
          const entity = await authService.createUser(request);

          patchState(store, {
            entity,
            uid: entity.uid,
            isLoading: false,
            error: null,
          });

          router.navigate(['/profile', entity.uid]);
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'User creation failed',
          });
        }
      },

      async updateUser(entity: User) {
        patchState(store, { isLoading: true, error: null });

        try {
          const updatedEntity = await authService.updateUser(entity);

          patchState(store, {
            entity: updatedEntity,
            isLoading: false,
            error: null,
          });

          router.navigate(['/profile', updatedEntity.uid]);
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'User update failed',
          });
        }
      },
    })
  )
);
