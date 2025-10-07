import { computed } from '@angular/core';
import {
  EditQuestionFormValue,
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
} from '@worse-and-pricier/shared-util';

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

  // withHooks({
  //   onInit(store) {
  //     effect(() => {
  //       console.log('question list state', getState(store));
  //     });
  //   },
  // }),

  withComputed((store) => {
    const filteredQuestions = computed(() => {
      const entities = store.entities();
      const ids = store.ids();

      if (!entities || !ids) return [];

      const questions = ids.map((id) => entities[id]);

      const searched = filterByTextUsingORLogic(
        questions,
        ['question', 'answer', 'answerPl'],
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

    loadQuestionList(questions: Question[]) {
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
    },

    deleteCategoryIdFromQuestions(categoryId: string) {
      const updatedEntities = Object.entries(store.entities() ?? {}).reduce(
        (acc, [id, question]) => {
          acc[id] =
            question.categoryId === categoryId
              ? { ...question, categoryId: undefined, categoryName: undefined }
              : question;
          return acc;
        },
        {} as Record<string, Question>
      );

      patchState(store, { entities: updatedEntities });
    },

    async deleteQualificationIdFromQuestions(qualificationId: string) {
      const updatedEntities = Object.entries(store.entities() ?? {}).reduce(
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
