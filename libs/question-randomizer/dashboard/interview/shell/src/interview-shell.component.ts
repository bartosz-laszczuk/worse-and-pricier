import { Component, inject } from '@angular/core';

import {
  ColumnDirective,
  IColumn,
  InputTextComponent,
  PageEvent,
  SortDefinition,
  TableComponent,
} from '@worse-and-pricier/design-system-ui';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { InterviewShellFacade } from './interview-shell.facade';
import {
  FormatTagsPipe,
  NormalizeSpacePipe,
  Question,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
import { InterviewStore } from '@worse-and-pricier/question-randomizer-dashboard-interview-data-access';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'lib-interview-shell',
  imports: [
    TableComponent,
    InputTextComponent,
    ReactiveFormsModule,
    ColumnDirective,
    NormalizeSpacePipe,
    FormatTagsPipe,
  ],
  templateUrl: './interview-shell.component.html',
  styleUrl: './interview-shell.component.scss',
  providers: [InterviewShellFacade, InterviewStore],
})
export class InterviewShellComponent {
  private readonly interviewShellFacade = inject(InterviewShellFacade);
  private readonly translocoService = inject(TranslocoService);

  public questions = this.interviewShellFacade.questions;
  public filteredCount = this.interviewShellFacade.filteredCount;
  public sort = this.interviewShellFacade.sort;
  public page = this.interviewShellFacade.page;

  public searchTextControl = new FormControl('', {
    nonNullable: true,
  });
  public columns: IColumn[] = [
    { displayName: 'Question', propertyName: 'question', width: '200px' },
    { displayName: 'Answer', propertyName: 'answer' },
  ];

  // Language-aware answer selection
  public currentLanguage = toSignal(this.translocoService.langChanges$, {
    initialValue: this.translocoService.getActiveLang(),
  });

  public constructor() {
    this.interviewShellFacade.initQuestions();
    this.searchTextControl.valueChanges
      .pipe(debounceTime(50), takeUntilDestroyed())
      .subscribe((value) => this.interviewShellFacade.setSearchText(value));
  }

  public onSort(sort: SortDefinition<Question>): void {
    this.interviewShellFacade.setSort(sort);
  }

  public onPage(page: PageEvent): void {
    this.interviewShellFacade.setPage(page);
  }

  public getAnswer(question: Question): string {
    const language = this.currentLanguage();
    return language === 'pl' ? question.answerPl : question.answer;
  }
}
