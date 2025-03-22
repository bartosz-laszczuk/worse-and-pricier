import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextComponent } from '@my-nx-monorepo/shared-ui';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'lib-login',
  imports: [CommonModule, InputTextComponent, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  myForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^[a-zA-Z0-9]+$/),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  customErrorMessages = {
    required: 'This field cannot be empty!',
    minlength: 'Your username must be at least 3 characters long.',
    pattern: 'Only letters and numbers are allowed for the username.',
  };
}
