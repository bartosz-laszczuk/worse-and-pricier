import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  EditQuestionFormValue,
  Question,
  StripHtmlPipe,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { QuestionListFacade } from './question-list.facade';
import { EditQuestionComponent } from '@my-nx-monorepo/question-randomizer-dashboard-question-ui';
import {
  ColumnDirective,
  IColumn,
  InputTextComponent,
  PageEvent,
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
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'lib-question-list',
  imports: [
    CommonModule,
    EditQuestionComponent,
    TableComponent,
    InputTextComponent,
    ReactiveFormsModule,
    ColumnDirective,
    SvgIconComponent,
    StripHtmlPipe,
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
  public page = this.questionListFacade.page;
  public questionToEdit?: Question = undefined;
  public categoryOptionItemList =
    this.questionListFacade.categoryOptionItemList;
  public qualificationOptionItemList =
    this.questionListFacade.qualificationOptionItemList;
  public searchTextControl = new FormControl('', {
    nonNullable: true,
  });
  public filteredCount = this.questionListFacade.filteredCount;

  public columns: IColumn[] = [
    {
      displayName: 'Question',
      propertyName: 'question',
      sortable: true,
      width: '30%',
    },
    { displayName: 'Answer', propertyName: 'answer', width: '25%' },
    { displayName: 'Category', propertyName: 'categoryName' },
    { displayName: 'Qualification', propertyName: 'qualificationName' },
    {
      displayName: 'Active',
      propertyName: 'isActive',
      width: '5.5rem',
      center: true,
    },
    { displayName: '', propertyName: 'edit', width: '3.5rem', center: true },
    { displayName: '', propertyName: 'delete', width: '3.5rem', center: true },
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

  public onPage(page: PageEvent) {
    this.questionListFacade.setPage(page);
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
