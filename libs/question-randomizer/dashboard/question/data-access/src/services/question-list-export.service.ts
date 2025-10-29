import { Injectable } from '@angular/core';
import { QuestionCsvListItem } from '@worse-and-pricier/question-randomizer-dashboard-shared-data-access';
import {
  Category,
  Qualification,
  Question,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-util';

@Injectable()
export class QuestionListExportService {
  public exportQuestionList(
    questionList: Record<string, Question>,
    categoryDic: Record<string, Category>,
    qualificationDic: Record<string, Qualification>
  ) {
    const questionExportList: QuestionCsvListItem[] = Object.values(
      questionList
    ).map((question) => ({
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
    }));

    const fileName = `${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '')}_questions`;

    const headers = [
      'Question',
      'Answer',
      'AnswerPl',
      'Category',
      'Qualification',
      'IsActive',
    ];

    const keys = [
      'question',
      'answer',
      'answerPl',
      'categoryName',
      'qualificationName',
      'isActive',
    ];

    exportToCsv(fileName, questionExportList, headers, keys);
  }
}

export const exportToCsv = <T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  headers?: string[],
  keys?: string[]
): void => {
  if (!rows?.length) return;

  const separator = '[;]';
  const actualKeys = keys ?? Object.keys(rows[0]);
  const actualHeaders = headers ?? actualKeys;

  const csvContent =
    'sep=[;]\n' +
    actualHeaders.join(separator) +
    '\n' +
    rows
      .map((row) =>
        actualKeys
          .map((key) => escapeCsvValue((row as Record<string, unknown>)[key], separator))
          .join(separator)
      )
      .join('\n');

  // Add BOM for Excel UTF-8 compatibility
  const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const escapeCsvValue = (value: unknown, separator = ';') => {
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
