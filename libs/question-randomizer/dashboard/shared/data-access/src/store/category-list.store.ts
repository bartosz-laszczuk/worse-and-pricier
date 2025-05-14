import { computed } from '@angular/core';
import {
  Category,
  filterByTextUsingORLogic,
  filterEntities,
  paginateEntities,
  sortEntities,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import {
  Filters,
  PageParameters,
  SortDefinition,
} from '@my-nx-monorepo/shared-ui';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

type NormalizedCategoryState = {
  entities: Record<string, Category> | null;
  ids: string[] | null;
  sort: SortDefinition<Category>;
  page: PageParameters;
  filters: Filters<Category>;
  searchText: string;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: NormalizedCategoryState = {
  entities: null,
  ids: null,
  filters: {},
  sort: { field: 'name', direction: 'asc' },
  page: { index: 0, size: 10 },
  searchText: '',
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
  withComputed((store) => {
    const filteredCategories = computed(() => {
      const entities = store.entities();
      const ids = store.ids();

      if (!entities || !ids) return [];

      const categories = ids.map((id) => entities[id]);

      const searched = filterByTextUsingORLogic(
        categories,
        ['name'],
        store.searchText()
      );

      return filterEntities(searched, store.filters());
    });

    const sortedCategories = computed(() =>
      sortEntities(filteredCategories(), store.sort())
    );

    const pagedCategories = computed(() =>
      paginateEntities(sortedCategories(), store.page())
    );

    const categoryOptionItemList = computed(() =>
      Object.values(store.entities() ?? {}).map((category) => ({
        value: category.id,
        label: category.name,
      }))
    );

    return {
      displayCategories: pagedCategories,
      filteredCount: computed(() => filteredCategories().length),
      categoryOptionItemList,
    };
  }),

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

    setFilter(parameter: keyof Category, value: string) {
      patchState(store, (state) => ({
        filters: {
          ...state.filters,
          [parameter]: value,
        },
        page: {
          ...state.page,
          index: 0,
        },
      }));
    },

    setSort(sort: SortDefinition<Category>) {
      patchState(store, (state) => ({
        ...state,
        sort,
      }));
    },

    setPage(page: PageParameters) {
      patchState(store, (state) => ({
        ...state,
        page,
      }));
    },

    setSearchText(searchText: string) {
      patchState(store, (state) => ({
        ...state,
        searchText,
        page: {
          ...state.page,
          index: 0,
        },
      }));
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
