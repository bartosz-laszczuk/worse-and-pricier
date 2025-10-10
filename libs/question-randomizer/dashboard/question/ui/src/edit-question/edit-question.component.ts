import { Component, inject } from '@angular/core';

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
} from '@worse-and-pricier/design-system-ui';
import {
  EditQuestionFormValue,
  Question,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
import { OptionItem } from '@worse-and-pricier/design-system-ui';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

export interface EditQuestionDialogData {
  question: Question;
  categoryOptionItemList: OptionItem[];
  qualificationOptionItemList: OptionItem[];
}

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
    InputTextComponent,
    ReactiveFormsModule,
    InputSelectComponent,
    InputRichTextEditorComponent
  ],
  templateUrl: './edit-question.component.html',
  styleUrl: './edit-question.component.scss',
})
export class EditQuestionComponent {
  private readonly dialogData = inject(DIALOG_DATA) as EditQuestionDialogData;
  private readonly dialogRef = inject(DialogRef<EditQuestionFormValue | undefined>);
  private readonly fb = inject(FormBuilder);

  // Initialize once - no getters to avoid re-execution on every change detection
  public readonly categoryOptionItemList: OptionItem[];
  public readonly qualificationOptionItemList: OptionItem[];

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
    // Initialize data from dialog once
    this.categoryOptionItemList = this.dialogData.categoryOptionItemList;
    this.qualificationOptionItemList = this.dialogData.qualificationOptionItemList;

    // Set form values once
    const question = this.dialogData.question;
    this.form.setValue({
      question: question.question,
      answer: question.answer,
      answerPl: question.answerPl,
      categoryId: question.categoryId ?? '',
      qualificationId: question.qualificationId ?? null,
      isActive: question.isActive,
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
          this.categoryOptionItemList.find(
            (category) => category.value === categoryId
          )?.label ?? '',
        qualificationId: qualificationId ?? undefined,
        qualificationName: this.qualificationOptionItemList.find(
          (qualification) => qualification.value === qualificationId
        )?.label,
        isActive: this.form.controls.isActive.value,
      };

      this.dialogRef.close(question);
    } else {
      this.form.markAllAsTouched();
    }
  }

  public onCancel(): void {
    this.dialogRef.close(undefined);
  }
}
