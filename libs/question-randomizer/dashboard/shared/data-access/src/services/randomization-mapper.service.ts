import { Injectable } from '@angular/core';
import { GetRandomizationResponse } from '../models';
import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import {
  PostponedQuestion,
  Randomization,
  UsedQuestion,
} from '@my-nx-monorepo/question-randomizer-dashboard-randomization-util';

@Injectable({ providedIn: 'root' })
export class RandomizationMapperService {
  public mapGetRandomizationResopnseToRandomization(
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
          question.isActive &&
          question.categoryId &&
          selectedCategoryIdList.includes(question.categoryId) &&
          !usedQuestionIdSet.has(question.id) &&
          !postponedQuestionIdSet.has(question.id)
          // && question.id !== currentQuestion?.id
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
