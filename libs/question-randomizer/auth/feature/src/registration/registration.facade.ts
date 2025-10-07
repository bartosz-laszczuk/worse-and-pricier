import { inject, Injectable } from '@angular/core';
import { RegistrationService } from '@worse-and-pricier/question-randomizer-auth-data-access';
import { EmailPasswordCredentials } from '@worse-and-pricier/question-randomizer-auth-util';
import { UserService } from '@worse-and-pricier/question-randomizer-shared-data-access';

@Injectable()
export class RegistrationFacade {
  private readonly registrationService = inject(RegistrationService);
  private readonly userService = inject(UserService);

  public form = this.registrationService.form;

  public signUpEmail(credentials: EmailPasswordCredentials) {
    this.userService.signUpEmail(credentials);
  }
}
