export interface Question {
  id: string;
  question: string;
  answer: string;
  answerPl: string;
  category: string;
  categoryId: string;
  qualification?: string;
  qualificationId?: string;
  isActive: boolean;
  userId: string;
}
