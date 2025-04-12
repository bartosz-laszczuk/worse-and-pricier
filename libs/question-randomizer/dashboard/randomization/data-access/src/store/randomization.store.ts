import { effect, inject } from '@angular/core';
import { Qualification } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import {
  getState,
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';
import { Randomization } from '@my-nx-monorepo/question-randomizer-dashboard-randomization-util';

type RandomizationState = {
  entity: Randomization | null;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: RandomizationState = {
  entity: null,
  isLoading: null,
  error: null,
};

export const RandomizationStore = signalStore(
  withState(initialState),
  withHooks({
    onInit(store) {
      effect(() => {
        // 👇 The effect is re-executed on state change.
        const state = getState(store);
        console.log('qualification list state', state);
      });
    },
  }),
  withMethods(
    (
      store,
      qualificationService = inject(QualificationService),
      userStore = inject(UserStore)
    ) => ({
      addQualificationToList(qualification: Qualification) {
        patchState(store, (state) => ({
          entities: state.entities
            ? [...state.entities, qualification]
            : [qualification],
          isLoading: false,
          error: null,
        }));
      },

      updateQualificationInList(
        qualificationId: string,
        data: Partial<Qualification>
      ) {
        patchState(store, (state) => ({
          entities: state.entities
            ? state.entities.map((qualification) =>
                qualification.id === qualificationId
                  ? { ...qualification, ...data }
                  : qualification
              )
            : [],
          isLoading: false,
          error: null,
        }));
      },

      deleteQualificationFromList(qualificationId: string) {
        patchState(store, (state) => ({
          entities: state.entities
            ? state.entities.filter(
                (qualification) => qualification.id !== qualificationId
              )
            : [],
          isLoading: false,
          error: null,
        }));
      },

      async loadQualificationList(forceLoad = false) {
        if (!forceLoad && !!store.entities()) return;

        patchState(store, { isLoading: true, error: null });

        try {
          const qualifications = await qualificationService.getQualifications(
            userStore.uid()!
          );
          patchState(store, {
            entities: qualifications,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'User initialization failed',
          });
        }
      },
    })
  )
);
