import { Injectable } from '@angular/core';
import { GetRandomizationResponse } from '../models';
import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { Randomization } from '@my-nx-monorepo/question-randomizer-dashboard-randomization-util';

@Injectable({ providedIn: 'root' })
export class RandomizationMapperService {
  public mapGetRandomizationResopnseToRandomization(
    response: GetRandomizationResponse,
    usedQuestionIdList: string[],
    selectedCategoryIdList: string[],
    currentQuestion?: Question
  ): Randomization {
    return {
      id: response.id,
      status: response.status,
      isAnswerHidden: response.isAnswerHidden,
      currentQuestion,
      usedQuestionIdList,
      selectedCategoryIdList,
    };
  }
}
