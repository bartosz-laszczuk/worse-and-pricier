import { Route } from '@angular/router';
import {
  AuthCanActivate,
  AuthVerifiedCanActivate,
  UnauthCanActivate,
} from '@my-nx-monorepo/question-randomizer-shared-data-access';
import { ShellComponent } from './shell.component';

export const questionRandomizerAuthShellRoutes: Route[] = [
  {
    path: 'email',
    children: [
      {
        path: 'verify',
        loadComponent: () =>
          import('@my-nx-monorepo/question-randomizer-auth-feature').then(
            (x) => x.EmailVerifyComponent
          ),
      },
      {
        path: 'verified',
        loadComponent: () =>
          import('@my-nx-monorepo/question-randomizer-auth-feature').then(
            (x) => x.EmailVerifiedComponent
          ),
        canActivate: [AuthVerifiedCanActivate],
      },
      {
        path: 'not-verified',
        loadComponent: () =>
          import('@my-nx-monorepo/question-randomizer-auth-feature').then(
            (x) => x.EmailNotVerifiedComponent
          ),
        canActivate: [AuthCanActivate],
      },
    ],
  },
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('@my-nx-monorepo/question-randomizer-auth-feature').then(
            (x) => x.LoginComponent
          ),
        canActivate: [UnauthCanActivate],
      },
      {
        path: 'registration',
        loadComponent: () =>
          import('@my-nx-monorepo/question-randomizer-auth-feature').then(
            (x) => x.RegistrationComponent
          ),
        canActivate: [UnauthCanActivate],
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'login',
      },
    ],
  },
];
