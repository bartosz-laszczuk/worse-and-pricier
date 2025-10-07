import { Injectable } from '@angular/core';
import {
  Category,
  EditQuestionFormValue,
  Qualification,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
import {
  CreateQuestionRequest,
  QuestionCsvListItem,
  UpdateQuestionRequest,
} from '../models';

@Injectable({ providedIn: 'root' })
export class QuestionMapperService {
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

  public mapQuestionCsvListItemToUpdateQuestionRequest(
    importItem: QuestionCsvListItem,
    questionId: string,
    categoryMap: Map<string, Category>,
    qualificationMap: Map<string, Qualification>
  ): UpdateQuestionRequest {
    const categoryId = categoryMap.get(importItem.categoryName)?.id ?? '';
    const qualificationId =
      qualificationMap.get(importItem.qualificationName)?.id ?? null;
    return {
      id: questionId,
      question: importItem.question,
      answer: importItem.answer,
      answerPl: importItem.answerPl,
      categoryId,
      qualificationId,
      isActive: importItem.isActive,
    };
  }

  public mapQuestionCsvListItemToCreateQuestionRequest(
    importItem: QuestionCsvListItem,
    userId: string,
    categoryMap: Map<string, Category>,
    qualificationMap: Map<string, Qualification>
  ): CreateQuestionRequest {
    const categoryId = categoryMap.get(importItem.categoryName)?.id ?? '';
    const qualificationId =
      qualificationMap.get(importItem.qualificationName)?.id ?? null;
    return {
      question: importItem.question,
      answer: importItem.answer,
      answerPl: importItem.answerPl,
      categoryId,
      qualificationId,
      isActive: importItem.isActive,
      userId,
    };
  }
}
