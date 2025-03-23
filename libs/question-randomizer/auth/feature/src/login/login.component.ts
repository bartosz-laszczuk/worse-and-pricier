import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextComponent } from '@my-nx-monorepo/shared-ui';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EmailPasswordCredentials } from '@my-nx-monorepo/question-randomizer-auth-util';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'lib-login',
  imports: [CommonModule, InputTextComponent, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);

  public form = this.fb.group<LoginForm>({
    email: this.fb.control<string>('', {
      validators: [
        Validators.required,
        Validators.maxLength(128),
        Validators.email,
      ],
      nonNullable: true,
    }),
    password: this.fb.control<string>('', {
      validators: [Validators.required, Validators.maxLength(128)],
      nonNullable: true,
    }),
  });

  public onSubmit(): void {
    if (this.form.valid) {
      const credentials: EmailPasswordCredentials = {
        email: this.form.controls.email.value,
        password: this.form.controls.password.value,
      };
      // @my-projects-nx/question-randomizer/auth/data-access/store
      // this.store.dispatch(signInEmail({ credentials }));
    } else {
      this.form.markAllAsTouched();
    }
  }
}
