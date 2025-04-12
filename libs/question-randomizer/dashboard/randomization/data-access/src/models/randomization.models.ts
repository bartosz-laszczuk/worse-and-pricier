import { FieldValue } from '@angular/fire/firestore';
import { RandomizationStatus } from '@my-nx-monorepo/question-randomizer-dashboard-randomization-util';

export interface GetRandomizationResponse {
  id: string;
  currentQuestionId?: string;
  isAnswerHidden: boolean;
  status: RandomizationStatus;
  userId: string;
  created: FieldValue;
}
