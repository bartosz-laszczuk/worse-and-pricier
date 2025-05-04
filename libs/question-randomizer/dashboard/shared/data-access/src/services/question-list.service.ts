import { inject, Injectable } from '@angular/core';
import {
  Category,
  EditQuestionFormValue,
  Qualification,
  Question,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';
import { QuestionRepositoryService } from '../repositories';
import { QuestionListStore } from '../store';
import { QuestionListMapperService } from './question-list-mapper.service';

@Injectable()
export class QuestionListService {
  private readonly userStore = inject(UserStore);
  private readonly questionRepositoryService = inject(
    QuestionRepositoryService
  );
  private readonly questionListMapperService = inject(
    QuestionListMapperService
  );
  private readonly questionListStore = inject(QuestionListStore);

  public async createQuestionByForm(createdQuestion: EditQuestionFormValue) {
    const userId = this.userStore.uid()!;
    this.questionListStore.startLoading();
    try {
      const createQuestionRequest =
        this.questionListMapperService.mapEditQuestionFormValueToCreateQuestionRequest(
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
    const userId = this.userStore.uid()!;
    this.questionListStore.startLoading();
    try {
      const createQuestionRequest =
        this.questionListMapperService.mapEditQuestionFormValueToCreateQuestionRequest(
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
      await this.questionRepositoryService.updateQuestion(
        questionId,
        updatedQuestion
      );

      this.questionListStore.updateQuestionInList(questionId, updatedQuestion);
    } catch (error: any) {
      this.questionListStore.logError(
        error.message || 'Question update failed'
      );
    }
  }

  public async deleteQuestion(questionId: string) {
    this.questionListStore.startLoading();
    try {
      await this.questionRepositoryService.deleteQuestion(questionId);
      this.questionListStore.deleteQuestionFromList(questionId);
    } catch (error: any) {
      this.questionListStore.logError(
        error.message || 'Question deletion failed'
      );
    }
  }

  public async loadQuestionList(
    categories: Record<string, Category>,
    qualifications: Record<string, Qualification>,
    forceLoad = false
  ) {
    if (!forceLoad && this.questionListStore.entities() !== null) return;

    this.questionListStore.startLoading();

    try {
      const questions = (
        await this.questionRepositoryService.getQuestions(this.userStore.uid()!)
      ).map((question) => ({
        ...question,
        categoryName: question.categoryId
          ? categories[question.categoryId]?.name
          : undefined,
        qualificationName: question.qualificationId
          ? qualifications[question.qualificationId]?.name
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
      await this.questionRepositoryService.removeCategoryIdFromQuestions(
        categoryId,
        userId
      );

      this.questionListStore.deleteCategoryIdFromQuestions(categoryId);
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
      await this.questionRepositoryService.removeQualificationIdFromQuestions(
        qualificationId,
        userId
      );

      this.questionListStore.deleteQualificationIdFromQuestions(
        qualificationId
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
}
