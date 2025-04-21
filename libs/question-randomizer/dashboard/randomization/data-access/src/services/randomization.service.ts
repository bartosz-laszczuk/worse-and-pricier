import { inject, Injectable } from '@angular/core';
import {
  RandomizationRepositoryService,
  SelectedCategoryListRepositoryService,
  UsedQuestionListRepositoryService,
} from '../repositories';
import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { RandomizationMapperService } from './randomization-mapper.service';
import {
  Randomization,
  RandomizationStatus,
} from '@my-nx-monorepo/question-randomizer-dashboard-randomization-util';
import { RandomizationStore } from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';

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
      this.randomizationStore.addCategoryIdToRandomization(categoryId);

      await this.selectedCategoryListRepositoryService.addCategoryToRandomization(
        randomizationId,
        categoryId
      );
    } catch (error: any) {
      this.randomizationStore.logError(
        error.message || 'Failed to add Category to Randomization.'
      );
    }
  }

  public async addUsedQuestionToRandomization(
    randomizationId: string,
    questionId: string
  ) {
    this.randomizationStore.startLoading();

    try {
      this.randomizationStore.addUsedQuestionIdToRandomization(questionId);

      await this.usedQuestionListRepositoryService.addQuestionToUsedQuestions(
        randomizationId,
        questionId
      );
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
      this.randomizationStore.deleteCategoryIdFromRandomization(categoryId);

      await this.selectedCategoryListRepositoryService.deleteCategoryFromRandomization(
        randomizationId,
        categoryId
      );
    } catch (error: any) {
      this.randomizationStore.logError(
        error.message || 'Failed to delete Category from Randomization.'
      );
    }
  }

  public async updateCurrentQuestionWithNextQuestion(
    randomization: Randomization,
    questionDic: Record<string, Question>
  ): Promise<void> {
    this.randomizationStore.startLoading();

    try {
      const availableQuestions = Object.values(questionDic).filter(
        (question) =>
          question.isActive &&
          question.categoryId &&
          randomization.selectedCategoryIdList.includes(question.categoryId) &&
          !randomization.usedQuestionIdList.includes(question.id)
      );

      if (availableQuestions.length === 0) {
        randomization.currentQuestion = undefined;
      } else {
        const randomIndex = Math.floor(
          Math.random() * availableQuestions.length
        );
        randomization.currentQuestion = availableQuestions[randomIndex];
      }

      await this.randomizationRepositoryService.updateRandomization(
        randomization
      );

      this.randomizationStore.setRandomization(randomization);
    } catch (error: any) {
      this.randomizationStore.logError(
        error.message || 'Failed to update current question with next question.'
      );
    }
  }

  public async deleteUsedQuestionFromRandomization(
    randomizationId: string,
    questionId: string
  ) {
    this.randomizationStore.startLoading();

    try {
      this.randomizationStore.deleteQuestionIdFromRandomization(questionId);

      await this.usedQuestionListRepositoryService.deleteQuestionFromUsedQuestions(
        randomizationId,
        questionId
      );
    } catch (error: any) {
      this.randomizationStore.logError(
        error.message || 'Failed to delete used question from Randomization.'
      );
    }
  }

  public async setQuestionAsCurrentQuetsion(question: Question) {
    this.randomizationStore.startLoading();

    try {
      const randomization = this.randomizationStore.entity();
      if (!randomization) return;

      randomization.currentQuestion = question;
      this.randomizationStore.setRandomization(randomization);
      await this.randomizationRepositoryService.updateRandomization(
        randomization
      );
    } catch (error: any) {
      this.randomizationStore.logError(
        error.message || 'Failed to set question as current question.'
      );
    }
  }

  public async deleteAllUsedQuestionsFromRandomization(
    randomizationId: string
  ) {
    this.randomizationStore.startLoading();
    try {
      this.randomizationStore.clearUsedQuestions();
      await this.usedQuestionListRepositoryService.deleteAllUsedQuestionsFromRandomization(
        randomizationId
      );
    } catch (error: any) {
      this.randomizationStore.logError(
        error.message ||
          'Failed to delete all used questions from Randomization.'
      );
    }
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
