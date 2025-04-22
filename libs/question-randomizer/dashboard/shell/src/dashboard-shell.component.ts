import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardShellFacade } from './dashboard-shell.facade';
import {
  CategoryListService,
  CategoryListStore,
  QualificationListService,
  QualificationListStore,
  QuestionListService,
  QuestionListStore,
  RandomizationStore,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { Theme } from '@my-nx-monorepo/shared-styles';

@Component({
  selector: 'lib-dashboard-shell',
  imports: [CommonModule, RouterModule],
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardShellComponent {
  private readonly dashboardShellFacade = inject(DashboardShellFacade);

  constructor() {
    this.dashboardShellFacade.loadLists();
  }

  public onChangeTheme(theme: Theme) {
    this.dashboardShellFacade.changeTheme(theme);
  }

  public onSignOut() {
    this.dashboardShellFacade.signOut();
  }
}
