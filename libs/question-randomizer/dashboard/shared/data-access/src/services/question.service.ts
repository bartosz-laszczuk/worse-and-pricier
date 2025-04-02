import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { lastValueFrom, Observable, take } from 'rxjs';
import { CreateQuestionRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private readonly afDb = inject(Firestore);

  private questionsCollection = collection(this.afDb, 'questions');

  public getQuestionById(questionId: string): Promise<Question | undefined> {
    const questionDoc = doc(this.afDb, `questions/${questionId}`);
    return getDoc(questionDoc).then((snapshot) => {
      return snapshot.exists()
        ? ({ id: snapshot.id, ...snapshot.data() } as Question)
        : undefined;
    });
  }

  public getQuestions(userId: string): Promise<Question[]> {
    const questionsQuery = query(
      this.questionsCollection,
      where('userId', '==', userId)
    );
    return lastValueFrom(
      (
        collectionData(questionsQuery, { idField: 'id' }) as Observable<
          Question[]
        >
      ).pipe(take(1))
    );
  }

  public async createQuestion(
    question: Question,
    userId: string
  ): Promise<string> {
    const request: CreateQuestionRequest = {
      name: question.name,
      userId,
    };
    const docRef = await addDoc(this.questionsCollection, request);
    return docRef.id;
  }

  public async deleteQuestion(questionId: string): Promise<void> {
    const questionDoc = doc(this.afDb, `questions/${questionId}`);
    return await deleteDoc(questionDoc);
  }

  public updateQuestion(
    questionId: string,
    data: Partial<Question>
  ): Promise<void> {
    const questionDoc = doc(this.afDb, `questions/${questionId}`);
    return updateDoc(questionDoc, data);
  }
}
