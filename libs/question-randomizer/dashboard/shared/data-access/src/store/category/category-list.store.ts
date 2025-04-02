import { effect, inject } from '@angular/core';
import { Category } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import {
  getState,
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { CategoryService } from '../../services/category.service';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';
import { lastValueFrom } from 'rxjs';

type CategoryListState = {
  entities: Category[] | null;
  isLoading: boolean | null;
  error: string | null;
};

export const initialState: CategoryListState = {
  entities: null,
  isLoading: null,
  error: null,
};

export const CategoryListStore = signalStore(
  withState(initialState),
  withHooks({
    onInit(store) {
      effect(() => {
        // 👇 The effect is re-executed on state change.
        const state = getState(store);
        console.log('category list state', state);
      });

      // setInterval(() => store.increment(), 1_000);
    },
  }),
  withMethods(
    (
      store,
      categoryService = inject(CategoryService),
      userStore = inject(UserStore)
    ) => ({
      addCategoryToList(category: Category) {
        patchState(store, (state) => ({
          entities: state.entities ? [...state.entities, category] : [category],
          isLoading: false,
          error: null,
        }));
      },

      updateCategoryInList(categoryId: string, data: Partial<Category>) {
        patchState(store, (state) => ({
          entities: state.entities
            ? state.entities.map((category) =>
                category.id === categoryId ? { ...category, ...data } : category
              )
            : [],
          isLoading: false,
          error: null,
        }));
      },

      deleteCategoryFromList(categoryId: string) {
        patchState(store, (state) => ({
          entities: state.entities
            ? state.entities.filter((category) => category.id !== categoryId)
            : [],
          isLoading: false,
          error: null,
        }));
      },

      async loadCategoryList(forceLoad = false) {
        if (!forceLoad && !!store.entities()) return;

        patchState(store, { isLoading: true, error: null });

        try {
          const categories = await categoryService.getCategories(
            userStore.uid()!
          );
          patchState(store, {
            entities: categories,
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
