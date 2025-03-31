import { Route } from '@angular/router';
import { AuthVerifiedCanActivate } from '@my-nx-monorepo/question-randomizer-shared-data-access';
import { DashboardShellComponent } from './dashboard-shell.component';

export const dashboardShellRoutes: Route[] = [
  {
    path: '',
    component: DashboardShellComponent,
    canActivate: [AuthVerifiedCanActivate],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'randomization',
      },
      {
        path: 'questions',
        loadComponent: () =>
          import(
            '@my-nx-monorepo/question-randomizer-dashboard-question-feature'
          ).then((r) => r.QuestionListComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import(
            '@my-nx-monorepo/question-randomizer-dashboard-category-feature'
          ).then((r) => r.CategoryListComponent),
      },
      {
        path: 'qualifications',
        loadComponent: () =>
          import(
            '@my-nx-monorepo/question-randomizer-dashboard-qualification-feature'
          ).then((r) => r.QualificationListComponent),
      },
      {
        path: 'interview',
        loadComponent: () =>
          import(
            '@my-nx-monorepo/question-randomizer-dashboard-interview-shell'
          ).then((r) => r.InterviewShellComponent),
      },
      // {
      //   path: 'settings',
      //   loadComponent: () =>
      //     import('../settings/settings.component').then(
      //       (m) => m.SettingsComponent
      //     ),
      //   canActivate: [AuthCanActivate],
      // },
      {
        path: 'randomization',
        loadComponent: () =>
          import(
            '@my-nx-monorepo/question-randomizer-dashboard-randomization-shell'
          ).then((r) => r.RandomizationShellComponent),
      },
      // {
      //   path: 'static',
      //   loadChildren: () =>
      //     import('../static/static.module').then((m) => m.StaticModule),
      // },
    ],
  },
];
