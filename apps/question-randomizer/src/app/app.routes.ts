import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard/randomization',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('@my-nx-monorepo/question-randomizer-auth-shell').then(
        (r) => r.authShellRoutes
      ),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('@my-nx-monorepo/question-randomizer-dashboard-shell').then(
        (r) => r.dashboardShellRoutes
      ),
  },
  // { path: '**', pathMatch: 'full', redirectTo: '/static/404' },
];
