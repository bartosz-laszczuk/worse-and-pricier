import { Injectable } from '@angular/core';
import { QuestionCsvListItem } from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import {
  Category,
  Qualification,
  Question,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';

@Injectable()
export class QuestionListExportService {
  public exportQuestionList(
    questionList: Record<string, Question>,
    categoryDic: Record<string, Category>,
    qualificationDic: Record<string, Qualification>
  ) {
    const questionExportList = [] as QuestionCsvListItem[];

    Object.values(questionList).forEach((question) => {
      questionExportList.push({
        question: question.question,
        answer: question.answer,
        answerPl: question.answerPl,
        categoryName: question.categoryId
          ? categoryDic[question.categoryId]?.name ?? ''
          : '',
        qualificationName: question.qualificationId
          ? qualificationDic[question.qualificationId]?.name ?? ''
          : '',
        isActive: question.isActive ?? true,
      });
    });
    console.log('questionExportList', questionExportList);
    const fileName = `${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '')}_questions`;
    // or solution below:
    // const now = new Date();
    // const fileName = `${now.getFullYear()}${(now.getMonth() + 1)
    //   .toString()
    //   .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_questions`;
    const headers = [
      'Question',
      'Answer',
      'AnswerPl',
      'Type',
      'Qualification',
      'IsActive',
    ];
    exportToCsv(fileName, questionExportList, headers);
  }
}

export const exportToCsv = (
  filename: string,
  rows: object[],
  headers?: string[]
): void => {
  if (!rows || !rows.length) {
    return;
  }
  const separator = ';';

  const keys: string[] = Object.keys(rows[0]);

  let columHearders: string[];

  if (headers) {
    columHearders = headers;
  } else {
    columHearders = keys;
  }

  const csvContent =
    'sep=;\n' +
    columHearders.join(separator) +
    '\n' +
    rows
      .map((row: any) => {
        return keys
          .map((k) => {
            let cell = row[k] ?? '';
            // if (typeof cell === 'string' && cell.includes(separator)) {
            //   cell = `"${cell}"`;
            // }
            cell = escapeCsvValue(cell);
            return cell;
          })
          .join(separator);
      })
      .join('\n');
  console.log('rows', rows);
  console.log('csvContent', csvContent);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    // Browsers that support HTML5 download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const escapeCsvValue = (value: any, separator = ';') => {
  if (value == null) return '';
  let cell = String(value);
  const needsQuotes =
    cell.includes(separator) ||
    cell.includes('"') ||
    cell.includes('\n') ||
    cell.includes('\r');

  if (needsQuotes) {
    // Escape inner quotes by doubling them
    cell = `"${cell.replace(/"/g, '""')}"`;
  }

  return cell;
};
