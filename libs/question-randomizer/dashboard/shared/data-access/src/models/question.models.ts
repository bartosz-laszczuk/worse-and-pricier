export interface CreateQuestionRequest {
  question: string;
  answer: string;
  answerPl: string;
  categoryId: string;
  qualificationId?: string;
  isActive: boolean;
  userId: string;
}
