import { computed, effect, inject } from '@angular/core';
import {
  Category,
  EditQuestionFormValue,
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

type QuestionState = {
  entities: Record<string, Question> | null;
  ids: string[] | null;
  sort: SortDefinition<Question>;
  page: PageParameters;
  filters: Filters<Question>;
  searchText: string;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: QuestionState = {
  entities: null,
  ids: null,
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
        console.log('question list state', getState(store));
      });
    },
  }),

  withComputed((store) => ({
    displayQuestions: computed(() => {
      const entities = store.entities();
      const ids = store.ids();

      if (!entities || !ids) return [];

      const questions = ids.map((id) => entities[id]);

      const searched = filterByTextUsingORLogic(
        questions,
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
          entities: {
            ...(state.entities ?? {}),
            [question.id]: question,
          },
          ids: [...(state.ids ?? []), question.id],
          isLoading: false,
          error: null,
        }));
      },

      updateQuestionInList(questionId: string, data: EditQuestionFormValue) {
        patchState(store, (state) => {
          if (!state.entities || !state.entities[questionId]) return state;

          return {
            entities: {
              ...state.entities,
              [questionId]: { ...state.entities[questionId], ...data },
            },
            isLoading: false,
            error: null,
          };
        });
      },

      deleteQuestionFromList(questionId: string) {
        patchState(store, (state) => {
          if (!state.entities || !state.ids) return state;

          const { [questionId]: _, ...remainingEntities } = state.entities;

          return {
            entities: remainingEntities,
            ids: state.ids.filter((id) => id !== questionId),
            isLoading: false,
            error: null,
          };
        });
      },

      async loadQuestionList(
        categories: Record<string, Category>,
        qualifications: Record<string, Qualification>,
        forceLoad = false
      ) {
        if (!forceLoad && store.entities() !== null) return;

        patchState(store, { isLoading: true, error: null });

        try {
          const questions = (
            await questionService.getQuestions(userStore.uid()!)
          ).map((question) => ({
            ...question,
            categoryName: question.categoryId
              ? categories[question.categoryId]?.name
              : undefined,
            qualificationName: question.qualificationId
              ? qualifications[question.qualificationId]?.name
              : undefined,
          }));

          const normalized = questions.reduce(
            (acc, q) => {
              acc.entities[q.id] = q;
              acc.ids.push(q.id);
              return acc;
            },
            { entities: {} as Record<string, Question>, ids: [] as string[] }
          );

          patchState(store, {
            ...normalized,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Failed to load questions',
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
        const state = getState(store);
        const userId = userStore.uid();
        if (!state.entities || !userId) return;

        try {
          await questionService.removeCategoryIdFromQuestions(
            categoryId,
            userId
          );

          const updatedEntities = Object.entries(state.entities).reduce(
            (acc, [id, question]) => {
              acc[id] =
                question.categoryId === categoryId
                  ? { ...question, categoryId: '' }
                  : question;
              return acc;
            },
            {} as Record<string, Question>
          );

          patchState(store, { entities: updatedEntities });
        } catch (error: any) {
          patchState(store, {
            error: error.message || 'Failed to update questions',
          });
        }
      },

      async deleteQualificationIdFromQuestions(qualificationId: string) {
        const state = getState(store);
        const userId = userStore.uid();
        if (!state.entities || !userId) return;

        try {
          await questionService.removeQualificationIdFromQuestions(
            qualificationId,
            userId
          );

          const updatedEntities = Object.entries(state.entities).reduce(
            (acc, [id, question]) => {
              acc[id] =
                question.qualificationId === qualificationId
                  ? {
                      ...question,
                      qualificationId: undefined,
                      qualificationName: undefined,
                    }
                  : question;
              return acc;
            },
            {} as Record<string, Question>
          );

          patchState(store, { entities: updatedEntities });
        } catch (error: any) {
          patchState(store, {
            error: error.message || 'Failed to update questions',
          });
        }
      },
    })
  )
);
