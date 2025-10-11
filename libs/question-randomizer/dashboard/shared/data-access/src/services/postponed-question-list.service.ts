import { inject, Injectable } from '@angular/core';
import { RandomizationStore } from '../store';
import { PostponedQuestionListRepositoryService } from '../repositories/postponed-question-list-repository.service';
import { PostponedQuestion } from '@worse-and-pricier/question-randomizer-dashboard-shared-util';

@Injectable()
export class PostponedQuestionListService {
  private readonly randomizationStore = inject(RandomizationStore);
  private readonly postponedQuestionListRepositoryService = inject(
    PostponedQuestionListRepositoryService
  );

  public async deletePostponedQuestionFromRandomization(
    randomizationId: string,
    questionId: string
  ) {
    this.randomizationStore.startLoading();
    try {
      this.randomizationStore.deletePostponedQuestionFromRandomization(
        questionId
      );
      await this.postponedQuestionListRepositoryService.deleteQuestionFromPostponedQuestions(
        randomizationId,
        questionId
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete postponed question from Randomization.';
      console.error(message);
      this.randomizationStore.logError(message);
    }
  }

  public async addPostponedQuestionToRandomization(
    randomizationId: string,
    postponedQuestion: PostponedQuestion
  ) {
    this.randomizationStore.startLoading();

    try {
      this.randomizationStore.addPostponedQuestionToRandomization(
        postponedQuestion
      );

      await this.postponedQuestionListRepositoryService.addQuestionToPostponedQuestions(
        randomizationId,
        postponedQuestion
      );
    } catch (error: unknown) {
      this.randomizationStore.logError(
        error instanceof Error ? error.message : 'Failed to add Category to Randomization.'
      );
    }
  }

  public async movePostponedQuestionToEnd(
    postponedQuestion: PostponedQuestion
  ) {
    try {
      this.randomizationStore.startLoading();
      this.randomizationStore.movePostponedQuestionToEnd(postponedQuestion);
      await this.postponedQuestionListRepositoryService.updatePostponedQuestionCreateDate(
        postponedQuestion.questionId
      );
    } catch (error: unknown) {
      this.randomizationStore.logError(
        error instanceof Error ? error.message : 'Failed to update postponed question.'
      );
    }
  }

  public async resetPostponedQuestionsCategoryId(
    randomizationId: string,
    categoryId: string
  ) {
    this.randomizationStore.startLoading();
    try {
      this.randomizationStore.resetPostponedQuestionsCategoryId(categoryId);
      await this.postponedQuestionListRepositoryService.resetPostponedQuestionsCategoryId(
        randomizationId,
        categoryId
      );
    } catch (error: unknown) {
      this.randomizationStore.logError(
        error instanceof Error ? error.message : 'Failed to delete used question from Randomization.'
      );
    }
  }

  public async deleteAllPostponedQuestionsFromRandomization(
    randomizationId: string
  ) {
    this.randomizationStore.startLoading();
    try {
      this.randomizationStore.clearPostponedQuestions();
      await this.postponedQuestionListRepositoryService.deleteAllPostponedQuestionsFromRandomization(
        randomizationId
      );
    } catch (error: unknown) {
      this.randomizationStore.logError(
        error instanceof Error ? error.message : 'Failed to delete all postponed questions from Randomization.'
      );
    }
  }
}
