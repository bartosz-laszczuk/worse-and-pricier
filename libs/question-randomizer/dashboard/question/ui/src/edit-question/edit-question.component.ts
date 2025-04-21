import { Component, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  InputRichTextEditorComponent,
  InputSelectComponent,
  InputTextComponent,
} from '@my-nx-monorepo/shared-ui';
import {
  EditQuestionFormValue,
  Question,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { OptionItem } from '@my-nx-monorepo/shared-util';
import { QuillModule } from 'ngx-quill';

interface EditQuestionForm {
  question: FormControl<string>;
  answer: FormControl<string>;
  answerPl: FormControl<string>;
  categoryId: FormControl<string>;
  qualificationId: FormControl<string | null>;
  isActive: FormControl<boolean>;
}

@Component({
  selector: 'lib-edit-question',
  imports: [
    CommonModule,
    InputTextComponent,
    ReactiveFormsModule,
    InputSelectComponent,
    QuillModule,
    InputRichTextEditorComponent,
  ],
  templateUrl: './edit-question.component.html',
  styleUrl: './edit-question.component.scss',
})
export class EditQuestionComponent {
  public question = input.required<Question>();
  public categoryOptionItemList = input.required<OptionItem[]>();
  public qualificationOptionItemList = input.required<OptionItem[]>();
  public closed = output<EditQuestionFormValue | undefined>();
  private readonly fb = inject(FormBuilder);

  public form = this.fb.group<EditQuestionForm>({
    question: this.fb.control<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    answer: this.fb.control<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    answerPl: this.fb.control<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    categoryId: this.fb.control<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    qualificationId: this.fb.control<string | null>(null),
    isActive: this.fb.control<boolean>(true, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  public constructor() {
    effect(() => {
      const question = this.question();
      this.form.setValue({
        question: question.question,
        answer: question.answer,
        answerPl: question.answerPl,
        categoryId: question.categoryId ?? '',
        qualificationId: question.qualificationId ?? null,
        isActive: question.isActive,
      });
    });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      const categoryId = this.form.controls.categoryId.value;
      const qualificationId = this.form.controls.qualificationId.value;

      const question: EditQuestionFormValue = {
        question: this.form.controls.question.value,
        answer: this.form.controls.answer.value,
        answerPl: this.form.controls.answerPl.value,
        categoryId,
        categoryName:
          this.categoryOptionItemList().find(
            (category) => category.value === categoryId
          )?.label ?? '',
        qualificationId: qualificationId ?? undefined,
        qualificationName: this.qualificationOptionItemList().find(
          (qualification) => qualification.value === qualificationId
        )?.label,
        isActive: this.form.controls.isActive.value,
      };
      this.closed.emit(question);
    } else {
      this.form.markAllAsTouched();
    }
  }

  content = 'some content';
  placeholder = 'Write something...';
  onContentChanged(value: any) {
    console.log(value.html);
  }
}
