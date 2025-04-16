import { computed, effect, inject, Injectable } from '@angular/core';
import {
  RandomizationService,
  RandomizationStore,
} from '@my-nx-monorepo/question-randomizer-dashboard-randomization-data-access';
import {
  CategoryListStore,
  QuestionListStore,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';

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
    effect(() => {
      const randomization = this.randomization();
      const questionDic = this.questionListStore.entities();
      console.log('current question computed', randomization?.currentQuestion);
      if (randomization && !randomization.currentQuestion && questionDic) {
        this.randomizationService.updateCurrentQuestion(
          randomization,
          questionDic
        );
      }
    });
  }

  public addCategoryToRandomization(categoryId: string) {
    const randomizationId = this.randomizationStore.entity()?.id;
    if (!randomizationId) return;

    this.randomizationService.addCategoryToRandomization(
      randomizationId,
      categoryId
    );
  }

  public deleteCategoryFromRandomization(categoryId: string) {
    const randomizationId = this.randomizationStore.entity()?.id;
    if (!randomizationId) return;

    this.randomizationService.deleteCategoryFromRandomization(
      randomizationId,
      categoryId
    );
  }
}
