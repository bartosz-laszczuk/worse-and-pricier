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
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { DashboardSidebarComponent } from './ui/sidebar/dashboard-sidebar.component';
import { DashboardHeaderComponent } from './ui/header/dashboard-header.component';
import { DashboardNavigationBarComponent } from './ui/navigation-bar/dashboard-navigation-bar.component';

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

  public onChangeLanguage(language: string /* TODO Language */) {
    this.dashboardShellFacade.changeLanguage(language);
  }

  public onSignOut() {
    this.dashboardShellFacade.signOut();
  }
}
