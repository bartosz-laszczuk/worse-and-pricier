import { computed, effect } from '@angular/core';
import {
  getState,
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
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
        console.log('randomization state', state);
      });
    },
  }),
  withComputed((store) => ({
    randomization: computed(() => store.entity()),
    currentQuestion: computed(() => store.entity()?.currentQuestion),
  })),
  withMethods((store) => ({
    setRandomization(randomization: Randomization) {
      patchState(store, {
        entity: { ...randomization },
        isLoading: false,
        error: null,
      });
    },

    addCategoryToRandomization(categoryId: string) {
      const entity = store.entity();

      if (!entity) return;

      const categoryList = entity.selectedCategoryIdList;

      if (categoryList.includes(categoryId)) return;

      const updatedCategoryList = [...categoryList, categoryId];

      patchState(store, {
        entity: {
          ...entity,
          selectedCategoryIdList: updatedCategoryList,
        },
        isLoading: false,
        error: null,
      });
    },

    deleteCategoryFromRandomization(categoryId: string) {
      const entity = store.entity();

      if (!entity) return;

      const updatedCategoryList = entity.selectedCategoryIdList.filter(
        (id) => id !== categoryId
      );

      patchState(store, {
        entity: {
          ...entity,
          selectedCategoryIdList: updatedCategoryList,
        },
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
  }))
);
