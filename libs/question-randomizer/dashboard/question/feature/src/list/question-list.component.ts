import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  EditQuestionFormValue,
  NormalizeSpacePipe,
  Question,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { QuestionListFacade } from './question-list.facade';
import { EditQuestionComponent } from '@my-nx-monorepo/question-randomizer-dashboard-question-ui';
import {
  ColumnDirective,
  IColumn,
  InputTextComponent,
  SortDefinition,
  TableComponent,
} from '@my-nx-monorepo/shared-ui';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, take } from 'rxjs';
import {
  QuestionListExportService,
  QuestionListImportService,
} from '@my-nx-monorepo/question-randomizer-dashboard-question-data-access';

@Component({
  selector: 'lib-question-list',
  imports: [
    CommonModule,
    EditQuestionComponent,
    TableComponent,
    InputTextComponent,
    ReactiveFormsModule,
    ColumnDirective,
    NormalizeSpacePipe,
  ],
  templateUrl: './question-list.component.html',
  styleUrl: './question-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    QuestionListFacade,
    QuestionListImportService,
    QuestionListExportService,
  ],
})
export class QuestionListComponent {
  private readonly questionListFacade = inject(QuestionListFacade);
  public questions = this.questionListFacade.questions;
  public sort = this.questionListFacade.sort;
  public questionToEdit?: Question = undefined;
  public categoryOptionItemList =
    this.questionListFacade.categoryOptionItemList;
  public qualificationOptionItemList =
    this.questionListFacade.qualificationOptionItemList;
  public searchTextControl = new FormControl('', {
    nonNullable: true,
  });

  public columns: IColumn[] = [
    { displayName: 'Question', propertyName: 'question', sortable: true },
    { displayName: 'Answer', propertyName: 'answer' },
    { displayName: 'Answer Pl', propertyName: 'answerPl' },
    { displayName: 'Category', propertyName: 'categoryName' },
    { displayName: 'Qualification', propertyName: 'qualificationName' },
    { displayName: 'Is active', propertyName: 'isActive' },
    { displayName: '', propertyName: 'options', width: '0' },
  ];

  public constructor() {
    toObservable(this.questionListFacade.searchText)
      .pipe(take(1))
      .subscribe((value) =>
        this.searchTextControl.setValue(value, { emitEvent: false })
      );
    this.searchTextControl.valueChanges
      .pipe(debounceTime(100), takeUntilDestroyed())
      .subscribe((value) => this.questionListFacade.setSearchText(value));
  }

  public onAdd() {
    this.questionToEdit = {
      id: '',
      question: '',
      answer: '',
      answerPl: '',
      isActive: true,
      userId: '',
    };
  }

  public onClose(editedQuestion?: EditQuestionFormValue) {
    if (editedQuestion) {
      if (this.questionToEdit?.id)
        this.questionListFacade.updateQuestion(
          this.questionToEdit.id,
          editedQuestion
        );
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

  onImport() {
    const element = document.getElementById('txtFileUpload');
    if (element) element.click();
  }

  public onExport(): void {
    this.questionListFacade.exportQuestions();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.name.endsWith('.csv')) {
      alert('Please import a valid .csv file.');
      input.value = '';
      return;
    }

    this.questionListFacade.importQuestionListFile(file);

    input.value = '';
  }
}
