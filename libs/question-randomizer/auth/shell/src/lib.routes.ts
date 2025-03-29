import { Route } from '@angular/router';
import { AuthCanActivate } from '@my-nx-monorepo/question-randomizer-shared-data-access';

export const questionRandomizerAuthShellRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('@my-nx-monorepo/question-randomizer-auth-feature').then(
        (x) => x.LoginComponent
      ),
    canActivate: [AuthCanActivate],
  },
  // {
  //   path: 'registration',
  //   loadChildren: () =>
  //     import(
  //       '@my-projects-nx/question-randomizer/auth/feature/registration'
  //     ).then((m) => m.QuestionRandomizerAuthFeatureRegistrationComponent),
  //   canActivate: [UnauthGuard],
  // },
  // {
  //   path: 'email-confirm',
  //   loadChildren: () =>
  //     import(
  //       '@my-projects-nx/question-randomizer/auth/feature/email-confirm'
  //     ).then((m) => m.QuestionRandomizerAuthFeatureEmailConfirmComponent),
  //   canActivate: [AuthGuard],
  // },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'login',
  },
];
