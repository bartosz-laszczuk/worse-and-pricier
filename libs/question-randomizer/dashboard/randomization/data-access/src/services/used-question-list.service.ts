import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  CollectionReference,
} from '@angular/fire/firestore';
import { UsedQuestion } from '@my-nx-monorepo/question-randomizer-dashboard-randomization-util';

@Injectable({
  providedIn: 'root',
})
export class UsedQuestionListService {
  private usedQuestionsCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.usedQuestionsCollection = collection(this.firestore, 'usedQuestions');
  }

  async addQuestionToUsedQuestions(
    data: Omit<UsedQuestion, 'id'>
  ): Promise<UsedQuestion> {
    const docRef = await addDoc(this.usedQuestionsCollection, data);
    return {
      id: docRef.id,
      ...data,
    };
  }

  async deleteQuestionFromUsedQuestions(
    questionId: string,
    randomizationId: string
  ): Promise<void> {
    const q = query(
      this.usedQuestionsCollection,
      where('questionId', '==', questionId),
      where('randomizationId', '==', randomizationId)
    );

    const snapshot = await getDocs(q);
    const deletions = snapshot.docs.map((docSnap) =>
      deleteDoc(doc(this.usedQuestionsCollection, docSnap.id))
    );

    await Promise.all(deletions);
  }

  async getUsedQuestionList(randomizationId: string): Promise<UsedQuestion[]> {
    const q = query(
      this.usedQuestionsCollection,
      where('randomizationId', '==', randomizationId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as UsedQuestion[];
  }
}
