export interface QuestionCsvListItem {
  question: string;
  answer: string;
  answerPl: string;
  categoryName: string;
  qualificationName: string;
  isActive: boolean;
  tags?: string;
  [key: string]: string | boolean | undefined;
}

export interface CreateQuestionRequest {
  question: string;
  answer: string;
  answerPl: string;
  categoryId: string;
  qualificationId: string | null;
  isActive: boolean;
  userId: string;
  tags?: string[];
}

export interface UpdateQuestionRequest {
  id: string;
  question: string;
  answer: string;
  answerPl: string;
  categoryId: string;
  qualificationId: string | null;
  isActive: boolean;
  tags?: string[];
}
