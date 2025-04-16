import { effect, inject, Injectable } from '@angular/core';
import { RandomizationService } from '@my-nx-monorepo/question-randomizer-dashboard-randomization-data-access';
import { QuestionListStore } from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';

Injectable();
export class RandomizationShellFacade {
  private readonly randomizationService = inject(RandomizationService);
  private readonly questionListStore = inject(QuestionListStore);
  private readonly userStore = inject(UserStore);
  public loadRandomization() {
    effect(() => {
      const userId = this.userStore.uid();
      const questionDic = this.questionListStore.entities();
      if (!questionDic || !userId) return;
      this.randomizationService.loadRandomization(userId, questionDic);
    });
  }
}
