import { effect, inject } from '@angular/core';
import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import {
  getState,
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { QuestionService } from '../../services/question.service';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';

type QuestionListState = {
  entities: Question[] | null;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: QuestionListState = {
  entities: null,
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
    })
  )
);
