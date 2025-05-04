import { Injectable } from '@angular/core';
import {
  Category,
  Qualification,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';

@Injectable()
export class QuestionListExportService {
  public exportQuestionList(
    categoryDic: Record<string, Category>,
    qualificationDic: Record<string, Qualification>
  ) {}
}
