import { inject, Injectable } from '@angular/core';
import {
  Category,
  EditQuestionFormValue,
  Qualification,
  Question,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';
import { QuestionRepositoryService } from '../repositories';
import { QuestionListStore, RandomizationStore } from '../store';
import { QuestionMapperService } from './question-mapper.service';
import { RandomizationService } from './randomization.service';

@Injectable()
export class QuestionListService {
  private readonly userStore = inject(UserStore);
  private readonly questionRepositoryService = inject(
    QuestionRepositoryService
  );
  private readonly questionMapperService = inject(QuestionMapperService);
  private readonly questionListStore = inject(QuestionListStore);
  private readonly randomizationService = inject(RandomizationService);
  private readonly randomizationStore = inject(RandomizationStore);

  public async createQuestionByForm(createdQuestion: EditQuestionFormValue) {
    const userId = this.userStore.uid();
    if (!userId) return;
    this.questionListStore.startLoading();
    try {
      const createQuestionRequest =
        this.questionMapperService.mapEditQuestionFormValueToCreateQuestionRequest(
          createdQuestion,
          userId
        );
      const questionId = await this.questionRepositoryService.createQuestion(
        createQuestionRequest
      );

      const question: Question = {
        ...createdQuestion,
        id: questionId,
        userId,
      };

      this.questionListStore.addQuestionToList(question);
    } catch (error: any) {
      this.questionListStore.logError(
        error.message || 'Question creation failed'
      );
    }
  }

  public async createQuestionByImport(createdQuestion: EditQuestionFormValue) {
    const userId = this.userStore.uid();
    if (!userId) return;
    this.questionListStore.startLoading();
    try {
      const createQuestionRequest =
        this.questionMapperService.mapEditQuestionFormValueToCreateQuestionRequest(
          createdQuestion,
          userId
        );
      const questionId = await this.questionRepositoryService.createQuestion(
        createQuestionRequest
      );

      const question: Question = {
        ...createdQuestion,
        id: questionId,
        userId,
      };

      this.questionListStore.addQuestionToList(question);
    } catch (error: any) {
      this.questionListStore.logError(
        error.message || 'Question creation failed'
      );
    }
  }

  public async updateQuestion(
    questionId: string,
    updatedQuestion: EditQuestionFormValue
  ) {
    this.questionListStore.startLoading();
    try {
      this.questionListStore.updateQuestionInList(questionId, updatedQuestion);
      await this.questionRepositoryService.updateQuestion(
        questionId,
        updatedQuestion
      );
    } catch (error: any) {
      this.questionListStore.logError(
        error.message || 'Question update failed'
      );
    }
  }

  public async deleteQuestion(questionId: string) {
    this.questionListStore.startLoading();
    try {
      this.questionListStore.deleteQuestionFromList(questionId);
      await Promise.all([
        this.questionRepositoryService.deleteQuestion(questionId),
        this.deleteUsedQuestionFromRandomization(questionId),
        this.updateCurrentQuestionAfterQuestionDeletion(questionId),
      ]);
    } catch (error: any) {
      this.questionListStore.logError(
        error.message || 'Question deletion failed'
      );
    }
  }

  public async loadQuestionList(
    categoryDic: Record<string, Category>,
    qualificationDic: Record<string, Qualification>,
    forceLoad = false
  ) {
    if (!forceLoad && this.questionListStore.entities() !== null) return;
    const userId = this.userStore.uid();
    if (!userId) return;

    this.questionListStore.startLoading();

    try {
      const questions = (
        await this.questionRepositoryService.getQuestions(userId)
      ).map((question) => ({
        ...question,
        categoryName: question.categoryId
          ? categoryDic[question.categoryId]?.name
          : undefined,
        qualificationName: question.qualificationId
          ? qualificationDic[question.qualificationId]?.name
          : undefined,
      }));

      this.questionListStore.loadQuestionList(questions);
    } catch (error: any) {
      this.questionListStore.logError(
        error.message || 'Failed to load questions'
      );
    }
  }

  public async deleteCategoryIdFromQuestions(categoryId: string) {
    this.questionListStore.startLoading();
    const userId = this.userStore.uid();
    if (!this.questionListStore.entities() || !userId) return;

    try {
      this.questionListStore.deleteCategoryIdFromQuestions(categoryId);
      await this.questionRepositoryService.removeCategoryIdFromQuestions(
        categoryId,
        userId
      );
    } catch (error: any) {
      this.questionListStore.logError(
        error.message || 'Failed to delete categoryId from questions'
      );
    }
  }

  public async deleteQualificationIdFromQuestions(qualificationId: string) {
    this.questionListStore.startLoading();
    const userId = this.userStore.uid();
    if (!this.questionListStore.entities() || !userId) return;

    try {
      this.questionListStore.deleteQualificationIdFromQuestions(
        qualificationId
      );
      await this.questionRepositoryService.removeQualificationIdFromQuestions(
        qualificationId,
        userId
      );
    } catch (error: any) {
      this.questionListStore.logError(
        error.message || 'Failed to delete qualificationId from questions'
      );
    }
  }

  public findLastQuestionForCategoryIdList(
    usedQuestionIdList: string[],
    selectedCategoryIdList: string[]
  ): Question | undefined {
    const questionDic = this.questionListStore.entities();

    if (!questionDic) return undefined;

    for (let i = usedQuestionIdList.length - 1; i >= 0; i--) {
      const questionId = usedQuestionIdList[i];
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

  private async deleteUsedQuestionFromRandomization(questionId: string) {
    const randomizationId = this.randomizationStore.entity()?.id;
    if (randomizationId)
      await this.randomizationService.deleteUsedQuestionFromRandomization(
        randomizationId,
        questionId
      );
  }

  private async updateCurrentQuestionAfterQuestionDeletion(
    deletedQuestionId: string
  ) {
    const randomization = this.randomizationStore.entity();
    if (!randomization) return;

    if (randomization.currentQuestion?.id === deletedQuestionId) {
      this.randomizationService.clearCurrentQuestion(randomization.id);
    }
  }
}
