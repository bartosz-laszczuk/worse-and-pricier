import { QuestionCsvListItem } from '@worse-and-pricier/question-randomizer-dashboard-shared-data-access';
import {
  Category,
  Qualification,
  Question,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-util';

export interface CreateAndUpdateQuestionsContext {
  importItemList: QuestionCsvListItem[];
  questionDic: Record<string, Question>;
  categoryDic: Record<string, Category>;
  qualificationDic: Record<string, Qualification>;
  userId: string;
}
