import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  deleteField,
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
  Question,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
import { lastValueFrom, Observable, take } from 'rxjs';
import { CreateQuestionRequest, UpdateQuestionRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class QuestionRepository {
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
    request: UpdateQuestionRequest
  ): Promise<void> {
    const questionDoc = doc(this.afDb, `questions/${questionId}`);
    const { id, tags, ...updateData } = request;

    // If tags is undefined, explicitly delete the field from Firestore
    // Otherwise, Firestore would ignore undefined and leave the existing value
    const tagsUpdate = tags === undefined ? deleteField() : tags;

    return updateDoc(questionDoc, {
      ...updateData,
      tags: tagsUpdate,
    });
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
