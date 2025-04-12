export interface CreateQuestionRequest {
  question: string;
  answer: string;
  answerPl: string;
  categoryId: string;
  qualificationId: string | null;
  isActive: boolean;
  userId: string;
}

export interface UpdateQuestionRequest {
  question: string;
  answer: string;
  answerPl: string;
  categoryId: string;
  qualificationId: string | null;
  isActive: boolean;
}
