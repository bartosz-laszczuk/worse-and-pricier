import { inject, Injectable } from '@angular/core';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';
import {
  CategoryListStore,
  QualificationListStore,
  QuestionListStore,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { forkJoin } from 'rxjs';

@Injectable()
export class DashboardShellFacade {
  private readonly userStore = inject(UserStore);
  private readonly questionListStore = inject(QuestionListStore);
  private readonly categoryListStore = inject(CategoryListStore);
  private readonly qualificationListStore = inject(QualificationListStore);

  public signOut() {
    this.userStore.signOut();
  }

  public loadLists() {
    forkJoin([
      this.categoryListStore.loadCategoryList(),
      this.qualificationListStore.loadQualificationList(),
    ]).subscribe(() =>
      this.questionListStore.loadQuestionList(
        this.categoryListStore.entities() ?? {},
        this.qualificationListStore.entities() ?? {}
      )
    );
  }
}
