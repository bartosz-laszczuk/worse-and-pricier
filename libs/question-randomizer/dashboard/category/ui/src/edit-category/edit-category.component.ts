import { Component, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputTextComponent } from '@my-nx-monorepo/shared-ui';
import { Category } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';

interface EditCategoryForm {
  name: FormControl<string>;
}

@Component({
  selector: 'lib-edit-category',
  imports: [CommonModule, InputTextComponent, ReactiveFormsModule],
  templateUrl: './edit-category.component.html',
  styleUrl: './edit-category.component.scss',
})
export class EditCategoryComponent {
  public category = input.required<Category>();
  public closed = output<Category | undefined>();
  private readonly fb = inject(FormBuilder);

  public form = this.fb.group<EditCategoryForm>({
    name: this.fb.control<string>('', { nonNullable: true }),
  });

  public constructor() {
    effect(() => {
      this.form.setValue({ name: this.category().name });
    });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      const category: Category = {
        ...this.category(),
        name: this.form.controls.name.value,
      };
      this.closed.emit(category);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
