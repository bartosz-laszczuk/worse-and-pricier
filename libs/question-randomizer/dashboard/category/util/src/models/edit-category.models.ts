import { FormControl } from '@angular/forms';

export interface EditCategoryForm {
  name: FormControl<string>;
}

export interface EditCategoryFormValue {
  name: string;
}
