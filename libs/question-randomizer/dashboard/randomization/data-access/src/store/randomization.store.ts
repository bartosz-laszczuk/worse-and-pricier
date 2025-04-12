// import { effect, inject } from '@angular/core';
// import {
//   getState,
//   patchState,
//   signalStore,
//   withHooks,
//   withMethods,
//   withState,
// } from '@ngrx/signals';
// import {
//   Randomization,
//   RandomizationStatus,
// } from '@my-nx-monorepo/question-randomizer-dashboard-randomization-util';
// import { RandomizationService } from '../services';
// import { serverTimestamp } from '@angular/fire/firestore';
// import { GetRandomizationResponse } from '../models';
// import { QuestionListStore } from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
// import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';

// type RandomizationState = {
//   entity: Randomization | null;
//   isLoading: boolean | null;
//   error: string | null;
// };

// const initialState: RandomizationState = {
//   entity: null,
//   isLoading: null,
//   error: null,
// };

// export const RandomizationStore = signalStore(
//   withState(initialState),
//   withHooks({
//     onInit(store) {
//       effect(() => {
//         // 👇 The effect is re-executed on state change.
//         const state = getState(store);
//         console.log('qualification list state', state);
//       });
//     },
//   }),
//   withMethods((store, randomizationService = inject(RandomizationService)) => ({
//     async loadRandomization(
//       userId: string,
//       questionList: Question[],
//       forceLoad = false
//     ) {
//       if (!forceLoad && store.entity() !== null) return;

//       patchState(store, { isLoading: true, error: null });

//       try {
//         let randomization: Randomization | undefined = undefined;

//         const response: GetRandomizationResponse =
//           await randomizationService.getRandomization(userId);

//         if (!response) {
//           this.createRandomization(userId);
//           return;
//         }

//         randomization = {
//           id: response.id,
//           created: response.created,
//           isAnswerHidden: response.isAnswerHidden,
//           status: response.status,
//         };

//         if (response.currentQuestionId) {
//           randomization.currentQuestion = questionList.find(
//             (question) => question.id === response.currentQuestionId
//           );
//         }

//         patchState(store, {
//           entity: randomization,
//           isLoading: false,
//           error: null,
//         });
//       } catch (error: any) {
//         patchState(store, {
//           isLoading: false,
//           error: error.message || 'Failed to [proper message].',
//         });
//       }
//     },

//     async createRandomization(userId: string) {},
//   }))
// );
