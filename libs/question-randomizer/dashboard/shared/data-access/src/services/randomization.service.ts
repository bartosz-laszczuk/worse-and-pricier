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
import { RandomizationStore } from '../store';

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

  public async deselectCategoryFromRandomization(
    randomizationId: string,
    categoryId: string
  ) {
    this.randomizationStore.startLoading();

    try {
      this.randomizationStore.deleteSelectedCategoryIdFromRandomization(
        categoryId
      );

      await this.selectedCategoryListRepositoryService.deleteSelectedCategoryFromRandomization(
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
    try {
      const availableQuestions = Object.values(questionDic).filter(
        (question) =>
          question.isActive &&
          question.categoryId &&
          randomization.selectedCategoryIdList.includes(question.categoryId) &&
          !randomization.usedQuestionIdList.includes(question.id)
      );

      if (availableQuestions.length > 0) {
        const nextQuestion =
          availableQuestions[
            Math.floor(Math.random() * availableQuestions.length)
          ];
        randomization.currentQuestion = nextQuestion;
      } else if (randomization.currentQuestion) {
        randomization.currentQuestion = undefined;
      } else {
        return;
      }

      this.randomizationStore.startLoading();
      this.randomizationStore.setRandomization(randomization);
      await this.randomizationRepositoryService.updateRandomization(
        randomization
      );
    } catch (error: any) {
      this.randomizationStore.logError(
        error.message || 'Failed to update current question with next question.'
      );
    }
  }

  public async updateRandomization(randomization: Randomization) {
    try {
      this.randomizationStore.startLoading();
      this.randomizationStore.setRandomization(randomization);
      await this.randomizationRepositoryService.updateRandomization(
        randomization
      );
    } catch (error: any) {
      this.randomizationStore.logError(
        error.message || 'Failed to update randomization.'
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

  public async setQuestionAsCurrentQuestion(question: Question) {
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

  public async clearCurrentQuestion(randomizationId: string) {
    this.randomizationStore.startLoading();
    try {
      this.randomizationStore.clearCurrentQuestion();
      await this.randomizationRepositoryService.clearCurrentQuestion(
        randomizationId
      );
    } catch (error: any) {
      this.randomizationStore.logError(
        error.message || 'Failed to clear current question.'
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
      showAnswer: false,
      status: RandomizationStatus.Ongoing,
      usedQuestionIdList: [],
      selectedCategoryIdList: [],
    };
  }
}
