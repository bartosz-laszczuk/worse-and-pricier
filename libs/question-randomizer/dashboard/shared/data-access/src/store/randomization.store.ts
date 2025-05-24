import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  AvailableQuestion,
  PostponedQuestion,
  QuestionCategory,
  Randomization,
  UsedQuestion,
} from '@my-nx-monorepo/question-randomizer-dashboard-randomization-util';
import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';

type RandomizationState = {
  entity: Randomization | null;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: RandomizationState = {
  entity: null,
  isLoading: null,
  error: null,
};

function filterQuestionCategory(
  questionCategoryList: QuestionCategory[] = [],
  selectedCategoryIdList: string[] = []
) {
  return questionCategoryList.filter(
    (qc) => qc.categoryId && selectedCategoryIdList.includes(qc.categoryId)
  );
}

export const RandomizationStore = signalStore(
  withState(initialState),
  // withHooks({
  //   onInit(store) {
  //     effect(() => {
  //       // 👇 The effect is re-executed on state change.
  //       const state = getState(store);
  //       console.log('randomization state', state);
  //     });
  //   },
  // }),
  withComputed((store) => ({
    randomization: computed(() => store.entity()),
    usedQuestionList: computed(() => store.entity()?.usedQuestionList),
    filteredUsedQuestionList: computed(() => {
      const q = filterQuestionCategory(
        store.entity()?.usedQuestionList,
        store.entity()?.selectedCategoryIdList
      );
      console.log('usedQuestionList', store.entity()?.usedQuestionList);
      // console.log('filteredUsedQuestionList', q);
      return q;
    }),
    availableQuestionList: computed(
      () => store.entity()?.availableQuestionList
    ),
    filteredAvailableQuestionList: computed(() => {
      const q = filterQuestionCategory(
        store.entity()?.availableQuestionList,
        store.entity()?.selectedCategoryIdList
      );
      console.log(
        'availableQuestionList',
        store.entity()?.availableQuestionList
      );
      // console.log(
      //   'selectedCategoryIdList',
      //   store.entity()?.selectedCategoryIdList
      // );
      // console.log('filteredAvailableQuestionList', q);
      return q;
    }),
    postponedQuestionList: computed(
      () => store.entity()?.postponedQuestionList
    ),
    filteredPostponedQuestionList: computed(() => {
      const q = filterQuestionCategory(
        store.entity()?.postponedQuestionList,
        store.entity()?.selectedCategoryIdList
      );
      // console.log('filteredPostponedQuestionList', q);
      return q;
    }),
    currentQuestion: computed(() => store.entity()?.currentQuestion),
  })),
  withMethods((store) => ({
    setRandomization(randomization: Randomization) {
      patchState(store, {
        entity: { ...randomization },
        isLoading: false,
        error: null,
      });
    },

    addCategoryIdToRandomization(categoryId: string) {
      const entity = store.entity();

      if (!entity) return;

      const categoryList = entity.selectedCategoryIdList;

      if (categoryList.includes(categoryId)) return;

      const updatedCategoryList = [...categoryList, categoryId];

      patchState(store, {
        entity: {
          ...entity,
          selectedCategoryIdList: updatedCategoryList,
        },
        isLoading: false,
        error: null,
      });
    },

    addAvailableQuestionsToRandomization(
      availableQuestionList: AvailableQuestion[]
    ) {
      const entity = store.entity();

      if (!entity) return;

      const existingQuestionIds = new Set(
        entity.availableQuestionList.map((aq) => aq.questionId)
      );

      const newQuestions = availableQuestionList.filter(
        (q) => !existingQuestionIds.has(q.questionId)
      );

      if (newQuestions.length === 0) return;

      const updatedAvailableQuestionList = [
        ...entity.availableQuestionList,
        ...newQuestions,
      ];

      patchState(store, {
        entity: {
          ...entity,
          availableQuestionList: updatedAvailableQuestionList,
        },
        isLoading: false,
        error: null,
      });
    },

    addUsedQuestionToRandomization(usedQuestion: UsedQuestion) {
      const entity = store.entity();

      if (!entity) return;

      const usedQuestionList = entity.usedQuestionList;

      if (
        usedQuestionList
          .map((uq) => uq.questionId)
          .includes(usedQuestion.questionId)
      )
        return;

      const updatedUsedQuestionList = [...usedQuestionList, usedQuestion];

      patchState(store, {
        entity: {
          ...entity,
          usedQuestionList: updatedUsedQuestionList,
        },
        isLoading: false,
        error: null,
      });
    },

    updateQuestionCategoryListsCategoryId(questionCategory: QuestionCategory) {
      const entity = store.entity();

      if (!entity) return;

      const postponedQuestionList = entity.postponedQuestionList;
      const availableQuestionList = entity.availableQuestionList;
      const usedQuestionList = entity.usedQuestionList;

      const postponedQuestionWithCategory = postponedQuestionList.find(
        (pq) => pq.questionId === questionCategory.questionId
      );
      if (postponedQuestionWithCategory)
        postponedQuestionWithCategory.categoryId = questionCategory.categoryId;

      const availableQuestionWithCategory = availableQuestionList.find(
        (pq) => pq.questionId === questionCategory.questionId
      );
      if (availableQuestionWithCategory)
        availableQuestionWithCategory.categoryId = questionCategory.categoryId;

      const usedQuestionWithCategory = usedQuestionList.find(
        (pq) => pq.questionId === questionCategory.questionId
      );
      if (usedQuestionWithCategory)
        usedQuestionWithCategory.categoryId = questionCategory.categoryId;

      patchState(store, {
        entity: {
          ...entity,
          postponedQuestionList: [...postponedQuestionList],
          availableQuestionList: [...availableQuestionList],
          usedQuestionList: [...usedQuestionList],
        },
        isLoading: false,
        error: null,
      });
    },

    addPostponedQuestionToRandomization(postponedQuestion: PostponedQuestion) {
      const entity = store.entity();

      if (!entity) return;

      const postponedQuestionList = entity.postponedQuestionList;

      const updatedPostponedQuestionList = postponedQuestionList.filter(
        (pq) => pq.questionId !== postponedQuestion.questionId
      );
      updatedPostponedQuestionList.push(postponedQuestion);

      patchState(store, {
        entity: {
          ...entity,
          postponedQuestionList: updatedPostponedQuestionList,
        },
        isLoading: false,
        error: null,
      });
    },

    // Same as addPostponedQuestionToRandomization
    movePostponedQuestionToEnd(postponedQuestion: PostponedQuestion) {
      const entity = store.entity();

      if (!entity) return;

      const postponedQuestionList = entity.postponedQuestionList;

      const updatedPostponedQuestionList = postponedQuestionList.filter(
        (pq) => pq.questionId !== postponedQuestion.questionId
      );
      updatedPostponedQuestionList.push(postponedQuestion);

      patchState(store, {
        entity: {
          ...entity,
          postponedQuestionList: updatedPostponedQuestionList,
        },
        isLoading: false,
        error: null,
      });
    },

    deleteSelectedCategoryIdFromRandomization(categoryId: string) {
      const entity = store.entity();

      if (!entity) return;

      const updatedCategoryList = entity.selectedCategoryIdList.filter(
        (id) => id !== categoryId
      );

      patchState(store, {
        entity: {
          ...entity,
          selectedCategoryIdList: updatedCategoryList,
        },
        isLoading: false,
        error: null,
      });
    },

    deleteUsedQuestionFromRandomization(questionId: string) {
      const entity = store.entity();

      if (!entity) return;

      const updatedUsedQuestionList = entity.usedQuestionList.filter(
        (uq) => uq.questionId !== questionId
      );

      patchState(store, {
        entity: {
          ...entity,
          usedQuestionList: updatedUsedQuestionList,
        },
        isLoading: false,
        error: null,
      });
    },

    deleteAvailableQuestionFromRandomization(questionId: string) {
      const entity = store.entity();

      if (!entity) return;

      const updatedAvailableQuestionList = entity.availableQuestionList.filter(
        (aq) => aq.questionId !== questionId
      );

      patchState(store, {
        entity: {
          ...entity,
          availableQuestionList: updatedAvailableQuestionList,
        },
        isLoading: false,
        error: null,
      });
    },

    deleteAvailableQuestionsFromRandomizationByCategoryId(categoryId: string) {
      const entity = store.entity();

      if (!entity) return;

      const updatedAvailableQuestionList = entity.availableQuestionList.filter(
        (aq) => aq.categoryId !== categoryId
      );

      patchState(store, {
        entity: {
          ...entity,
          availableQuestionList: updatedAvailableQuestionList,
        },
        isLoading: false,
        error: null,
      });
    },

    deleteUsedQuestionsFromRandomizationByCategoryId(categoryId: string) {
      const entity = store.entity();

      if (!entity) return;

      const updatedUsedQuestionList = entity.usedQuestionList.filter(
        (aq) => aq.categoryId !== categoryId
      );

      patchState(store, {
        entity: {
          ...entity,
          usedQuestionList: updatedUsedQuestionList,
        },
        isLoading: false,
        error: null,
      });
    },

    deletePostponedQuestionsFromRandomizationByCategoryId(categoryId: string) {
      const entity = store.entity();

      if (!entity) return;

      const updatedPostponedQuestionList = entity.postponedQuestionList.filter(
        (aq) => aq.categoryId !== categoryId
      );

      patchState(store, {
        entity: {
          ...entity,
          postponedQuestionList: updatedPostponedQuestionList,
        },
        isLoading: false,
        error: null,
      });
    },

    deletePostponedQuestionFromRandomization(questionId: string) {
      const entity = store.entity();

      if (!entity) return;

      const updatedPostponedQuestionList = entity.postponedQuestionList.filter(
        (pq) => pq.questionId !== questionId
      );

      patchState(store, {
        entity: {
          ...entity,
          postponedQuestionList: updatedPostponedQuestionList,
        },
        isLoading: false,
        error: null,
      });
    },

    clearUsedQuestions() {
      const entity = store.entity();

      if (!entity) return;

      patchState(store, {
        entity: {
          ...entity,
          usedQuestionList: [],
        },
        isLoading: false,
        error: null,
      });
    },

    clearPostponedQuestions() {
      const entity = store.entity();

      if (!entity) return;

      patchState(store, {
        entity: {
          ...entity,
          postponedQuestionList: [],
        },
        isLoading: false,
        error: null,
      });
    },

    setCurrentQuestion(question: Question | undefined) {
      const entity = store.entity();

      if (!entity) return;

      patchState(store, {
        entity: {
          ...entity,
          currentQuestion: question,
        },
        isLoading: false,
        error: null,
      });
    },

    clearCurrentQuestion() {
      const entity = store.entity();

      if (!entity) return;

      patchState(store, {
        entity: {
          ...entity,
          currentQuestion: undefined,
        },
        isLoading: false,
        error: null,
      });
    },

    clearRandomization() {
      patchState(store, {
        entity: undefined,
        isLoading: false,
        error: null,
      });
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
