import { Component, output } from '@angular/core';

import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'lib-dashboard-navigation-bar',
  imports: [SvgIconComponent],
  templateUrl: './dashboard-navigation-bar.component.html',
  styleUrl: './dashboard-navigation-bar.component.scss',
})
export class DashboardNavigationBarComponent {
  public logout = output<void>();
}
