import { inject, Injectable } from '@angular/core';
import {
  CategoryListStore,
  QualificationListStore,
  QuestionListService,
  QuestionListStore,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import {
  EditQuestionFormValue,
  Question,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { SortDefinition } from '@my-nx-monorepo/shared-ui';

@Injectable()
export class QuestionListFacade {
  private readonly questionListStore = inject(QuestionListStore);
  private readonly questionListService = inject(QuestionListService);
  private readonly qualificationListStore = inject(QualificationListStore);
  private readonly categoryListStore = inject(CategoryListStore);

  public questions = this.questionListStore.displayQuestions;
  public sort = this.questionListStore.sort;
  public categoryOptionItemList = this.categoryListStore.categoryOptionItemList;
  public qualificationOptionItemList =
    this.qualificationListStore.qualificationOptionItemList;

  public setSort(sort: SortDefinition<Question>) {
    this.questionListStore.setSort(sort);
  }

  public async createQuestion(createdQuestion: EditQuestionFormValue) {
    this.questionListService.createQuestion(createdQuestion);
  }

  public async updateQuestion(
    questionId: string,
    updatedQuestion: EditQuestionFormValue
  ) {
    this.questionListService.updateQuestion(questionId, updatedQuestion);
  }

  public async deleteQuestion(questionId: string) {
    this.questionListService.deleteQuestion(questionId);
  }

  public setSearchText(searchText: string) {
    this.questionListStore.setSearchText(searchText);
  }
}
