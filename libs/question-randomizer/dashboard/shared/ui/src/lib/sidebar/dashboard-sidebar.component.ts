import { Component, computed, input, output } from '@angular/core';

import { RouterModule } from '@angular/router';
import {
  ButtonToggleComponent,
  ButtonToggleGroupComponent,
} from '@worse-and-pricier/design-system-ui';
import { SvgIconComponent } from 'angular-svg-icon';
import { TranslocoModule } from '@jsverse/transloco';

export interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  divider?: boolean;
}

@Component({
  selector: 'lib-dashboard-sidebar',
  imports: [
    RouterModule,
    ButtonToggleComponent,
    ButtonToggleGroupComponent,
    SvgIconComponent,
    TranslocoModule,
  ],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrl: './dashboard-sidebar.component.scss',
})
export class DashboardSidebarComponent {
  public currentLanguage = input.required<string>();
  public changeLanguage = output<string>();

  // Convert Transloco language codes (en/pl) to button toggle values (english/polish)
  public languageToggleValue = computed(() => {
    const lang = this.currentLanguage();
    return lang === 'en' ? 'english' : 'polish';
  });

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
    { label: 'AI Chat', icon: 'message-circle', route: 'ai-chat', divider: true },
    { label: 'Settings', icon: 'settings', route: 'settings' },
  ];
}
