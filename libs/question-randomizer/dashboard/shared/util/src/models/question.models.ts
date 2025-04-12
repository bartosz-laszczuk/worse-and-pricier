export interface Question {
  id: string;
  question: string;
  answer: string;
  answerPl: string;
  categoryName?: string;
  categoryId?: string;
  qualificationName?: string;
  qualificationId?: string;
  isActive: boolean;
  userId: string;
}

export interface EditQuestionFormValue {
  question: string;
  answer: string;
  answerPl: string;
  categoryId: string;
  categoryName: string;
  qualificationId?: string;
  qualificationName?: string;
  isActive: boolean;
}
