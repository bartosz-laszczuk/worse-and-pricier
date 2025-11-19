import { inject, Injectable } from '@angular/core';
import { UsedQuestionListRepository } from '../repositories';
import { UsedQuestion } from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
import { RandomizationStore } from '../store';

@Injectable()
export class UsedQuestionListService {
  private readonly randomizationStore = inject(RandomizationStore);
  private readonly usedQuestionListRepository = inject(
    UsedQuestionListRepository
  );

  public async deleteUsedQuestionFromRandomization(
    randomizationId: string,
    questionId: string
  ) {
    this.randomizationStore.startLoading();
    try {
      this.randomizationStore.deleteUsedQuestionFromRandomization(questionId);
      await this.usedQuestionListRepository.deleteQuestionFromUsedQuestions(
        randomizationId,
        questionId
      );
    } catch (error: unknown) {
      this.randomizationStore.logError(
        error instanceof Error ? error.message : 'Failed to delete used question from Randomization.'
      );
    }
  }

  public async resetUsedQuestionsCategoryId(
    randomizationId: string,
    categoryId: string
  ) {
    this.randomizationStore.startLoading();
    try {
      this.randomizationStore.resetUsedQuestionsCategoryId(categoryId);
      await this.usedQuestionListRepository.resetUsedQuestionsCategoryId(
        randomizationId,
        categoryId
      );
    } catch (error: unknown) {
      this.randomizationStore.logError(
        error instanceof Error ? error.message : 'Failed to delete used question from Randomization.'
      );
    }
  }

  public async deleteAllUsedQuestionsFromRandomization(
    randomizationId: string
  ) {
    this.randomizationStore.startLoading();
    try {
      this.randomizationStore.clearUsedQuestions();
      await this.usedQuestionListRepository.deleteAllUsedQuestionsFromRandomization(
        randomizationId
      );
    } catch (error: unknown) {
      this.randomizationStore.logError(
        error instanceof Error ? error.message :
          'Failed to delete all used questions from Randomization.'
      );
    }
  }

  public async addUsedQuestionToRandomization(
    randomizationId: string,
    usedQuestion: UsedQuestion
  ) {
    this.randomizationStore.startLoading();

    try {
      this.randomizationStore.addUsedQuestionToRandomization(usedQuestion);

      await this.usedQuestionListRepository.addQuestionToUsedQuestions(
        randomizationId,
        usedQuestion
      );
    } catch (error: unknown) {
      this.randomizationStore.logError(
        error instanceof Error ? error.message : 'Failed to add Category to Randomization.'
      );
    }
  }
}
