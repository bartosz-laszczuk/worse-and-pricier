import { computed, effect, inject, Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  AvailableQuestion,
  PostponedQuestion,
  Randomization,
  UsedQuestion,
} from '@my-nx-monorepo/question-randomizer-dashboard-randomization-util';
import {
  CategoryListStore,
  QuestionListService,
  QuestionListStore,
  RandomizationService,
  RandomizationStore,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';
import { filter, forkJoin, take } from 'rxjs';

Injectable();
export class RandomizationShellFacade {
  private readonly randomizationService = inject(RandomizationService);
  private readonly randomizationStore = inject(RandomizationStore);
  private readonly questionListStore = inject(QuestionListStore);
  private readonly questionListService = inject(QuestionListService);
  private readonly userStore = inject(UserStore);
  private readonly categoryListStore = inject(CategoryListStore);

  public randomization = this.randomizationStore.randomization;
  public categoryOptionItemList = this.categoryListStore.categoryOptionItemList;
  public usedQuestionListLength = computed(
    () => (this.randomizationStore.usedQuestionList() ?? []).length
  );
  public availableQuestionListLength = computed(
    () => (this.randomizationStore.availableQuestionList() ?? []).length
  );
  public postponedQuestionListLength = computed(
    () => (this.randomizationStore.postponedQuestionList() ?? []).length
  );
  public selectedCategoryIdList = computed(
    () => this.randomizationStore.randomization()?.selectedCategoryIdList ?? []
  );
  public currentQuestion = computed(() => {
    return this.randomization()?.currentQuestion;
  });

  public loadRandomization() {
    effect(() => {
      const userId = this.userStore.uid();
      const questionDic = this.questionListStore.entities();
      if (questionDic && userId)
        this.randomizationService.loadRandomization(userId, questionDic);
    });

    forkJoin([
      toObservable(this.randomization).pipe(filter(Boolean), take(1)),
      toObservable(this.questionListStore.entities).pipe(
        filter(Boolean),
        take(1)
      ),
    ]).subscribe(([randomization, questionDic]) => {
      if (!randomization.currentQuestion)
        this.randomizationService.updateCurrentQuestionWithNextQuestion(
          randomization,
          questionDic
        );
    });
  }

  public async nextQuestion(randomizationId: string) {
    const currentQuestion = this.randomizationStore.currentQuestion();
    let randomization = this.randomizationStore.entity();
    if (currentQuestion && randomization) {
      this.randomizationStore.deleteAvailableQuestionFromRandomization(
        currentQuestion.id
      );
      this.randomizationService.deletePostponedQuestionFromRandomization(
        randomization.id,
        currentQuestion.id
      );
      const usedQuestion: UsedQuestion = {
        questionId: currentQuestion.id,
        categoryId: currentQuestion.categoryId,
      };
      this.randomizationService.addUsedQuestionToRandomization(
        randomizationId,
        usedQuestion
      );
    }

    randomization = this.randomizationStore.entity();
    const questionDic = this.questionListStore.entities();

    if (randomization && questionDic) {
      this.randomizationService.updateCurrentQuestionWithNextQuestion(
        randomization,
        questionDic
      );
    }
  }

  public async postponeQuestion(randomizationId: string) {
    const currentQuestion = this.randomizationStore.currentQuestion();
    let randomization = this.randomizationStore.entity();

    if (randomization && currentQuestion) {
      this.randomizationStore.deleteAvailableQuestionFromRandomization(
        currentQuestion.id
      );
      const postponedQuestion: PostponedQuestion = {
        questionId: currentQuestion.id,
        categoryId: currentQuestion.categoryId,
      };
      if (
        randomization.postponedQuestionList.some(
          (pq) => pq.questionId === currentQuestion.id
        )
      ) {
        this.randomizationService.updatePostponedQuestion(postponedQuestion);
      } else {
        this.randomizationService.addPostponedQuestionToRandomization(
          randomizationId,
          postponedQuestion
        );
      }
    }

    randomization = this.randomizationStore.entity();
    const questionDic = this.questionListStore.entities();

    if (randomization && questionDic) {
      this.randomizationService.updateCurrentQuestionWithNextQuestion(
        randomization,
        questionDic
      );
    }
  }

  public async previousQuestion(randomizationId: string) {
    const randomization = this.randomizationStore.entity();
    if (
      !randomization ||
      !randomization.usedQuestionList ||
      randomization.usedQuestionList.length === 0
    )
      return;

    const lastQuestion =
      this.questionListService.findLastQuestionForCategoryIdList(
        randomization.usedQuestionList,
        randomization.selectedCategoryIdList
      );

    if (!lastQuestion) return;

    this.randomizationService.deleteUsedQuestionFromRandomization(
      randomizationId,
      lastQuestion.id
    );
    this.randomizationStore.addAvailableQuestionsToRandomization([
      { questionId: lastQuestion.id, categoryId: lastQuestion.categoryId },
    ]);

    this.randomizationService.setQuestionAsCurrentQuestion(lastQuestion);
  }

  public async selectCategoryForRandomization(
    categoryId: string,
    randomizationId: string
  ) {
    this.randomizationService.addCategoryToRandomization(
      randomizationId,
      categoryId
    );

    const randomization = this.randomizationStore.entity();
    if (!randomization) return;
    const questionDic = this.questionListStore.entities();
    if (!randomization.currentQuestion && questionDic) {
      this.randomizationService.updateCurrentQuestionWithNextQuestion(
        randomization,
        questionDic
      );
    }
  }

  public async deselectCategoryFromRandomization(
    categoryId: string,
    randomizationId: string
  ) {
    this.randomizationService.deselectCategoryFromRandomization(
      randomizationId,
      categoryId
    );

    const randomization = this.randomizationStore.entity();
    if (!randomization) return;
    const questionDic = this.questionListStore.entities();
    if (
      randomization.currentQuestion?.categoryId === categoryId &&
      questionDic
    ) {
      this.randomizationService.updateCurrentQuestionWithNextQuestion(
        randomization,
        questionDic
      );
    }
  }

  public async updateRandomization(randomization: Randomization) {
    this.randomizationService.updateRandomization(randomization);
  }

  public async resetRandomization(randomizationId: string) {
    this.randomizationService.deleteAllUsedQuestionsFromRandomization(
      randomizationId
    );
    this.randomizationService.deleteAllPostponedQuestionsFromRandomization(
      randomizationId
    );
    const questionList: AvailableQuestion[] = Object.values(
      this.questionListStore.entities() ?? {}
    ).map((question) => ({
      questionId: question.id,
      categoryId: question.categoryId,
    }));
    this.randomizationStore.addAvailableQuestionsToRandomization(questionList);

    const randomization = this.randomizationStore.entity();
    const questionDic = this.questionListStore.entities();
    if (randomization && questionDic) {
      this.randomizationService.updateCurrentQuestionWithNextQuestion(
        randomization,
        questionDic
      );
    }
  }
}
