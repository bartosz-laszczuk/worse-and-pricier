import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ButtonToggleComponent,
  ButtonToggleGroupComponent,
} from '@my-nx-monorepo/shared-ui';
import { Theme } from '@my-nx-monorepo/shared-styles';
import { SvgIconComponent } from 'angular-svg-icon';

export interface NavigationItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'lib-dashboard-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    ButtonToggleComponent,
    ButtonToggleGroupComponent,
    SvgIconComponent,
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
      icon: 'repeat',
      route: 'randomization',
    },
    { label: 'Questions', icon: 'help-circle', route: 'questions' },
    { label: 'Categories', icon: 'tag', route: 'categories' },
    { label: 'Qualifications', icon: 'award', route: 'qualifications' },
    { label: 'Interview', icon: 'mic', route: 'interview' },
  ];
}
