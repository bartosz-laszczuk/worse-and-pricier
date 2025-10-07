import { inject, Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LoginForm } from '@worse-and-pricier/question-randomizer-auth-util';

@Injectable()
export class LoginService {
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
}
