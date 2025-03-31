import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationFacade } from './registration.facade';
import { EmailPasswordCredentials } from '@my-nx-monorepo/question-randomizer-auth-util';
import { InputTextComponent } from '@my-nx-monorepo/shared-ui';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistrationService } from '@my-nx-monorepo/question-randomizer-auth-data-access';

@Component({
  selector: 'lib-registration',
  imports: [CommonModule, InputTextComponent, ReactiveFormsModule],
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
