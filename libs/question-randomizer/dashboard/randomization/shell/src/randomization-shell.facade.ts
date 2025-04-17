import { computed, effect, inject, Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  RandomizationService,
  RandomizationStore,
} from '@my-nx-monorepo/question-randomizer-dashboard-randomization-data-access';
import {
  CategoryListStore,
  QuestionListStore,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';
import { filter, forkJoin, take } from 'rxjs';

Injectable();
export class RandomizationShellFacade {
  private readonly randomizationService = inject(RandomizationService);
  private readonly randomizationStore = inject(RandomizationStore);
  private readonly questionListStore = inject(QuestionListStore);
  private readonly userStore = inject(UserStore);
  private readonly categoryListStore = inject(CategoryListStore);

  public randomization = this.randomizationStore.randomization;
  public categoryOptionItemList = this.categoryListStore.categoryOptionItemList;
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

  public async nextQuestion() {
    const randomizationId = this.randomizationStore.entity()?.id;
    const currentQuestionId = this.randomizationStore.currentQuestion()?.id;

    if (randomizationId && currentQuestionId) {
      await this.randomizationService.addUsedQuestionToRandomization(
        randomizationId,
        currentQuestionId
      );
    }

    const randomization = this.randomizationStore.entity();
    const questionDic = this.questionListStore.entities();

    if (randomization && questionDic) {
      this.randomizationService.updateCurrentQuestionWithNextQuestion(
        randomization,
        questionDic
      );
    }
  }

  public async addCategoryToRandomization(categoryId: string) {
    const randomizationId = this.randomizationStore.entity()?.id;
    if (!randomizationId) return;

    await this.randomizationService.addCategoryToRandomization(
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

  public async deleteCategoryFromRandomization(categoryId: string) {
    const randomizatioId = this.randomizationStore.entity()?.id;
    if (!randomizatioId) return;

    await this.randomizationService.deleteCategoryFromRandomization(
      randomizatioId,
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
}
