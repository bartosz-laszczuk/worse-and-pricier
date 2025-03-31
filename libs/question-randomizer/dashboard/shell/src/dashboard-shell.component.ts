import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardShellFacade } from './dashboard-shell.facade';

@Component({
  selector: 'lib-dashboard-shell',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-shell.component.html',
  styleUrl: './dashboard-shell.component.scss',
  providers: [DashboardShellFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardShellComponent {
  private readonly shellFacade = inject(DashboardShellFacade);

  public onSignOut() {
    this.shellFacade.signOut();
  }
}
