import { computed, inject, Injectable } from '@angular/core';
import {
  CategoryListStore,
  QualificationListStore,
  QuestionListStore,
  QuestionService,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';
import {
  EditQuestionFormValue,
  Question,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { SortDefinition } from '@my-nx-monorepo/shared-ui';

@Injectable()
export class QuestionListFacade {
  private readonly userStore = inject(UserStore);
  private readonly questionListStore = inject(QuestionListStore);
  private readonly qualificationListStore = inject(QualificationListStore);
  private readonly categoryListStore = inject(CategoryListStore);
  private readonly questionService = inject(QuestionService);

  public questions = this.questionListStore.displayQuestions;
  public sort = this.questionListStore.sort;
  public categoryOptionItemList = this.categoryListStore.categoryOptionItemList;
  public qualificationOptionItemList =
    this.qualificationListStore.qualificationOptionItemList;

  public setSort(sort: SortDefinition<Question>) {
    this.questionListStore.setSort(sort);
  }

  public async createQuestion(createdQuestion: EditQuestionFormValue) {
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

  public async updateQuestion(
    questionId: string,
    updatedQuestion: EditQuestionFormValue
  ) {
    await this.questionService.updateQuestion(questionId, updatedQuestion);
    this.questionListStore.updateQuestionInList(questionId, updatedQuestion);
  }

  public async deleteQuestion(questionId: string) {
    await this.questionService.deleteQuestion(questionId);
    this.questionListStore.deleteQuestionFromList(questionId);
  }

  public setSearchText(searchText: string) {
    this.questionListStore.setSearchText(searchText);
  }
}
