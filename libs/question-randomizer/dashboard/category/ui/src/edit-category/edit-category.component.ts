import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { InputTextComponent } from '@my-nx-monorepo/shared-ui';
import {
  EditCategoryForm,
  EditCategoryFormValue,
} from '@my-nx-monorepo/question-randomizer-dashboard-category-util';

@Component({
  selector: 'lib-edit-category',
  imports: [CommonModule, InputTextComponent, ReactiveFormsModule],
  templateUrl: './edit-category.component.html',
  styleUrl: './edit-category.component.scss',
})
export class EditCategoryComponent {
  public save = output<EditCategoryFormValue>();
  private readonly fb = inject(FormBuilder);

  public form = this.fb.group<EditCategoryForm>({
    name: this.fb.control<string>('', { nonNullable: true }),
  });

  public onSubmit(): void {
    if (this.form.valid) {
      const category: EditCategoryFormValue = {
        name: this.form.controls.name.value,
      };
      this.save.emit(category);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
