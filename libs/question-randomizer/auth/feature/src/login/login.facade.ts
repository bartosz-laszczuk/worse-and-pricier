import { inject, Injectable } from '@angular/core';
import {
  UserStore,
  LoginService,
} from '@my-nx-monorepo/question-randomizer-auth-data-access';
import { EmailPasswordCredentials } from '@my-nx-monorepo/question-randomizer-auth-util';

@Injectable()
export class LoginFacade {
  private readonly loginService = inject(LoginService);
  private readonly userStore = inject(UserStore);

  public form = this.loginService.form;

  public signInEmail(credentials: EmailPasswordCredentials) {
    this.loginService.signInEmail(credentials);
  }
}
