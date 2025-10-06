import { inject, Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { InterviewStore } from '@my-nx-monorepo/question-randomizer-dashboard-interview-data-access';
import { QuestionListStore } from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { PageEvent, SortDefinition } from '@my-nx-monorepo/design-system-ui';
import { filter, take } from 'rxjs';

@Injectable()
export class InterviewShellFacade {
  private readonly interviewStore = inject(InterviewStore);
  private readonly questionListStore = inject(QuestionListStore);

  public sort = this.interviewStore.sort;
  public page = this.interviewStore.page;
  public questions = this.interviewStore.displayQuestions;
  public filteredCount = this.interviewStore.filteredCount;

  public initQuestions() {
    toObservable(this.questionListStore.entities)
      .pipe(filter(Boolean), take(1))
      .subscribe((questionDic) =>
        this.interviewStore.loadQuestionDic(questionDic)
      );
  }

  public setSearchText(searchText: string) {
    this.interviewStore.setSearchText(searchText);
  }

  public setSort(sort: SortDefinition<Question>) {
    this.interviewStore.setSort(sort);
  }

  public setPage(page: PageEvent) {
    this.interviewStore.setPage({ index: page.pageIndex, size: page.pageSize });
  }
}
