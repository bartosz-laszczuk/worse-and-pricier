import { Question } from '@worse-and-pricier/question-randomizer-dashboard-shared-util';

export interface Randomization {
  id: string;
  currentQuestion?: Question;
  showAnswer: boolean;
  status: RandomizationStatus;
  usedQuestionList: UsedQuestion[];
  postponedQuestionList: PostponedQuestion[];
  availableQuestionList: AvailableQuestion[];
  selectedCategoryIdList: string[];
}

export type PostponedQuestion = QuestionCategory;

export type AvailableQuestion = QuestionCategory;

export type UsedQuestion = QuestionCategory;

export interface QuestionCategory {
  questionId: string;
  categoryId?: string;
}

export enum RandomizationStatus {
  Ongoing = 1,
  Finished = 2,
}
