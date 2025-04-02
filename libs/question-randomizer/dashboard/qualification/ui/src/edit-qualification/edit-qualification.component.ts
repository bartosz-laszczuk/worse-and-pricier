import { Component, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputTextComponent } from '@my-nx-monorepo/shared-ui';
import { Qualification } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';

interface EditQualificationForm {
  name: FormControl<string>;
}

@Component({
  selector: 'lib-edit-qualification',
  imports: [CommonModule, InputTextComponent, ReactiveFormsModule],
  templateUrl: './edit-qualification.component.html',
  styleUrl: './edit-qualification.component.scss',
})
export class EditQualificationComponent {
  public qualification = input.required<Qualification>();
  public closed = output<Qualification | undefined>();
  private readonly fb = inject(FormBuilder);

  public form = this.fb.group<EditQualificationForm>({
    name: this.fb.control<string>('', { nonNullable: true }),
  });

  public constructor() {
    effect(() => {
      this.form.setValue({ name: this.qualification().name });
    });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      const qualification: Qualification = {
        ...this.qualification(),
        name: this.form.controls.name.value,
      };
      this.closed.emit(qualification);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
