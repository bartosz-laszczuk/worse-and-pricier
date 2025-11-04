import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { DashboardShellFacade } from './dashboard-shell.facade';
import {
  CategoryListService,
  CategoryListStore,
  PostponedQuestionListService,
  QualificationListService,
  QualificationListStore,
  QuestionListService,
  QuestionListStore,
  RandomizationService,
  RandomizationStore,
  SelectedCategoryListService,
  UsedQuestionListService,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-data-access';
import {
  DashboardSidebarComponent,
  DashboardHeaderComponent,
  DashboardNavigationBarComponent,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-ui';

@Component({
  selector: 'lib-dashboard-shell',
  imports: [
    RouterModule,
    DashboardSidebarComponent,
    DashboardHeaderComponent,
    DashboardNavigationBarComponent,
  ],
  templateUrl: './dashboard-shell.component.html',
  styleUrl: './dashboard-shell.component.scss',
  providers: [
    DashboardShellFacade,
    CategoryListStore,
    QualificationListStore,
    QuestionListStore,
    RandomizationStore,
    CategoryListService,
    QualificationListService,
    QuestionListService,
    RandomizationService,
    UsedQuestionListService,
    SelectedCategoryListService,
    PostponedQuestionListService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardShellComponent {
  private readonly dashboardShellFacade = inject(DashboardShellFacade);
  public currentLanguage = this.dashboardShellFacade.currentLanguage;

  constructor() {
    this.dashboardShellFacade.loadLists();
  }

  public onChangeLanguage(language: string) {
    this.dashboardShellFacade.changeLanguage(language);
  }

  public onSignOut() {
    this.dashboardShellFacade.signOut();
  }
}
