import { inject, Injectable } from '@angular/core';
import {
  RandomizationRepositoryService,
  SelectedCategoryListRepositoryService,
  UsedQuestionListRepositoryService,
} from '../repositories';
import { Question } from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
import { RandomizationMapperService } from './randomization-mapper.service';
import {
  QuestionCategory,
  Randomization,
  RandomizationStatus,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
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
    } catch (error: unknown) {
      this.randomizationStore.logError(
        error instanceof Error ? error.message : 'Failed to load Randomization.'
      );
    }
  }

  public async updateCurrentQuestionWithNextQuestion(
    questionDic: Record<string, Question>
  ): Promise<void> {
    try {
      const randomization = this.randomizationStore.entity();
      if (!randomization) return;
      let newCurrentQuestion: Question | undefined = undefined;
      const availableQuestionList =
        this.randomizationStore.filteredAvailableQuestionList();
      const postponedQuestionList =
        this.randomizationStore.filteredPostponedQuestionList();

      if (availableQuestionList.length > 0) {
        const nextQuestionId =
          availableQuestionList[
            Math.floor(Math.random() * availableQuestionList.length)
          ].questionId;
        newCurrentQuestion = questionDic[nextQuestionId];
      } else if (postponedQuestionList.length > 0) {
        const nextQuestion = this.findFirstQuestionForCategoryIdList(
          randomization.postponedQuestionList.map((pq) => pq.questionId),
          randomization.selectedCategoryIdList,
          questionDic
        );
        newCurrentQuestion = nextQuestion;
      } else if (randomization.currentQuestion) {
        newCurrentQuestion = undefined;
      } else {
        return;
      }
      
      randomization.showAnswer = false;
      randomization.currentQuestion = newCurrentQuestion;

      this.randomizationStore.startLoading();
      this.randomizationStore.setCurrentQuestion(newCurrentQuestion);
      await this.randomizationRepositoryService.updateRandomization(
        randomization
      );
    } catch (error: unknown) {
      this.randomizationStore.logError(
        error instanceof Error ? error.message : 'Failed to update current question with next question.'
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
    } catch (error: unknown) {
      this.randomizationStore.logError(
        error instanceof Error ? error.message : 'Failed to update randomization.'
      );
    }
  }

  public async updateCategoryQuestionListsCategoryId(
    newQuestionCategory: QuestionCategory
  ) {
    try {
      this.randomizationStore.startLoading();
      this.randomizationStore.updateQuestionCategoryListsCategoryId(
        newQuestionCategory
      );
      await Promise.all([
        this.postponedQuestionListRepositoryService.updatePostponedQuestionCategoryId(
          newQuestionCategory
        ),
        this.usedQuestionListRepositoryService.updateUsedQuestionCategoryId(
          newQuestionCategory
        ),
      ]);
    } catch (error: unknown) {
      this.randomizationStore.logError(
        error instanceof Error ? error.message : 'Failed to update postponed question.'
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
    } catch (error: unknown) {
      this.randomizationStore.logError(
        error instanceof Error ? error.message : 'Failed to set question as current question.'
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
    } catch (error: unknown) {
      this.randomizationStore.logError(
        error instanceof Error ? error.message : 'Failed to clear current question.'
      );
    }
  }

  private findFirstQuestionForCategoryIdList(
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
