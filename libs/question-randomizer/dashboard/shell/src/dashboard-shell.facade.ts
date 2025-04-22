import { inject, Injectable } from '@angular/core';
import { UserService } from '@my-nx-monorepo/question-randomizer-shared-data-access';
import {
  CategoryListService,
  CategoryListStore,
  QualificationListService,
  QualificationListStore,
  QuestionListService,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { Theme, ThemeService } from '@my-nx-monorepo/shared-styles';
import { forkJoin } from 'rxjs';

@Injectable()
export class DashboardShellFacade {
  private readonly userService = inject(UserService);
  private readonly questionListService = inject(QuestionListService);
  private readonly categoryListService = inject(CategoryListService);
  private readonly categoryListStore = inject(CategoryListStore);
  private readonly qualificationListService = inject(QualificationListService);
  private readonly qualificationListStore = inject(QualificationListStore);
  private readonly themeService = inject(ThemeService);

  public signOut() {
    this.userService.signOut();
  }

  public changeTheme(theme: Theme) {
    this.themeService.setTheme(theme);
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
