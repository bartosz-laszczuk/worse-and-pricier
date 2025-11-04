import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'lib-dashboard-header',
  imports: [TranslocoModule],
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.scss',
})
export class DashboardHeaderComponent {
  private readonly router = inject(Router);

  // Track current route segment
  private readonly currentRoute = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.extractRouteSegment()),
      startWith(this.extractRouteSegment())
    ),
    { initialValue: 'randomization' }
  );

  // Compute translation key based on route
  readonly moduleTitle = computed(() => {
    const route = this.currentRoute();
    return `dashboard.navigation.${route}`;
  });

  private extractRouteSegment(): string {
    // Extract the last segment from /dashboard/[segment]
    const urlSegments = this.router.url.split('/').filter(Boolean);
    const segment = urlSegments[urlSegments.length - 1];

    // Valid dashboard routes
    const validRoutes = [
      'randomization',
      'questions',
      'categories',
      'qualifications',
      'interview',
      'settings',
    ];

    return validRoutes.includes(segment) ? segment : 'randomization';
  }
}
