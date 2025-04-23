import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ButtonToggleComponent,
  ButtonToggleGroupComponent,
} from '@my-nx-monorepo/shared-ui';
import { Theme } from '@my-nx-monorepo/shared-styles';

@Component({
  selector: 'lib-dashboard-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    ButtonToggleComponent,
    ButtonToggleGroupComponent,
  ],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrl: './dashboard-sidebar.component.scss',
})
export class DashboardSidebarComponent {
  public currentTheme = input.required<Theme>();
  public changeTheme = output<Theme>();
}
