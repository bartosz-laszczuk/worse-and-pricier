import { Route } from '@angular/router';

export const questionRandomizerAuthShellRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('@my-projects-nx/question-randomizer/auth/feature/login').then(
        (x) => x.QuestionRandomizerAuthFeatureLoginComponent
      ),
    canActivate: [UnauthGuard],
  },
  {
    path: 'registration',
    loadChildren: () =>
      import(
        '@my-projects-nx/question-randomizer/auth/feature/registration'
      ).then((m) => m.QuestionRandomizerAuthFeatureRegistrationComponent),
    canActivate: [UnauthGuard],
  },
  {
    path: 'email-confirm',
    loadChildren: () =>
      import(
        '@my-projects-nx/question-randomizer/auth/feature/email-confirm'
      ).then((m) => m.QuestionRandomizerAuthFeatureEmailConfirmComponent),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'login',
  },
];
