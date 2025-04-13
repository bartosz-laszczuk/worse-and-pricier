import { inject, Injectable } from '@angular/core';
import { LoginService } from '@my-nx-monorepo/question-randomizer-auth-data-access';
import { EmailPasswordCredentials } from '@my-nx-monorepo/question-randomizer-auth-util';
import { UserService } from '@my-nx-monorepo/question-randomizer-shared-data-access';

@Injectable()
export class LoginFacade {
  private readonly loginService = inject(LoginService);
  private readonly userService = inject(UserService);

  public form = this.loginService.form;

  public signInEmail(credentials: EmailPasswordCredentials) {
    this.userService.signInEmail(credentials);
  }
}
