import { inject, Injectable } from '@angular/core';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';
import {
  CategoryListService,
  CategoryListStore,
  QualificationListService,
  QualificationListStore,
  QuestionListService,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { forkJoin } from 'rxjs';

@Injectable()
export class DashboardShellFacade {
  private readonly userStore = inject(UserStore);
  private readonly questionListService = inject(QuestionListService);
  private readonly categoryListService = inject(CategoryListService);
  private readonly categoryListStore = inject(CategoryListStore);
  private readonly qualificationListService = inject(QualificationListService);
  private readonly qualificationListStore = inject(QualificationListStore);

  public signOut() {
    this.userStore.signOut();
  }

  public loadLists() {
    forkJoin([
      this.categoryListService.loadCategoryList(),
      this.qualificationListService.loadQualificationList(),
    ]).subscribe(() =>
      this.questionListService.loadQuestionList(
        this.categoryListStore.entities() ?? {},
        this.qualificationListStore.entities() ?? {}
      )
    );
  }
}
