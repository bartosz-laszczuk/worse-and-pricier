import { inject, Injectable } from '@angular/core';
import { RegistrationService } from '@my-nx-monorepo/question-randomizer-auth-data-access';
import { EmailPasswordCredentials } from '@my-nx-monorepo/question-randomizer-auth-util';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';

@Injectable()
export class RegistrationFacade {
  private readonly registrationService = inject(RegistrationService);
  private readonly userStore = inject(UserStore);

  public form = this.registrationService.form;

  public signUpEmail(credentials: EmailPasswordCredentials) {
    this.userStore.signUpEmail(credentials);
  }
}
