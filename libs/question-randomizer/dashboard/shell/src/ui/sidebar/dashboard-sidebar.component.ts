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
  divider?: boolean;
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
  public currentLanguage = input.required<string /* TODO Language */>();
  public changeLanguage = output<string /* TODO Language */>();

  navItems: NavigationItem[] = [
    {
      label: 'Randomization',
      icon: 'repeat',
      route: 'randomization',
    },
    { label: 'Questions', icon: 'help-circle', route: 'questions' },
    { label: 'Categories', icon: 'tag', route: 'categories' },
    { label: 'Qualifications', icon: 'award', route: 'qualifications' },
    { label: 'Interview', icon: 'mic', route: 'interview', divider: true },
    { label: 'Settings', icon: 'settings', route: 'settings' },
  ];
}
