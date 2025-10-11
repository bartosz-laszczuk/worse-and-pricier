import { FieldValue } from '@angular/fire/firestore';
import { RandomizationStatus } from '@worse-and-pricier/question-randomizer-dashboard-shared-util';

export interface GetRandomizationResponse {
  id: string;
  currentQuestionId?: string;
  showAnswer: boolean;
  status: RandomizationStatus;
  userId: string;
  created: FieldValue;
}

export interface CreateRandomzationRequest {
  showAnswer: boolean;
  status: RandomizationStatus;
  currentQuestionId?: string;
  created: FieldValue;
  userId: string;
}

export interface UpdateRandomzationRequest {
  showAnswer: boolean;
  status: RandomizationStatus;
  currentQuestionId: string | null;
}
