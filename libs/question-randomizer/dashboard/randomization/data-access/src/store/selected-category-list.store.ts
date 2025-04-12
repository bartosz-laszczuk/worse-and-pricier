import { effect, inject } from '@angular/core';
import {
  getState,
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { SelectedCategory } from '@my-nx-monorepo/question-randomizer-dashboard-randomization-util';
import { serverTimestamp } from '@angular/fire/firestore';
import { SelectedCategoryListService } from '../services';

type SelectedCategoryListState = {
  entities: Record<string, SelectedCategory> | null;
  ids: string[] | null;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: SelectedCategoryListState = {
  entities: null,
  ids: null,
  isLoading: null,
  error: null,
};

export const SelectedCategoryListStore = signalStore(
  withState(initialState),

  withHooks({
    onInit(store) {
      effect(() => {
        const state = getState(store);
        console.log('Normalized SelectedCategoryList state:', state);
      });
    },
  }),

  withMethods(
    (
      store,
      selectedCategoryListService = inject(SelectedCategoryListService)
    ) => ({
      async addCategoryToSelectedCategories(
        categoryId: string,
        randomizationId: string
      ) {
        patchState(store, { isLoading: true, error: null });

        try {
          const newSelectedCategory =
            await selectedCategoryListService.addCategoryToSelectedCategories({
              categoryId,
              randomizationId,
              created: serverTimestamp(),
            });

          patchState(store, (state) => ({
            entities: {
              ...(state.entities ?? {}),
              [newSelectedCategory.id]: newSelectedCategory,
            },
            ids: [...(state.ids ?? []), newSelectedCategory.id],
            isLoading: false,
            error: null,
          }));
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Failed to add selected category.',
          });
        }
      },

      async deleteCategoryFromSelectedCategories(
        categoryId: string,
        randomizationId: string
      ) {
        patchState(store, { isLoading: true, error: null });

        try {
          const entities = store.entities();
          const ids = store.ids();
          if (!entities || !ids) throw new Error('Entities not loaded.');

          const matchedEntry = Object.values(entities).find(
            (entry) =>
              entry.categoryId === categoryId &&
              entry.randomizationId === randomizationId
          );

          if (!matchedEntry) throw new Error('Selected category not found.');

          await selectedCategoryListService.deleteCategoryFromSelectedCategories(
            categoryId,
            randomizationId
          );

          const { [matchedEntry.id]: _, ...remainingEntities } = entities;

          patchState(store, {
            entities: remainingEntities,
            ids: ids.filter((id) => id !== matchedEntry.id),
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Failed to delete selected category.',
          });
        }
      },

      updateSelectedCategoryInList(
        id: string,
        data: Partial<SelectedCategory>
      ) {
        patchState(store, (state) => {
          if (!state.entities || !state.entities[id]) return state;

          return {
            entities: {
              ...state.entities,
              [id]: { ...state.entities[id], ...data },
            },
            isLoading: false,
            error: null,
          };
        });
      },

      async loadSelectedCategoryList(
        randomizationId: string,
        forceLoad = false
      ) {
        if (!forceLoad && store.entities() !== null) return;

        patchState(store, { isLoading: true, error: null });

        try {
          const list =
            await selectedCategoryListService.getSelectedCategoryList(
              randomizationId
            );

          const normalized = list.reduce(
            (acc, item) => {
              acc.entities[item.id] = item;
              acc.ids.push(item.id);
              return acc;
            },
            {
              entities: {} as Record<string, SelectedCategory>,
              ids: [] as string[],
            }
          );

          patchState(store, {
            ...normalized,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Failed to load selected categories.',
          });
        }
      },
    })
  )
);
