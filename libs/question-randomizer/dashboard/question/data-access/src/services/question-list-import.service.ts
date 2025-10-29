import { inject, Injectable } from '@angular/core';
import {
  CategoryListStore,
  CategoryRepositoryService,
  CreateQuestionRequest,
  QualificationListStore,
  QualificationRepositoryService,
  QuestionCsvListItem,
  QuestionListService,
  QuestionListStore,
  QuestionMapperService,
  QuestionRepositoryService,
  RandomizationStore,
  UpdateQuestionRequest,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-data-access';
import {
  Category,
  Qualification,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
import { UserStore } from '@worse-and-pricier/question-randomizer-shared-data-access';
import { CreateAndUpdateQuestionsContext } from '../models/question-list-import.models';
import * as Papa from 'papaparse';

@Injectable()
export class QuestionListImportService {
  private readonly questionListStore = inject(QuestionListStore);
  private readonly questionListService = inject(QuestionListService);
  private readonly categoryListStore = inject(CategoryListStore);
  private readonly qualificationListStore = inject(QualificationListStore);
  private readonly questionMapperService = inject(QuestionMapperService);
  private readonly randomizationStore = inject(RandomizationStore);
  private readonly questionRepositoryService = inject(
    QuestionRepositoryService
  );
  private readonly categoryRepositoryService = inject(
    CategoryRepositoryService
  );
  private readonly qualificationRepositoryService = inject(
    QualificationRepositoryService
  );
  private readonly userStore = inject(UserStore);

  public async importQuestionList(importItemList: QuestionCsvListItem[]) {
    console.log(importItemList, 'importItemList');
    const userId = this.userStore.uid();
    const categoryDic = this.categoryListStore.entities();
    const qualificationDic = this.qualificationListStore.entities();
    const questionDic = this.questionListStore.entities();
    if (!categoryDic || !qualificationDic || !userId || !questionDic) return;

    await Promise.all([
      this.createMissingCategories(importItemList, categoryDic, userId),
      this.createMissingQualifications(
        importItemList,
        qualificationDic,
        userId
      ),
    ]);

    await this.createAndUpdateQuestions({
      importItemList,
      questionDic,
      categoryDic,
      qualificationDic,
      userId,
    });

    this.questionListService.loadQuestionList(
      categoryDic,
      qualificationDic,
      true
    );
    this.randomizationStore.clearRandomization();
  }

  public parseCsvFile(file: File): Promise<QuestionCsvListItem[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);

      reader.onload = () => {
        try {
          const csvText = reader.result as string;

          const parsedCsv = Papa.parse<string[]>(csvText, {
            delimiter: '[;]',
            skipEmptyLines: true,
            quoteChar: '"',
            escapeChar: '"',
          });

          const allRows = parsedCsv.data;

          // Skip sep=; and header row (assumed to be first 2 lines)
          const contentRows = allRows.slice(2);
          console.log('contentRows', contentRows);
          const result: QuestionCsvListItem[] = contentRows
            .map((row: string[], index: number) => {
              if (row.length < 6) {
                console.error(
                  'Import error: field number in a row is lower than 6. Row index:',
                  index + 2,
                  row
                );
                return null;
              }

              return {
                question: row[0].trim(),
                answer: row[1].trim(),
                answerPl: row[2].trim(),
                categoryName: row[3].trim(),
                qualificationName: row[4]?.trim() || '',
                isActive: row[5].trim().toLowerCase() === 'true',
              };
            })
            .filter((r: QuestionCsvListItem | null): r is QuestionCsvListItem => r !== null);

          resolve(result);
        } catch (e) {
          reject(e);
        }
      };

      reader.onerror = () => reject('Error reading file');
    });
  }

  private async createAndUpdateQuestions(
    context: CreateAndUpdateQuestionsContext
  ) {
    const {
      importItemList,
      questionDic,
      categoryDic,
      qualificationDic,
      userId,
    } = context;
    const questionListToCreate: CreateQuestionRequest[] = [];
    const questionListToUpdate: UpdateQuestionRequest[] = [];

    const existingQuestionMap = new Map(
      Object.values(questionDic).map((q) => [q.question, q])
    );
    const categoriesMap = new Map(
      Object.values(categoryDic).map((c) => [c.name, c])
    );
    const qualificationMap = new Map(
      Object.values(qualificationDic).map((q) => [q.name, q])
    );

    for (const importItem of importItemList) {
      const existingQuestion = existingQuestionMap.get(importItem.question);
      if (existingQuestion) {
        const updateQuestionRequest =
          this.questionMapperService.mapQuestionCsvListItemToUpdateQuestionRequest(
            importItem,
            existingQuestion.id,
            categoriesMap,
            qualificationMap
          );
        questionListToUpdate.push(updateQuestionRequest);
      } else {
        const createQuestionRequest =
          this.questionMapperService.mapQuestionCsvListItemToCreateQuestionRequest(
            importItem,
            userId,
            categoriesMap,
            qualificationMap
          );
        questionListToCreate.push(createQuestionRequest);
      }
    }

    try {
      const updatePromise = questionListToUpdate.length
        ? this.questionRepositoryService.updateQuestions(questionListToUpdate)
        : Promise.resolve();

      const createPromise = questionListToCreate.length
        ? this.questionRepositoryService.createQuestions(questionListToCreate)
        : Promise.resolve();

      await Promise.all([createPromise, updatePromise]);
    } catch (error: unknown) {
      console.error(
        error instanceof Error ? error.message : 'Import update and create Questions failed'
      );
    }
  }

  private async createMissingCategories(
    importItemList: QuestionCsvListItem[],
    categoryDic: Record<string, Category>,
    userId: string
  ) {
    const missingCategories = this.getMissingCategories(
      importItemList,
      categoryDic
    );

    if (missingCategories.length > 0) {
      const newCategoryList =
        await this.categoryRepositoryService.createCategoriesByNameList(
          missingCategories,
          userId
        );
      if (newCategoryList.length > 0) {
        this.categoryListStore.addCategoryListToStoreList(newCategoryList);
        newCategoryList.forEach(
          (category) => (categoryDic[category.id] = category)
        );
      }
    }
  }

  private async createMissingQualifications(
    importItemList: QuestionCsvListItem[],
    qualificationDic: Record<string, Qualification>,
    userId: string
  ) {
    const missingQualifications = this.getMissingQualifications(
      importItemList,
      qualificationDic
    );

    if (missingQualifications.length > 0) {
      const newQualificationList =
        await this.qualificationRepositoryService.createQualificationByNameList(
          missingQualifications,
          userId
        );
      if (newQualificationList.length > 0) {
        this.qualificationListStore.addQualificationListToStoreList(
          newQualificationList
        );
        newQualificationList.forEach(
          (qualification) =>
            (qualificationDic[qualification.id] = qualification)
        );
      }
    }
  }

  private getMissingCategories(
    importItemList: QuestionCsvListItem[],
    categoryDic: Record<string, Category>
  ) {
    const missingCategories = importItemList
      .filter(
        (item) =>
          !Object.values(categoryDic).some(
            (cat) => cat.name === item.categoryName
          ) && !!item.categoryName
      )
      .map((item) => item.categoryName);

    return Array.from(new Set(missingCategories));
  }

  private getMissingQualifications(
    importItemList: QuestionCsvListItem[],
    qualificationDic: Record<string, Qualification>
  ) {
    const missingQualifications = importItemList
      .filter(
        (item) =>
          !Object.values(qualificationDic).some(
            (qual) => qual.name === item.qualificationName
          ) && !!item.qualificationName
      )
      .map((item) => item.qualificationName);

    return Array.from(new Set(missingQualifications));
  }
}
