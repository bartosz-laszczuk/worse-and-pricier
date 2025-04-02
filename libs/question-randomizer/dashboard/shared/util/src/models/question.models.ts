export interface Question {
  id: string;
  question: string;
  answer: string;
  answerPl: string;
  categoryId: string;
  qualificationId?: string;
  isActive: boolean;
  userId: string;
}
