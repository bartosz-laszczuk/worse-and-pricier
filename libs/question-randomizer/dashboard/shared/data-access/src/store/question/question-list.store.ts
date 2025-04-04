import { computed, effect, inject } from '@angular/core';
import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import {
  getState,
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { QuestionService } from '../../services/question.service';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';
import {
  Filters,
  PageParameters,
  SortDefinition,
} from '@my-nx-monorepo/shared-ui';

type QuestionListState = {
  entities: Question[] | null;
  sort: SortDefinition<Question>;
  page: PageParameters;
  filters: Filters<Question>;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: QuestionListState = {
  entities: null,
  filters: {},
  sort: { field: 'question', direction: 'asc' },
  page: { index: 0, size: 10 },
  isLoading: null,
  error: null,
};

export const QuestionListStore = signalStore(
  withState(initialState),
  withHooks({
    onInit(store) {
      effect(() => {
        // 👇 The effect is re-executed on state change.
        const state = getState(store);
        console.log('question list state', state);
      });

      // setInterval(() => store.increment(), 1_000);
    },
  }),
  withComputed((store) => ({
    displayQuestions: computed(() => {
      const entities = store.entities();
      const filters = store.filters();
      const sort = store.sort();
      const page = store.page();

      if (!entities) return [];

      // 1. Filter
      const filtered = entities.filter((q) =>
        Object.entries(filters).every(([key, value]) =>
          value
            ? String((q as any)[key])
                .toLowerCase()
                .includes(value.toLowerCase())
            : true
        )
      );

      // 2. Sort
      if (sort.direction) {
        filtered.sort((a, b) => {
          const aValue = a[sort.field];
          const bValue = b[sort.field];

          if (aValue === bValue) return 0;
          if (aValue == null) return sort.direction === 'asc' ? -1 : 1;
          if (bValue == null) return sort.direction === 'asc' ? 1 : -1;

          return sort.direction === 'asc'
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
        });
      }

      // 3. Pagination
      const start = page.index * page.size;
      const end = start + page.size;

      return filtered.slice(start, end);
    }),
  })),
  withMethods(
    (
      store,
      questionService = inject(QuestionService),
      userStore = inject(UserStore)
    ) => ({
      addQuestionToList(question: Question) {
        patchState(store, (state) => ({
          entities: state.entities ? [...state.entities, question] : [question],
          isLoading: false,
          error: null,
        }));
      },

      updateQuestionInList(questionId: string, data: Partial<Question>) {
        patchState(store, (state) => ({
          entities: state.entities
            ? state.entities.map((question) =>
                question.id === questionId ? { ...question, ...data } : question
              )
            : [],
          isLoading: false,
          error: null,
        }));
      },

      deleteQuestionFromList(questionId: string) {
        patchState(store, (state) => ({
          entities: state.entities
            ? state.entities.filter((question) => question.id !== questionId)
            : [],
          isLoading: false,
          error: null,
        }));
      },

      async loadQuestionList(forceLoad = false) {
        if (!forceLoad && !!store.entities()) return;

        patchState(store, { isLoading: true, error: null });

        try {
          const questions = await questionService.getQuestions(
            userStore.uid()!
          );
          patchState(store, {
            entities: questions,
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

      setFilter(parameter: keyof Question, value: string) {
        patchState(store, (state) => ({
          filters: {
            ...state.filters,
            [parameter]: value,
          },
          pageSettings: {
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
    })
  )
);
