import { Injectable } from '@angular/core';
import { EditQuestionFormValue } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { CreateQuestionRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class QuestionListMapperService {
  public mapEditQuestionFormValueToCreateQuestionRequest(
    formValue: EditQuestionFormValue,
    userId: string
  ): CreateQuestionRequest {
    return {
      question: formValue.question,
      answer: formValue.answer,
      answerPl: formValue.answerPl,
      categoryId: formValue.categoryId,
      qualificationId: formValue.qualificationId ?? null,
      isActive: formValue.isActive,
      userId,
    };
  }
}
