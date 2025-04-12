import { effect, inject } from '@angular/core';
import {
  getState,
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { UsedQuestion } from '@my-nx-monorepo/question-randomizer-dashboard-randomization-util';
import { serverTimestamp } from '@angular/fire/firestore';
import { UsedQuestionListService } from '../services';

type UsedQuestionListState = {
  entities: Record<string, UsedQuestion> | null;
  ids: string[] | null;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: UsedQuestionListState = {
  entities: null,
  ids: null,
  isLoading: null,
  error: null,
};

export const UsedQuestionListStore = signalStore(
  withState(initialState),

  withHooks({
    onInit(store) {
      effect(() => {
        const state = getState(store);
        console.log('Normalized UsedQuestionList state:', state);
      });
    },
  }),

  withMethods(
    (store, usedQuestionListService = inject(UsedQuestionListService)) => ({
      async addQuestionToUsedQuestions(
        questionId: string,
        randomizationId: string
      ) {
        patchState(store, { isLoading: true, error: null });

        try {
          const newUsedQuestion =
            await usedQuestionListService.addQuestionToUsedQuestions({
              questionId,
              randomizationId,
              created: serverTimestamp(),
            });

          patchState(store, (state) => ({
            entities: {
              ...(state.entities ?? {}),
              [newUsedQuestion.id]: newUsedQuestion,
            },
            ids: [...(state.ids ?? []), newUsedQuestion.id],
            isLoading: false,
            error: null,
          }));
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Failed to add used question.',
          });
        }
      },

      async deleteQuestionFromUsedQuestions(
        questionId: string,
        randomizationId: string
      ) {
        patchState(store, { isLoading: true, error: null });

        try {
          const state = getState(store);
          if (!state.entities || !state.ids)
            throw new Error('Entities not loaded');

          const matchedEntry = Object.values(state.entities).find(
            (uq) =>
              uq.questionId === questionId &&
              uq.randomizationId === randomizationId
          );

          if (!matchedEntry) throw new Error('Used question not found.');

          await usedQuestionListService.deleteQuestionFromUsedQuestions(
            questionId,
            randomizationId
          );

          const { [matchedEntry.id]: _, ...remainingEntities } = state.entities;

          patchState(store, {
            entities: remainingEntities,
            ids: state.ids.filter((id) => id !== matchedEntry.id),
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Failed to delete used question.',
          });
        }
      },

      updateUsedQuestionInList(id: string, data: Partial<UsedQuestion>) {
        patchState(store, (state) => {
          if (!state.entities || !state.entities[id]) return state;

          return {
            entities: {
              ...state.entities,
              [id]: { ...state.entities[id], ...data },
            },
            isLoading: false,
            error: null,
          };
        });
      },

      async loadUsedQuestionList(randomizationId: string, forceLoad = false) {
        if (!forceLoad && store.entities() !== null) return;

        patchState(store, { isLoading: true, error: null });

        try {
          const usedQuestionList =
            await usedQuestionListService.getUsedQuestionList(randomizationId);

          const normalized = usedQuestionList.reduce(
            (acc, uq) => {
              acc.entities[uq.id] = uq;
              acc.ids.push(uq.id);
              return acc;
            },
            {
              entities: {} as Record<string, UsedQuestion>,
              ids: [] as string[],
            }
          );

          patchState(store, {
            ...normalized,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Failed to load used questions.',
          });
        }
      },
    })
  )
);
