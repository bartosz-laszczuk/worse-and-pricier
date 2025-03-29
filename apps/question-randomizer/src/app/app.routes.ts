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
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'randomization',
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
        loadChildren: () =>
          import(
            '@my-nx-monorepo/question-randomizer-randomization-shell'
          ).then((r) => r.questionRandomizerRandomizationShellRoutes),
        canActivate: [AuthCanActivate],
      },
      // {
      //   path: 'static',
      //   loadChildren: () =>
      //     import('../static/static.module').then((m) => m.StaticModule),
      // },
    ],
  },
  { path: '**', pathMatch: 'full', redirectTo: '/static/404' },
];
