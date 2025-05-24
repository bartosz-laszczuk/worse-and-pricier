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
  updateDoc,
} from '@angular/fire/firestore';
import {
  PostponedQuestion,
  QuestionCategory,
} from '@my-nx-monorepo/question-randomizer-dashboard-randomization-util';
import { orderBy, serverTimestamp, writeBatch } from 'firebase/firestore';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostponedQuestionListRepositoryService {
  private postponedQuestionsCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.postponedQuestionsCollection = collection(
      this.firestore,
      'postponedQuestions'
    );
  }

  async addQuestionToPostponedQuestions(
    randomizationId: string,
    postponedQuestion: PostponedQuestion
  ): Promise<string> {
    const docRef = await addDoc(this.postponedQuestionsCollection, {
      ...postponedQuestion,
      randomizationId,
      created: serverTimestamp(),
    });
    return docRef.id;
  }

  async updatePostponedQuestionCreateDate(questionId: string): Promise<void> {
    const q = query(
      this.postponedQuestionsCollection,
      where('questionId', '==', questionId)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      await updateDoc(doc.ref, {
        created: serverTimestamp(),
      });
    }
  }

  async deleteQuestionFromPostponedQuestions(
    randomizationId: string,
    questionId: string
  ): Promise<void> {
    const q = query(
      this.postponedQuestionsCollection,
      where('questionId', '==', questionId),
      where('randomizationId', '==', randomizationId)
    );

    const snapshot = await getDocs(q);
    const deletions = snapshot.docs.map((docSnap) =>
      deleteDoc(doc(this.postponedQuestionsCollection, docSnap.id))
    );

    await Promise.all(deletions);
  }

  async getPostponedQuestionIdListForRandomization(
    randomizationId: string
  ): Promise<PostponedQuestion[]> {
    const q = query(
      this.postponedQuestionsCollection,
      where('randomizationId', '==', randomizationId),
      orderBy('created', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const { questionId, categoryId } = docSnap.data();
      return { questionId, categoryId };
    });
  }

  async deleteAllPostponedQuestionsFromRandomization(
    randomizationId: string
  ): Promise<void> {
    const q = query(
      this.postponedQuestionsCollection,
      where('randomizationId', '==', randomizationId)
    );

    const snapshot = await getDocs(q);

    const batch = writeBatch(this.firestore);
    snapshot.docs.forEach((docSnap) => {
      batch.delete(doc(this.postponedQuestionsCollection, docSnap.id));
    });

    await batch.commit();
  }

  async deleteQuestionsFromPostponedQuestionsByCategoryId(
    randomizationId: string,
    categoryId: string
  ): Promise<void> {
    const q = query(
      this.postponedQuestionsCollection,
      where('randomizationId', '==', randomizationId),
      where('categoryId', '==', categoryId)
    );

    const snapshot = await getDocs(q);

    const batch = writeBatch(this.firestore);
    snapshot.docs.forEach((docSnap) => {
      batch.delete(doc(this.postponedQuestionsCollection, docSnap.id));
    });

    await batch.commit();
  }

  async updatePostponedQuestionCategoryId(
    newQuestionCategory: QuestionCategory
  ): Promise<void> {
    const q = query(
      this.postponedQuestionsCollection,
      where('questionId', '==', newQuestionCategory.questionId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return;
    }

    const batch = writeBatch(this.firestore);

    snapshot.docs.forEach((docSnap) => {
      const docRef = doc(this.postponedQuestionsCollection, docSnap.id);
      batch.update(docRef, {
        categoryId: newQuestionCategory.categoryId || null,
      });
    });

    await batch.commit();
  }
}
