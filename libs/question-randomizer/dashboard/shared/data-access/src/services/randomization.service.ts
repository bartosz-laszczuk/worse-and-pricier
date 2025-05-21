import { inject, Injectable } from '@angular/core';
import {
  RandomizationRepositoryService,
  SelectedCategoryListRepositoryService,
  UsedQuestionListRepositoryService,
} from '../repositories';
import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { RandomizationMapperService } from './randomization-mapper.service';
import {
  PostponedQuestion,
  Randomization,
  RandomizationStatus,
  UsedQuestion,
} from '@my-nx-monorepo/question-randomizer-dashboard-randomization-util';
import { RandomizationStore } from '../store';
import { PostponedQuestionListRepositoryService } from '../repositories/postponed-question-list-repository.service';

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
  private readonly postponedQuestionListRepositoryService = inject(
    PostponedQuestionListRepositoryService
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
          await this.getNewRandomization(userId, questionDic)
        );
      } else {
        const usedQuestionList =
          await this.usedQuestionListRepositoryService.getUsedQuestionIdListForRandomization(
            response.id
          );
        const postponedQuestionList =
          await this.postponedQuestionListRepositoryService.getPostponedQuestionIdListForRandomization(
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
            usedQuestionList,
            postponedQuestionList,
            selectedCategoryIdList,
            questionDic,
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
    usedQuestion: UsedQuestion
  ) {
    this.randomizationStore.startLoading();

    try {
      this.randomizationStore.addUsedQuestionToRandomization(usedQuestion);

      await this.usedQuestionListRepositoryService.addQuestionToUsedQuestions(
        randomizationId,
        usedQuestion
      );
    } catch (error: any) {
      this.randomizationStore.logError(
        error.message || 'Failed to add Category to Randomization.'
      );
    }
  }

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
    } catch (error: any) {
      const message =
        error.message ||
        'Failed to delete postponed question from Randomization.';
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
      const availableQuestionList = randomization.availableQuestionList;
      const postponedQuestionList = randomization.postponedQuestionList;

      if (availableQuestionList.length > 0) {
        const nextQuestionId =
          availableQuestionList[
            Math.floor(Math.random() * availableQuestionList.length)
          ].questionId;
        randomization.currentQuestion = questionDic[nextQuestionId];
      } else if (postponedQuestionList.length > 0) {
        const nextQuestion = this.findFirstQuestionForCategoryIdList(
          randomization.postponedQuestionList.map((pq) => pq.questionId),
          randomization.selectedCategoryIdList,
          questionDic
        );
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

  public async updatePostponedQuestion(postponedQuestion: PostponedQuestion) {
    try {
      this.randomizationStore.startLoading();
      this.randomizationStore.addPostponedQuestionToRandomization(
        postponedQuestion
      );
      await this.postponedQuestionListRepositoryService.updatePostponedQuestion(
        postponedQuestion.questionId
      );
    } catch (error: any) {
      this.randomizationStore.logError(
        error.message || 'Failed to update postponed question.'
      );
    }
  }

  public async deleteUsedQuestionFromRandomization(
    randomizationId: string,
    questionId: string
  ) {
    this.randomizationStore.startLoading();
    try {
      this.randomizationStore.deleteUsedQuestionFromRandomization(questionId);
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

  public async deleteAllPostponedQuestionsFromRandomization(
    randomizationId: string
  ) {
    this.randomizationStore.startLoading();
    try {
      this.randomizationStore.clearPostponedQuestions();
      await this.postponedQuestionListRepositoryService.deleteAllPostponedQuestionsFromRandomization(
        randomizationId
      );
    } catch (error: any) {
      this.randomizationStore.logError(
        error.message ||
          'Failed to delete all postponed questions from Randomization.'
      );
    }
  }

  public findFirstQuestionForCategoryIdList(
    postponedQuestionIdList: string[],
    selectedCategoryIdList: string[],
    questionDic: Record<string, Question>
  ): Question | undefined {
    for (let i = 0; i < postponedQuestionIdList.length; i++) {
      const questionId = postponedQuestionIdList[i];
      const question = questionDic[questionId];

      if (
        question &&
        selectedCategoryIdList.includes(question.categoryId ?? '')
      ) {
        return question;
      }
    }

    return undefined;
  }

  private async getNewRandomization(
    userId: string,
    questionDic: Record<string, Question>
  ): Promise<Randomization> {
    const randomizationId =
      await this.randomizationRepositoryService.createRandomization(userId);

    return {
      id: randomizationId,
      showAnswer: false,
      status: RandomizationStatus.Ongoing,
      usedQuestionList: [],
      postponedQuestionList: [],
      selectedCategoryIdList: [],
      availableQuestionList: Object.values(questionDic).map((question) => ({
        questionId: question.id,
        categoryId: question.categoryId,
      })),
    };
  }
}
