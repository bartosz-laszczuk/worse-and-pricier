import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import {
  EditQuestionFormValue,
  Question,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
import { lastValueFrom, Observable, take } from 'rxjs';
import { CreateQuestionRequest, UpdateQuestionRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class QuestionRepositoryService {
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

  public async createQuestion(request: CreateQuestionRequest): Promise<string> {
    const docRef = await addDoc(this.questionsCollection, request);
    return docRef.id;
  }

  public async createQuestions(
    requests: CreateQuestionRequest[]
  ): Promise<string[]> {
    const batch = writeBatch(this.afDb);
    const createdIds: string[] = [];

    requests.forEach((request) => {
      const newDocRef = doc(this.questionsCollection);
      batch.set(newDocRef, request);
      createdIds.push(newDocRef.id);
    });

    await batch.commit();
    return createdIds;
  }

  public async deleteQuestion(questionId: string): Promise<void> {
    const questionDoc = doc(this.afDb, `questions/${questionId}`);
    return await deleteDoc(questionDoc);
  }

  public updateQuestion(
    questionId: string,
    data: EditQuestionFormValue
  ): Promise<void> {
    const request: UpdateQuestionRequest = {
      id: questionId,
      question: data.question,
      answer: data.answer,
      answerPl: data.answerPl,
      categoryId: data.categoryId,
      qualificationId: data.qualificationId ?? null,
      isActive: data.isActive,
    };
    const questionDoc = doc(this.afDb, `questions/${questionId}`);
    return updateDoc(questionDoc, { ...request });
  }

  public async updateQuestions(
    requests: UpdateQuestionRequest[]
  ): Promise<void> {
    const batch = writeBatch(this.afDb);

    requests.forEach(({ id, ...data }) => {
      const questionDoc = doc(this.afDb, `questions/${id}`);
      batch.update(questionDoc, data);
    });

    await batch.commit();
  }

  public async removeCategoryIdFromQuestions(
    categoryId: string,
    userId: string
  ): Promise<void> {
    const questionsQuery = query(
      this.questionsCollection,
      where('userId', '==', userId),
      where('categoryId', '==', categoryId)
    );

    const snapshot = await getDocs(questionsQuery);

    const batch = writeBatch(this.afDb);
    snapshot.forEach((docSnap) => {
      const questionRef = doc(this.afDb, `questions/${docSnap.id}`);
      batch.update(questionRef, { categoryId: null });
    });

    await batch.commit();
  }

  public async removeQualificationIdFromQuestions(
    qualificationId: string,
    userId: string
  ): Promise<void> {
    const questionsQuery = query(
      this.questionsCollection,
      where('userId', '==', userId),
      where('qualificationId', '==', qualificationId)
    );

    const snapshot = await getDocs(questionsQuery);

    const batch = writeBatch(this.afDb);
    snapshot.forEach((docSnap) => {
      const questionRef = doc(this.afDb, `questions/${docSnap.id}`);
      batch.update(questionRef, { qualificationId: null });
    });

    await batch.commit();
  }
}
