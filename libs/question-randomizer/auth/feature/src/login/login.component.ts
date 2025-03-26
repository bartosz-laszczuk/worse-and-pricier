import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextComponent } from '@my-nx-monorepo/shared-ui';
import { ReactiveFormsModule } from '@angular/forms';
import { EmailPasswordCredentials } from '@my-nx-monorepo/question-randomizer-auth-util';
import { LoginFacade } from './login.facade';
import { LoginService } from '@my-nx-monorepo/question-randomizer-auth-data-access';

@Component({
  selector: 'lib-login',
  imports: [CommonModule, InputTextComponent, ReactiveFormsModule],
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
      // @my-projects-nx/question-randomizer/auth/data-access/store
      // this.store.dispatch(signInEmail({ credentials }));
      this.loginFacade.signInEmail(credentials);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
