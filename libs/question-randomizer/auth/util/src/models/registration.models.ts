import { FormControl } from '@angular/forms';

export interface RegistrationForm {
  email: FormControl<string>;
  password: FormControl<string>;
  passwordRepeat: FormControl<string>;
}
