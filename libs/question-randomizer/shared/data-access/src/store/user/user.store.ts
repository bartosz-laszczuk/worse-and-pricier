import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { AuthenticatedUserResponse, User } from '../../models/user.models';
import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthRepository } from '../../repositories/auth.repository';

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
    (store, router = inject(Router), authRepository = inject(AuthRepository)) => ({
      initUser(authUser: AuthenticatedUserResponse | null) {
        patchState(store, { isLoading: true, error: null });

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
      },

      signOut() {
        patchState(store, {
          entity: null,
          uid: null,
          verified: null,
          isLoading: false,
          error: null,
        });
      },

      async signUpEmail(uid: string) {
        patchState(store, { uid, isLoading: false, error: null });
      },

      createUser(entity: User) {
        patchState(store, {
          entity,
          uid: entity.uid,
          isLoading: false,
          error: null,
        });
      },

      updateUser(updatedEntity: User) {
        patchState(store, {
          entity: updatedEntity,
          isLoading: false,
          error: null,
        });
      },

      startLoading() {
        patchState(store, { isLoading: true, error: null });
      },

      logError(error: string) {
        patchState(store, {
          isLoading: false,
          error,
        });
      },
    })
  )
);
