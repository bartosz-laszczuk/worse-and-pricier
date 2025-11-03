import { Injectable } from '@angular/core';
import {
  Category,
  EditQuestionFormValue,
  Qualification,
  Question,
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
    const tags = this.parseTagsString(formValue.tags);
    return {
      question: formValue.question,
      answer: formValue.answer,
      answerPl: formValue.answerPl,
      categoryId: formValue.categoryId,
      qualificationId: formValue.qualificationId ?? null,
      isActive: formValue.isActive,
      userId,
      tags: tags.length > 0 ? tags : undefined,
    };
  }

  public mapEditQuestionFormValueToUpdateQuestionRequest(
    formValue: EditQuestionFormValue,
    questionId: string
  ): UpdateQuestionRequest {
    const tags = this.parseTagsString(formValue.tags);
    return {
      id: questionId,
      question: formValue.question,
      answer: formValue.answer,
      answerPl: formValue.answerPl,
      categoryId: formValue.categoryId,
      qualificationId: formValue.qualificationId ?? null,
      isActive: formValue.isActive,
      tags: tags.length > 0 ? tags : undefined,
    };
  }

  public mapEditQuestionFormValueToQuestion(
    questionId: string,
    formValue: EditQuestionFormValue,
    userId: string
  ): Question {
    const tags = this.parseTagsString(formValue.tags);
    return {
      id: questionId,
      question: formValue.question,
      answer: formValue.answer,
      answerPl: formValue.answerPl,
      categoryId: formValue.categoryId,
      categoryName: formValue.categoryName,
      qualificationId: formValue.qualificationId,
      qualificationName: formValue.qualificationName,
      isActive: formValue.isActive,
      userId,
      tags: tags.length > 0 ? tags : undefined,
    };
  }

  private parseTagsString(tagsString: string): string[] {
    if (!tagsString || tagsString.trim() === '') {
      return [];
    }
    return tagsString
      .split(';')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
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
    const tags = this.parseTagsString(importItem.tags ?? '');
    return {
      id: questionId,
      question: importItem.question,
      answer: importItem.answer,
      answerPl: importItem.answerPl,
      categoryId,
      qualificationId,
      isActive: importItem.isActive,
      tags: tags.length > 0 ? tags : undefined,
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
    const tags = this.parseTagsString(importItem.tags ?? '');
    return {
      question: importItem.question,
      answer: importItem.answer,
      answerPl: importItem.answerPl,
      categoryId,
      qualificationId,
      isActive: importItem.isActive,
      userId,
      tags: tags.length > 0 ? tags : undefined,
    };
  }
}
