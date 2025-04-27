import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ColumnDirective,
  IColumn,
  InputTextComponent,
  SortDefinition,
  TableComponent,
} from '@my-nx-monorepo/shared-ui';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InterviewShellFacade } from './interview-shell.facade';
import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { InterviewStore } from '@my-nx-monorepo/question-randomizer-dashboard-interview-data-access';

@Component({
  selector: 'lib-interview-shell',
  imports: [
    CommonModule,
    TableComponent,
    InputTextComponent,
    ReactiveFormsModule,
    ColumnDirective,
  ],
  templateUrl: './interview-shell.component.html',
  styleUrl: './interview-shell.component.scss',
  providers: [InterviewShellFacade, InterviewStore],
})
export class InterviewShellComponent {
  private readonly interviewShellFacade = inject(InterviewShellFacade);
  public questions = this.interviewShellFacade.questions;
  public sort = this.interviewShellFacade.sort;

  public searchTextControl = new FormControl('', {
    nonNullable: true,
  });
  public columns: IColumn[] = [
    { displayName: 'Question', propertyName: 'question', width: '200px' },
    { displayName: 'Answer', propertyName: 'answer' },
  ];

  public constructor() {
    this.interviewShellFacade.initQuestions();
    this.searchTextControl.valueChanges
      .pipe(debounceTime(50), takeUntilDestroyed())
      .subscribe((value) => this.interviewShellFacade.setSearchText(value));
  }

  public onSort(sort: SortDefinition<Question>): void {
    this.interviewShellFacade.setSort(sort);
  }
}
