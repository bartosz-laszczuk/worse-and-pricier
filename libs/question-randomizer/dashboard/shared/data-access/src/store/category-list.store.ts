import { computed, effect } from '@angular/core';
import { Category } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import {
  getState,
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

type NormalizedCategoryState = {
  entities: Record<string, Category> | null;
  ids: string[] | null;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: NormalizedCategoryState = {
  entities: null,
  ids: null,
  isLoading: null,
  error: null,
};

export const CategoryListStore = signalStore(
  withState(initialState),

  // withHooks({
  //   onInit(store) {
  //     effect(() => {
  //       console.log('category list state', getState(store));
  //     });
  //   },
  // }),

  withComputed((store) => ({
    categoryList: computed(() => {
      const categoryDitionary = store.entities();
      return categoryDitionary ? Object.values(categoryDitionary) : undefined;
    }),
    categoryOptionItemList: computed(() =>
      Object.values(store.entities() ?? {}).map((category) => ({
        value: category.id,
        label: category.name,
      }))
    ),
  })),

  withMethods((store) => ({
    addCategoryToList(category: Category) {
      patchState(store, (state) => ({
        entities: {
          ...(state.entities ?? {}),
          [category.id]: category,
        },
        ids: [...(state.ids ?? []), category.id],
        isLoading: false,
        error: null,
      }));
    },

    addCategoryListToStoreList(categoryList: Category[]) {
      patchState(store, (state) => {
        const newEntities = categoryList.reduce(
          (acc, category) => {
            acc[category.id] = category;
            return acc;
          },
          { ...(state.entities ?? {}) } as Record<string, Category>
        );

        const newIds = [
          ...(state.ids ?? []),
          ...categoryList.map((category) => category.id),
        ];

        return {
          entities: newEntities,
          ids: newIds,
          isLoading: false,
          error: null,
        };
      });
    },

    updateCategoryInList(categoryId: string, data: Partial<Category>) {
      patchState(store, (state) => {
        if (!state.entities || !state.entities[categoryId]) return state;

        return {
          entities: {
            ...state.entities,
            [categoryId]: {
              ...state.entities[categoryId],
              ...data,
            },
          },
          isLoading: false,
          error: null,
        };
      });
    },

    deleteCategoryFromList(categoryId: string) {
      patchState(store, (state) => {
        if (!state.entities || !state.ids) return state;

        const { [categoryId]: _, ...remainingEntities } = state.entities;

        return {
          entities: remainingEntities,
          ids: state.ids.filter((id) => id !== categoryId),
          isLoading: false,
          error: null,
        };
      });
    },

    async loadCategoryList(categories: Category[]) {
      const normalized = categories.reduce(
        (acc, category) => {
          acc.entities[category.id] = category;
          acc.ids.push(category.id);
          return acc;
        },
        { entities: {} as Record<string, Category>, ids: [] as string[] }
      );

      patchState(store, {
        ...normalized,
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
