import { Route } from '@angular/router';
import {
  AuthCanActivate,
  UnauthCanActivate,
} from '@my-nx-monorepo/question-randomizer-shared-data-access';
import { ShellComponent } from './shell.component';

export const questionRandomizerAuthShellRoutes: Route[] = [
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
        path: 'email-confirm',
        loadComponent: () =>
          import('@my-nx-monorepo/question-randomizer-auth-feature').then(
            (x) => x.EmailConfigComponent
          ),
        canActivate: [AuthCanActivate],
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'login',
      },
    ],
  },
];
