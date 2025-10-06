import { computed } from '@angular/core';
import {
  filterByTextUsingORLogic,
  filterEntities,
  paginateEntities,
  Qualification,
  sortEntities,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  OptionItem,
  Filters,
  PageParameters,
  SortDefinition,
} from '@my-nx-monorepo/shared-util';

type QualificationState = {
  entities: Record<string, Qualification> | null;
  ids: string[] | null;
  sort: SortDefinition<Qualification>;
  page: PageParameters;
  filters: Filters<Qualification>;
  searchText: string;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: QualificationState = {
  entities: null,
  ids: null,
  filters: {},
  sort: { field: 'name', direction: 'asc' },
  page: { index: 0, size: 10 },
  searchText: '',
  isLoading: null,
  error: null,
};

export const QualificationListStore = signalStore(
  withState(initialState),

  withComputed((store) => {
    const filteredQualifications = computed(() => {
      const entities = store.entities();
      const ids = store.ids();

      if (!entities || !ids) return [];

      const qualifications = ids.map((id) => entities[id]);

      const searched = filterByTextUsingORLogic(
        qualifications,
        ['name'],
        store.searchText()
      );

      return filterEntities(searched, store.filters());
    });

    const sortedQualifications = computed(() =>
      sortEntities(filteredQualifications(), store.sort())
    );

    const pagedQualifications = computed(() =>
      paginateEntities(sortedQualifications(), store.page())
    );

    const qualificationOptionItemList = computed(() =>
      Object.values(store.entities() ?? {}).map((qualification) => ({
        value: qualification.id,
        label: qualification.name,
      }))
    );

    return {
      displayQualifications: pagedQualifications,
      filteredCount: computed(() => filteredQualifications().length),
      qualificationOptionItemList,
    };
  }),

  withMethods((store) => ({
    addQualificationToList(qualification: Qualification) {
      patchState(store, (state) => ({
        entities: {
          ...(state.entities ?? {}),
          [qualification.id]: qualification,
        },
        ids: [...(state.ids ?? []), qualification.id],
        isLoading: false,
        error: null,
      }));
    },

    updateQualificationInList(
      qualificationId: string,
      data: Partial<Qualification>
    ) {
      patchState(store, (state) => {
        if (!state.entities || !state.entities[qualificationId]) return state;

        return {
          entities: {
            ...state.entities,
            [qualificationId]: {
              ...state.entities[qualificationId],
              ...data,
            },
          },
          isLoading: false,
          error: null,
        };
      });
    },

    deleteQualificationFromList(qualificationId: string) {
      patchState(store, (state) => {
        if (!state.entities || !state.ids) return state;

        const { [qualificationId]: _, ...remainingEntities } = state.entities;

        return {
          entities: remainingEntities,
          ids: state.ids.filter((id) => id !== qualificationId),
          isLoading: false,
          error: null,
        };
      });
    },

    addQualificationListToStoreList(qualificationList: Qualification[]) {
      patchState(store, (state) => {
        const newEntities = qualificationList.reduce(
          (acc, qualification) => {
            acc[qualification.id] = qualification;
            return acc;
          },
          { ...(state.entities ?? {}) } as Record<string, Qualification>
        );

        const newIds = [
          ...(state.ids ?? []),
          ...qualificationList.map((qualification) => qualification.id),
        ];

        return {
          entities: newEntities,
          ids: newIds,
          isLoading: false,
          error: null,
        };
      });
    },

    loadQualificationList(qualifications: Qualification[]) {
      const normalized = qualifications.reduce(
        (acc, q) => {
          acc.entities[q.id] = q;
          acc.ids.push(q.id);
          return acc;
        },
        {
          entities: {} as Record<string, Qualification>,
          ids: [] as string[],
        }
      );

      patchState(store, {
        ...normalized,
        isLoading: false,
        error: null,
      });
    },

    setFilter(parameter: keyof Qualification, value: string) {
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

    setSort(sort: SortDefinition<Qualification>) {
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
