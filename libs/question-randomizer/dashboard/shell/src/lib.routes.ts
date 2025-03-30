import { Route } from '@angular/router';
import { ShellComponent } from './shell.component';
import {
  AuthCanActivate,
  AuthVerifiedCanActivate,
} from '@my-nx-monorepo/question-randomizer-shared-data-access';

export const questionRandomizerDashboardShellRoutes: Route[] = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard/randomization',
      },
      // {
      //   path: 'questions',
      //   loadChildren: () =>
      //     import('../questions/questions.module').then(
      //       (m) => m.QuestionsModule
      //     ),
      //   canActivate: [AuthCanActivate],
      // },
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
            '@my-nx-monorepo/question-randomizer-dashboard-randomization-feature'
          ).then((r) => r.RandomizationDisplayComponent),
        canActivate: [AuthVerifiedCanActivate],
      },
      {
        path: 'email-not-verified',
        loadComponent: () =>
          import(
            '@my-nx-monorepo/question-randomizer-dashboard-shared-ui'
          ).then((r) => r.EmailNotVerifiedComponent),
        canActivate: [AuthCanActivate],
      },
      // {
      //   path: 'static',
      //   loadChildren: () =>
      //     import('../static/static.module').then((m) => m.StaticModule),
      // },
    ],
  },
];
