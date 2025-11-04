import { Injectable } from '@angular/core';
import { GetRandomizationResponse } from '../models';
import { Question } from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
import {
  PostponedQuestion,
  Randomization,
  UsedQuestion,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-util';

@Injectable({ providedIn: 'root' })
export class RandomizationMapperService {
  public mapGetRandomizationResponseToRandomization(
    response: GetRandomizationResponse,
    usedQuestionList: UsedQuestion[],
    postponedQuestionList: PostponedQuestion[],
    selectedCategoryIdList: string[],
    questionDic: Record<string, Question>,
    currentQuestion?: Question
  ): Randomization {
    const usedQuestionIdSet = new Set(
      usedQuestionList.map((uq) => uq.questionId)
    );
    const postponedQuestionIdSet = new Set(
      postponedQuestionList.map((pq) => pq.questionId)
    );
    const availableQuestionList = Object.values(questionDic)
      .filter(
        (question) =>
          !usedQuestionIdSet.has(question.id) &&
          !postponedQuestionIdSet.has(question.id)
      )
      .map((q) => ({ questionId: q.id, categoryId: q.categoryId }));

    return {
      id: response.id,
      status: response.status,
      showAnswer: response.showAnswer,
      currentQuestion,
      usedQuestionList,
      postponedQuestionList,
      selectedCategoryIdList,
      availableQuestionList,
    };
  }
}
