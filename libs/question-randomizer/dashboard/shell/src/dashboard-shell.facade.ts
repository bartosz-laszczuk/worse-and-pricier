import { inject, Injectable, signal } from '@angular/core';
import { UserService } from '@worse-and-pricier/question-randomizer-shared-data-access';
import {
  CategoryListService,
  CategoryListStore,
  QualificationListService,
  QualificationListStore,
  QuestionListService,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-data-access';
import { forkJoin } from 'rxjs';

@Injectable()
export class DashboardShellFacade {
  private readonly userService = inject(UserService);
  private readonly questionListService = inject(QuestionListService);
  private readonly categoryListService = inject(CategoryListService);
  private readonly categoryListStore = inject(CategoryListStore);
  private readonly qualificationListService = inject(QualificationListService);
  private readonly qualificationListStore = inject(QualificationListStore);

  public currentLanguage = signal('english'); // TODO this.languageService.currentLanguage;

  public signOut() {
    this.userService.signOut();
  }

  public changeLanguage(language: string /* TODO Language */) {
    // this.languageService.setLanguage(language);
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
