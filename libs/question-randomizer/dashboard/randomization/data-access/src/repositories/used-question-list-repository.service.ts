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
import { serverTimestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class UsedQuestionListRepositoryService {
  private usedQuestionsCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.usedQuestionsCollection = collection(this.firestore, 'usedQuestions');
  }

  async addQuestionToUsedQuestions(
    randomizationId: string,
    questionId: string
  ): Promise<string> {
    const docRef = await addDoc(this.usedQuestionsCollection, {
      randomizationId,
      questionId,
      created: serverTimestamp(),
    });
    return docRef.id;
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

  async getUsedQuestionIdListForRandomization(
    randomizationId: string
  ): Promise<string[]> {
    const q = query(
      this.usedQuestionsCollection,
      where('randomizationId', '==', randomizationId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (docSnap) => docSnap.data()['questionId']
    ) as string[];
  }
}
