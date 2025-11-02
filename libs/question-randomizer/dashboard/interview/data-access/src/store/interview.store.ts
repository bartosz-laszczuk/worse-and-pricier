import { computed } from '@angular/core';
import {
  filterByTextUsingORLogic,
  filterEntities,
  paginateEntities,
  Question,
  sortEntities,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  Filters,
  PageParameters,
  SortDefinition,
} from '@worse-and-pricier/design-system-ui';

type InterviewState = {
  entities: Record<string, Question> | null;
  ids: string[] | null;
  sort: SortDefinition<Question>;
  page: PageParameters;
  filters: Filters<Question>;
  searchText: string;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: InterviewState = {
  entities: null,
  ids: null,
  filters: {},
  sort: { field: 'question', direction: 'asc' },
  page: { index: 0, size: 10 },
  searchText: '',
  isLoading: null,
  error: null,
};

export const InterviewStore = signalStore(
  withState(initialState),
  withComputed((store) => {
    const filteredQuestions = computed(() => {
      const entities = store.entities();
      const ids = store.ids();

      if (!entities || !ids) return [];

      const questions = ids.map((id) => entities[id]);

      const searched = filterByTextUsingORLogic(
        questions,
        ['question', 'answer', 'answerPl', 'tags'],
        store.searchText()
      );

      return filterEntities(searched, store.filters());
    });

    const sortedQuestions = computed(() =>
      sortEntities(filteredQuestions(), store.sort())
    );

    const pagedQuestions = computed(() =>
      paginateEntities(sortedQuestions(), store.page())
    );

    return {
      displayQuestions: pagedQuestions,
      filteredCount: computed(() => filteredQuestions().length),
    };
  }),

  withMethods((store) => ({
    loadQuestionDic(questionDic: Record<string, Question>) {
      patchState(store, {
        entities: { ...questionDic },
        ids: [...Object.keys(questionDic)],
        isLoading: false,
        error: null,
      });
    },

    setFilter(parameter: keyof Question, value: string) {
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

    setSort(sort: SortDefinition<Question>) {
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
