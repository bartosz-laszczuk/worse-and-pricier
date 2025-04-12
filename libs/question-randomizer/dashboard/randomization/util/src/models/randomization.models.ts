import { FieldValue } from 'firebase/firestore';
import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';

export interface Randomization {
  id: string;
  currentQuestion?: Question;
  isAnswerHidden: boolean;
  status: RandomizationStatus;
  created: FieldValue;
}

export interface UsedQuestion {
  id: string;
  questionId: string;
  randomizationId: string;
  created: FieldValue;
}

export interface SelectedCategory {
  id: string;
  categoryId: string;
  randomizationId: string;
  created: FieldValue;
}

export enum RandomizationStatus {
  Ongoing = 1,
  Finished = 2,
}
