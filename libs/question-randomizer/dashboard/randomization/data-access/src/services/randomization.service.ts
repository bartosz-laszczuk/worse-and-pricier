import { inject, Injectable } from '@angular/core';
import {
  RandomizationRepositoryService,
  SelectedCategoryListRepositoryService,
  UsedQuestionListRepositoryService,
} from '../repositories';
import { RandomizationStore } from '../store';
import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { RandomizationMapperService } from './randomization-mapper.service';
import {
  Randomization,
  RandomizationStatus,
} from '@my-nx-monorepo/question-randomizer-dashboard-randomization-util';

@Injectable()
export class RandomizationService {
  private readonly randomizationStore = inject(RandomizationStore);
  private readonly randomizationRepositoryService = inject(
    RandomizationRepositoryService
  );
  private readonly randomizationMapperService = inject(
    RandomizationMapperService
  );
  private readonly selectedCategoryListRepositoryService = inject(
    SelectedCategoryListRepositoryService
  );
  private readonly usedQuestionListRepositoryService = inject(
    UsedQuestionListRepositoryService
  );

  public async loadRandomization(
    userId: string,
    questionDic: Record<string, Question>,
    forceLoad = false
  ) {
    if (!forceLoad && this.randomizationStore.entity() !== null) return;
    this.randomizationStore.startLoading();

    try {
      const response =
        await this.randomizationRepositoryService.getRandomization(userId);

      if (!response) {
        this.randomizationStore.setRandomization(
          await this.getNewRandomization(userId)
        );
      } else {
        const usedQuestionIdList =
          await this.usedQuestionListRepositoryService.getUsedQuestionIdListForRandomization(
            response.id
          );
        const selectedCategoryIdList =
          await this.selectedCategoryListRepositoryService.getSelectedCategoryIdListForRandomiozation(
            response.id
          );

        let currentQuestion: Question | undefined = undefined;
        if (
          response.currentQuestionId &&
          questionDic[response.currentQuestionId]
        ) {
          currentQuestion = questionDic[response.currentQuestionId];
        }

        const randomization =
          this.randomizationMapperService.mapGetRandomizationResopnseToRandomization(
            response,
            usedQuestionIdList,
            selectedCategoryIdList,
            currentQuestion
          );

        this.randomizationStore.setRandomization(randomization);
      }
    } catch (error: any) {
      this.randomizationStore.logError(
        error.message || 'Failed to load Randomization.'
      );
    }
  }

  public async addCategoryToRandomization(
    randomizationId: string,
    categoryId: string
  ) {
    this.randomizationStore.startLoading();

    try {
      await this.selectedCategoryListRepositoryService.addCategoryToRandomization(
        randomizationId,
        categoryId
      );

      this.randomizationStore.addCategoryToRandomization(categoryId);
    } catch (error: any) {
      this.randomizationStore.logError(
        error.message || 'Failed to add Category to Randomization.'
      );
    }
  }

  public async deleteCategoryFromRandomization(
    randomizationId: string,
    categoryId: string
  ) {
    this.randomizationStore.startLoading();

    try {
      await this.selectedCategoryListRepositoryService.deleteCategoryFromRandomization(
        randomizationId,
        categoryId
      );

      this.randomizationStore.deleteCategoryFromRandomization(categoryId);
    } catch (error: any) {
      this.randomizationStore.logError(
        error.message || 'Failed to delete Category from Randomization.'
      );
    }
  }

  public updateCurrentQuestion(
    randomization: Randomization,
    questionDic: Record<string, Question>
  ): void {
    const availableQuestions = Object.values(questionDic).filter(
      (question) =>
        question.categoryId &&
        randomization.selectedCategoryIdList.includes(question.categoryId) &&
        !randomization.usedQuestionIdList.includes(question.id)
    );

    if (availableQuestions.length === 0) {
      randomization.currentQuestion = undefined;
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    randomization.currentQuestion = availableQuestions[randomIndex];

    this.randomizationStore.setRandomization(randomization);
  }

  private async getNewRandomization(userId: string): Promise<Randomization> {
    const randomizationId =
      await this.randomizationRepositoryService.createRandomization(userId);

    return {
      id: randomizationId,
      isAnswerHidden: true,
      status: RandomizationStatus.Ongoing,
      usedQuestionIdList: [],
      selectedCategoryIdList: [],
    };
  }
}
