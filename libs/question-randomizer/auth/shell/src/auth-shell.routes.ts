import { Route } from '@angular/router';
import {
  AuthCanActivate,
  AuthVerifiedCanActivate,
  UnauthCanActivate,
} from '@worse-and-pricier/question-randomizer-shared-data-access';
import { AuthShellComponent } from './auth-shell.component';

export const authShellRoutes: Route[] = [
  {
    path: 'email',
    children: [
      {
        path: 'verify',
        loadComponent: () =>
          import('@worse-and-pricier/question-randomizer-auth-feature').then(
            (x) => x.EmailVerifyComponent
          ),
      },
      {
        path: 'verified',
        loadComponent: () =>
          import('@worse-and-pricier/question-randomizer-auth-feature').then(
            (x) => x.EmailVerifiedComponent
          ),
        canActivate: [AuthVerifiedCanActivate],
      },
      {
        path: 'not-verified',
        loadComponent: () =>
          import('@worse-and-pricier/question-randomizer-auth-feature').then(
            (x) => x.EmailNotVerifiedComponent
          ),
        canActivate: [AuthCanActivate],
      },
    ],
  },
  {
    path: '',
    component: AuthShellComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('@worse-and-pricier/question-randomizer-auth-feature').then(
            (x) => x.LoginComponent
          ),
        canActivate: [UnauthCanActivate],
      },
      {
        path: 'registration',
        loadComponent: () =>
          import('@worse-and-pricier/question-randomizer-auth-feature').then(
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
