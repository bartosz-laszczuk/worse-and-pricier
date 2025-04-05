import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { QuestionListFacade } from './question-list.facade';
import { EditQuestionComponent } from '@my-nx-monorepo/question-randomizer-dashboard-question-ui';
import {
  IColumn,
  InputTextComponent,
  SortDefinition,
  TableComponent,
} from '@my-nx-monorepo/shared-ui';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'lib-question-list',
  imports: [
    CommonModule,
    EditQuestionComponent,
    TableComponent,
    InputTextComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './question-list.component.html',
  styleUrl: './question-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [QuestionListFacade],
})
export class QuestionListComponent {
  private readonly questionListFacade = inject(QuestionListFacade);
  public questions = this.questionListFacade.questions;
  public sort = this.questionListFacade.sort;
  public questionToEdit?: Question = undefined;
  public categoryListOptions = this.questionListFacade.categoryListOptions;
  public searchTextControl = new FormControl('', {
    nonNullable: true,
  });

  public columns: IColumn[] = [
    { displayName: 'Question', propertyName: 'question', sortable: true },
    { displayName: 'Answer', propertyName: 'answer' },
    { displayName: 'Answer Pl', propertyName: 'answerPl' },
    { displayName: 'Category', propertyName: 'categoryId' },
    { displayName: 'Qualification', propertyName: 'qualificationId' },
    { displayName: 'Is active', propertyName: 'isActive' },
  ];

  public constructor() {
    this.questionListFacade.loadLists();

    this.searchTextControl.valueChanges
      .pipe(debounceTime(200), takeUntilDestroyed())
      .subscribe((value) => this.questionListFacade.setSearchText(value));
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

  public onSort(sort: SortDefinition<Question>): void {
    this.questionListFacade.setSort(sort);
  }
}
