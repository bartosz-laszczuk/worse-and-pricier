import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardShellFacade } from './dashboard-shell.facade';
import {
  CategoryListStore,
  QualificationListStore,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';

@Component({
  selector: 'lib-dashboard-shell',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-shell.component.html',
  styleUrl: './dashboard-shell.component.scss',
  providers: [DashboardShellFacade, CategoryListStore, QualificationListStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardShellComponent {
  private readonly dashboardShellFacade = inject(DashboardShellFacade);

  public onSignOut() {
    this.dashboardShellFacade.signOut();
  }
}
