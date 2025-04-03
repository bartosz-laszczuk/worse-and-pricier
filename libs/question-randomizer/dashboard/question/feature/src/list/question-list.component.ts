import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { QuestionListFacade } from './question-list.facade';
import { EditQuestionComponent } from '@my-nx-monorepo/question-randomizer-dashboard-question-ui';
import { IColumn, TableComponent } from '@my-nx-monorepo/shared-ui';

@Component({
  selector: 'lib-question-list',
  imports: [CommonModule, EditQuestionComponent, TableComponent],
  templateUrl: './question-list.component.html',
  styleUrl: './question-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [QuestionListFacade],
})
export class QuestionListComponent {
  private readonly questionListFacade = inject(QuestionListFacade);
  public questions = this.questionListFacade.questions;
  public questionToEdit?: Question = undefined;
  public categoryListOptions = this.questionListFacade.categoryListOptions;

  public columns: IColumn[] = [
    { displayName: 'Question', propertyName: 'question' },
    { displayName: 'Answer', propertyName: 'answer' },
    { displayName: 'Answer Pl', propertyName: 'answerPl' },
    { displayName: 'Category', propertyName: 'categoryId' },
    { displayName: 'Qualification', propertyName: 'qualificationId' },
    { displayName: 'Is active', propertyName: 'isActive' },
  ];

  public constructor() {
    this.questionListFacade.loadLists();
  }

  public onAdd() {
    this.questionToEdit = {
      id: '',
      question: '',
      answer: '',
      answerPl: '',
      categoryId: '',
      qualificationId: '',
      isActive: true,
      userId: '',
    };
  }

  public onClose(editedQuestion?: Question) {
    if (editedQuestion) {
      if (editedQuestion.id)
        this.questionListFacade.updateQuestion(editedQuestion);
      else this.questionListFacade.createQuestion(editedQuestion);
    }
    this.questionToEdit = undefined;
  }

  public onDelete(questionId: string) {
    this.questionListFacade.deleteQuestion(questionId);
  }
}
