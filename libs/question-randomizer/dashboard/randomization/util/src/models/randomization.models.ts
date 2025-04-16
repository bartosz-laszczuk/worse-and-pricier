import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';

export interface Randomization {
  id: string;
  currentQuestion?: Question;
  isAnswerHidden: boolean;
  status: RandomizationStatus;
  usedQuestionIdList: string[];
  selectedCategoryIdList: string[];
}

export enum RandomizationStatus {
  Ongoing = 1,
  Finished = 2,
}
