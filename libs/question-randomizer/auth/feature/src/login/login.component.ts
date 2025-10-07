import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { InputTextComponent } from '@worse-and-pricier/design-system-ui';
import { ReactiveFormsModule } from '@angular/forms';
import { EmailPasswordCredentials } from '@worse-and-pricier/question-randomizer-auth-util';
import { LoginFacade } from './login.facade';
import { LoginService } from '@worse-and-pricier/question-randomizer-auth-data-access';

@Component({
  selector: 'lib-login',
  imports: [InputTextComponent, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LoginFacade, LoginService],
})
export class LoginComponent {
  private readonly loginFacade = inject(LoginFacade);
  public form = this.loginFacade.form;

  public onSubmit(): void {
    if (this.form.valid) {
      const credentials: EmailPasswordCredentials = {
        email: this.form.controls.email.value,
        password: this.form.controls.password.value,
      };
      this.loginFacade.signInEmail(credentials);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
