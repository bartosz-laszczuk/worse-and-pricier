import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ButtonToggleComponent,
  ButtonToggleGroupComponent,
} from '@my-nx-monorepo/shared-ui';
import { Theme } from '@my-nx-monorepo/shared-styles';

export interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
}

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

  navItems: NavigationItem[] = [
    {
      label: 'Randomization',
      icon: 'grid',
      route: 'randomization',
    },
    { label: 'Questions', icon: 'tag', route: 'questions' },
    { label: 'Categories', icon: 'mail', route: 'categories' },
    { label: 'Qualifications', icon: 'calendar', route: 'qualifications' },
    { label: 'Interview', icon: 'file-text', route: 'interview' },
  ];
}
