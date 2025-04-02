import { Component, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputTextComponent } from '@my-nx-monorepo/shared-ui';
import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';

interface EditQuestionForm {
  name: FormControl<string>;
}

@Component({
  selector: 'lib-edit-question',
  imports: [CommonModule, InputTextComponent, ReactiveFormsModule],
  templateUrl: './edit-question.component.html',
  styleUrl: './edit-question.component.scss',
})
export class EditQuestionComponent {
  public question = input.required<Question>();
  public closed = output<Question | undefined>();
  private readonly fb = inject(FormBuilder);

  public form = this.fb.group<EditQuestionForm>({
    name: this.fb.control<string>('', { nonNullable: true }),
  });

  public constructor() {
    effect(() => {
      this.form.setValue({ name: this.question().name });
    });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      const question: Question = {
        ...this.question(),
        name: this.form.controls.name.value,
      };
      this.closed.emit(question);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
