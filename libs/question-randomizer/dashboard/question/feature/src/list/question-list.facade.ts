import { computed, inject, Injectable } from '@angular/core';
import {
  CategoryListStore,
  QualificationListStore,
  QuestionListStore,
  QuestionService,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';
import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';

@Injectable()
export class QuestionListFacade {
  private readonly userStore = inject(UserStore);
  private readonly questionListStore = inject(QuestionListStore);
  private readonly qualificationListStore = inject(QualificationListStore);
  private readonly categoryListStore = inject(CategoryListStore);
  private readonly questionService = inject(QuestionService);

  public questions = computed(() => this.questionListStore.entities() ?? []);

  public async createQuestion(createdQuestion: Question) {
    const userId = this.userStore.uid()!;
    const questionId = await this.questionService.createQuestion(
      createdQuestion,
      userId
    );
    const question: Question = {
      ...createdQuestion,
      id: questionId,
      userId,
    };
    this.questionListStore.addQuestionToList(question);
  }

  public async updateQuestion(updatedQuestion: Question) {
    await this.questionService.updateQuestion(
      updatedQuestion.id,
      updatedQuestion
    );
    this.questionListStore.updateQuestionInList(
      updatedQuestion.id,
      updatedQuestion
    );
  }

  public async deleteQuestion(questionId: string) {
    await this.questionService.deleteQuestion(questionId);
    this.questionListStore.deleteQuestionFromList(questionId);
  }

  public loadLists() {
    this.questionListStore.loadQuestionList();
    this.qualificationListStore.loadQualificationList();
    this.categoryListStore.loadCategoryList();
  }
}
