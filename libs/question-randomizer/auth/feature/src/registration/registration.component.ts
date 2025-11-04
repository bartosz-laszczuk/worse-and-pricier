import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { RegistrationFacade } from './registration.facade';
import { EmailPasswordCredentials } from '@worse-and-pricier/question-randomizer-auth-util';
import { InputTextComponent } from '@worse-and-pricier/design-system-ui';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistrationService } from '@worse-and-pricier/question-randomizer-auth-data-access';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'lib-registration',
  imports: [InputTextComponent, ReactiveFormsModule, TranslocoModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
  providers: [RegistrationFacade, RegistrationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationComponent {
  private readonly registrationFacade = inject(RegistrationFacade);
  public form = this.registrationFacade.form;

  public onSubmit(): void {
    if (this.form.valid) {
      const credentials: EmailPasswordCredentials = {
        email: this.form.controls.email.value,
        password: this.form.controls.password.value,
      };
      this.registrationFacade.signUpEmail(credentials);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
