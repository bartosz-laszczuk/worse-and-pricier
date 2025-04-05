import { computed, effect, inject } from '@angular/core';
import {
  Category,
  filterByTextUsingORLogic,
  filterSortPageEntities,
  Qualification,
  Question,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
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
  searchText: string;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: QuestionListState = {
  entities: null,
  filters: {},
  sort: { field: 'question', direction: 'asc' },
  page: { index: 0, size: 10 },
  searchText: '',
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
    },
  }),
  withComputed((store) => ({
    displayQuestions: computed(() => {
      const entities = store.entities();
      if (!entities) return [];

      const searched = filterByTextUsingORLogic(
        entities,
        ['question', 'answer', 'answerPl'],
        store.searchText()
      );

      return filterSortPageEntities<Question>(
        searched,
        store.filters(),
        store.sort(),
        store.page()
      );
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

      async loadQuestionList(
        categories: Category[],
        qualifications: Qualification[],
        forceLoad = false
      ) {
        if (!forceLoad && !!store.entities()) return;

        patchState(store, { isLoading: true, error: null });

        try {
          const questions = (
            await questionService.getQuestions(userStore.uid()!)
          ).map((question) => ({
            ...question,
            category:
              categories.find((category) => category.id === question.categoryId)
                ?.name ?? '',
            qualification: qualifications.find(
              (qualification) => qualification.id === question.qualificationId
            )?.name,
          }));

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
        }));
      },

      async deleteCategoryIdFromQuestions(categoryId: string) {
        const entities = store.entities();
        const userId = userStore.uid();
        if (!entities || !userId) return;

        try {
          await questionService.removeCategoryIdFromQuestions(
            categoryId,
            userId
          );
          patchState(store, {
            entities: entities.map((question) =>
              question.categoryId === categoryId
                ? { ...question, categoryId: '', category: '' }
                : question
            ),
          });
        } catch (error: any) {
          patchState(store, {
            error: error.message || 'Failed to update questions',
          });
        }
      },

      async deleteQualificationIdFromQuestions(qualificationId: string) {
        const entities = store.entities();
        const userId = userStore.uid();
        if (!entities || !userId) return;

        try {
          await questionService.removeQualificationIdFromQuestions(
            qualificationId,
            userId
          );
          patchState(store, {
            entities: entities.map((question) =>
              question.qualificationId === qualificationId
                ? {
                    ...question,
                    qualificationId: undefined,
                    qualification: undefined,
                  }
                : question
            ),
          });
        } catch (error: any) {
          patchState(store, {
            error: error.message || 'Failed to update questions',
          });
        }
      },
    })
  )
);
