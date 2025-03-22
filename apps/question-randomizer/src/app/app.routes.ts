import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    loadChildren: () =>
      import('@my-nx-monorepo/question-randomizer-auth-shell').then(
        (r) => r.questionRandomizerAuthShellRoutes
      ),
  },
  //   {
  //     path: '',
  //     children: [
  //       {
  //         path: '',
  //         pathMatch: 'full',
  //         redirectTo: 'randomization',
  //       },
  //       {
  //         path: 'questions',
  //         loadChildren: () =>
  //           import('../questions/questions.module').then(
  //             (m) => m.QuestionsModule
  //           ),
  //         canActivate: [AuthCanActivate],
  //       },
  //       {
  //         path: 'settings',
  //         loadComponent: () =>
  //           import('../settings/settings.component').then(
  //             (m) => m.SettingsComponent
  //           ),
  //         canActivate: [AuthCanActivate],
  //       },
  //       // {
  //       //   path: 'demo',
  //       //   loadChildren: () =>
  //       //     import('../demo/demo.module').then((m) => m.DemoModule),
  //       // },
  //       // {
  //       //   path: 'auth',
  //       //   loadChildren: () =>
  //       //     import('../auth/auth.module').then((m) => m.AuthModule),
  //       // },
  //       {
  //         path: 'randomization',
  //         loadChildren: () =>
  //           import('../randomization/randomization.module').then(
  //             (m) => m.RandomizationModule
  //           ),
  //         canActivate: [AuthCanActivate],
  //       },
  //       {
  //         path: 'static',
  //         loadChildren: () =>
  //           import('../static/static.module').then((m) => m.StaticModule),
  //       },
  //     ],
  //   },
  //   { path: '**', pathMatch: 'full', redirectTo: '/static/404' },
];
