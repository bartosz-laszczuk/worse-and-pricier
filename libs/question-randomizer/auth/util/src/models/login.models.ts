import { FormControl } from '@angular/forms';

export interface EmailPasswordCredentials {
  email: string;
  password: string;
}

export interface User {
  uid: string;
  name?: string;
  photoURL?: string;
  email?: string;
  country?: string;
  about?: string;
  roleId?: string;
}

export interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}
