import { inject, Injectable } from '@angular/core';
import {
  QuestionCsvListItem,
  QuestionListService,
  QuestionListStore,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';

@Injectable()
export class QuestionListImportService {
  private readonly questionListStore = inject(QuestionListStore);
  private readonly questionListService = inject(QuestionListService);

  public importQuestionList(entities: QuestionCsvListItem[]) {
    // this.questionListService.createQuestionByImport()
  }

  public parseCsvFile(file: File): Promise<QuestionCsvListItem[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);

      reader.onload = () => {
        try {
          const csvText = reader.result as string;
          const recordsArray = csvText.split(/\r\n|\n/);
          const parsed = this.parseCsvRecords(recordsArray);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      };

      reader.onerror = () => reject('Error reading file');
    });
  }

  private parseCsvRecords(lines: string[]): QuestionCsvListItem[] {
    const result: QuestionCsvListItem[] = [];

    for (let i = 2; i < lines.length; i++) {
      const fields = lines[i].split(';');
      if (fields.length < 6) {
        console.error(
          'Import error: field number in a row is lowe than 6. Row index:',
          i
        );
        continue;
      } // Skip malformed rows

      result.push({
        question: fields[0].trim(),
        answer: fields[1].trim(),
        answerPl: fields[2].trim(),
        categoryName: fields[3].trim(),
        qualificationName: fields[4]?.trim(),
        isActive: fields[5] === 'true',
      });
    }

    return result;
  }
}
