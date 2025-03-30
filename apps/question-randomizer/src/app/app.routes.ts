import { Route } from '@angular/router';
import { AuthCanActivate } from '@my-nx-monorepo/question-randomizer-shared-data-access';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    loadChildren: () =>
      import('@my-nx-monorepo/question-randomizer-auth-shell').then(
        (r) => r.questionRandomizerAuthShellRoutes
      ),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('@my-nx-monorepo/question-randomizer-dashboard-shell').then(
        (r) => r.questionRandomizerDashboardShellRoutes
      ),
  },
  // { path: '**', pathMatch: 'full', redirectTo: '/static/404' },
];
